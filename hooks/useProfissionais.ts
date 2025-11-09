'use client';

import { useState, useEffect } from 'react';

interface Profissional {
  id: string;
  nome: string;
  foto_url: string | null;
  ativo: boolean;
  servicos_count: number;
}

export function useProfissionais(tenantId: string | null, servicoId: string | null) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setProfissionais([]);
      return;
    }

    const fetchProfissionais = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = servicoId
          ? `/api/profissionais?servico_id=${servicoId}`
          : '/api/profissionais';
        
        const response = await fetch(url, {
          headers: {
            'x-tenant-id': tenantId,
          },
        });

        const data = await response.json();

        if (data.success) {
          setProfissionais(data.data || []);
        } else {
          setError(data.message || 'Erro ao buscar profissionais');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar profissionais');
      } finally {
        setLoading(false);
      }
    };

    fetchProfissionais();
  }, [tenantId, servicoId]);

  return { profissionais, loading, error };
}
