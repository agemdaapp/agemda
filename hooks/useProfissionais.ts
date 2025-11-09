'use client';

/**
 * HOOK: useProfissionais
 * 
 * Busca profissionais do tenant, filtrados por serviço
 * 
 * USO:
 * const { profissionais, loading, error } = useProfissionais(tenantId, servico_id);
 * 
 * RETORNO:
 * - profissionais: Array de profissionais
 * - loading: boolean
 * - error: string | null
 * 
 * CHAMADA:
 * GET /api/profissionais?servico_id=xxx
 * Headers: x-tenant-id
 * 
 * RETORNO DA API:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string,
 *       nome: string,
 *       foto_url: string | null,
 *       ativo: boolean,
 *       servicos_count: number
 *     }
 *   ]
 * }
 * 
 * FILTRO AUTOMÁTICO:
 * - API já retorna apenas profissionais que fazem aquele serviço
 * - Não precisa filtrar no frontend
 */

export function useProfissionais(tenantId: string | null, servicoId: string | null) {
  // Implementação:
  // - useEffect para buscar quando tenantId ou servicoId muda
  // - useState para profissionais, loading, error
  // - fetch para GET /api/profissionais?servico_id=xxx
  // - Retorna { profissionais, loading, error }
  // - Só busca se servicoId fornecido
  
  return {
    profissionais: [],
    loading: false,
    error: null,
  };
}

