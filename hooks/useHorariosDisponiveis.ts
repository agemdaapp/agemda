'use client';

import { useState, useEffect } from 'react';

interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
  motivo?: string;
}

interface HorariosDisponiveisResponse {
  sucesso: boolean;
  horarios: HorarioDisponivel[];
  data_formatada?: string;
  dia_semana?: string;
  total_slots?: number;
  slots_disponiveis?: number;
}

export function useHorariosDisponiveis(
  tenantId: string | null,
  profissionalId: string | null,
  data: string | null,
  servicoId: string | null
) {
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId || !profissionalId || !data || !servicoId) {
      setHorarios([]);
      return;
    }

    const fetchHorarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/horarios-disponiveis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId,
          },
          body: JSON.stringify({
            profissional_id: profissionalId,
            data: data,
            servico_id: servicoId,
          }),
        });

        const responseData: HorariosDisponiveisResponse = await response.json();

        if (responseData.sucesso) {
          setHorarios(responseData.horarios || []);
        } else {
          setError('Erro ao buscar horários disponíveis');
          setHorarios([]);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar horários disponíveis');
        setHorarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [tenantId, profissionalId, data, servicoId]);

  return { horarios, loading, error };
}
