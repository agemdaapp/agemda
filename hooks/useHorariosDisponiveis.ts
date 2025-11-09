'use client';

/**
 * HOOK: useHorariosDisponiveis
 * 
 * Busca horários disponíveis para um profissional em uma data
 * 
 * USO:
 * const { horarios, loading, error } = useHorariosDisponiveis(
 *   tenantId, 
 *   profissional_id, 
 *   data, 
 *   servico_id
 * );
 * 
 * RETORNO:
 * - horarios: Array de horários disponíveis
 * - loading: boolean
 * - error: string | null
 * 
 * CHAMADA:
 * POST /api/horarios-disponiveis
 * Body: { profissional_id, data, servico_id }
 * Headers: x-tenant-id
 * 
 * RETORNO DA API:
 * {
 *   sucesso: true,
 *   horarios: [
 *     { hora: "09:00", disponivel: true },
 *     { hora: "09:30", disponivel: false, motivo: "Agendado" },
 *     { hora: "10:00", disponivel: true }
 *   ],
 *   data_formatada: "15/01/2024",
 *   dia_semana: "Terça-feira",
 *   total_slots: 16,
 *   slots_disponiveis: 12
 * }
 * 
 * COMPORTAMENTO:
 * - Só busca se profissional_id, data e servico_id fornecidos
 * - Refresca automaticamente quando data muda
 * - Retorna array vazio se nenhum horário disponível
 * - Mostra loading durante busca
 */

export function useHorariosDisponiveis(
  tenantId: string | null,
  profissionalId: string | null,
  data: string | null,
  servicoId: string | null
) {
  // Implementação:
  // - useEffect para buscar quando qualquer parâmetro muda
  // - useState para horarios, loading, error
  // - fetch para POST /api/horarios-disponiveis
  // - Retorna { horarios, loading, error }
  // - Só busca se todos os parâmetros fornecidos
  
  return {
    horarios: [],
    loading: false,
    error: null,
  };
}

