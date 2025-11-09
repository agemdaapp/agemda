'use client';

import { useState } from 'react';

interface CriarAgendamentoData {
  cliente_nome: string;
  cliente_email?: string;
  cliente_telefone: string;
  profissional_id: string;
  servico_id: string;
  data_hora: string; // ISO 8601
}

interface CriarAgendamentoResponse {
  sucesso: boolean;
  agendamento_id?: string;
  mensagem?: string;
  cliente_confirmacao_url?: string;
}

export function useAgendamento(tenantId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarAgendamento = async (dados: CriarAgendamentoData): Promise<CriarAgendamentoResponse> => {
    if (!tenantId) {
      throw new Error('Tenant ID não fornecido');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agendamentos/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(dados),
      });

      const data: CriarAgendamentoResponse = await response.json();

      if (!data.sucesso) {
        setError(data.mensagem || 'Erro ao criar agendamento');
        return data;
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar agendamento';
      setError(errorMessage);
      return {
        sucesso: false,
        mensagem: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { criarAgendamento, loading, error };
}
