'use client';

import { useState, useEffect } from 'react';

interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_email?: string;
  cliente_telefone: string;
  data_hora: string;
  status: string;
  servico: {
    id: string;
    nome: string;
    duracao_minutos: number;
    preco?: number;
  };
  profissional: {
    id: string;
    nome: string;
  };
}

interface UseAgendamentosParams {
  status?: string;
  profissional_id?: string;
  data_inicio?: string;
  data_fim?: string;
  limit?: number;
  offset?: number;
}

export function useAgendamentos(tenantId: string | null, params?: UseAgendamentosParams) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!tenantId) {
      setAgendamentos([]);
      return;
    }

    const fetchAgendamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.profissional_id) queryParams.append('profissional_id', params.profissional_id);
        if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
        if (params?.data_fim) queryParams.append('data_fim', params.data_fim);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const url = `/api/agendamentos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
          headers: {
            'x-tenant-id': tenantId,
          },
        });

        const data = await response.json();

        if (data.sucesso !== false) {
          setAgendamentos(data.data || []);
          setTotal(data.total || 0);
        } else {
          setError(data.mensagem || 'Erro ao buscar agendamentos');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar agendamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [tenantId, params?.status, params?.profissional_id, params?.data_inicio, params?.data_fim, params?.limit, params?.offset]);

  return { agendamentos, loading, error, total };
}

