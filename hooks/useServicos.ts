'use client';

import { useState, useEffect } from 'react';

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  buffer_minutos_antes: number;
  buffer_minutos_depois: number;
}

export function useServicos(tenantId: string | null) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setServicos([]);
      return;
    }

    const fetchServicos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/servicos', {
          headers: {
            'x-tenant-id': tenantId,
          },
        });

        const data = await response.json();

        if (data.success) {
          setServicos(data.data || []);
        } else {
          setError(data.message || 'Erro ao buscar serviços');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar serviços');
      } finally {
        setLoading(false);
      }
    };

    fetchServicos();
  }, [tenantId]);

  return { servicos, loading, error };
}
