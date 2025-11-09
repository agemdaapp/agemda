'use client';

/**
 * HOOK: useServicos
 * 
 * Busca serviços do tenant
 * 
 * USO:
 * const { servicos, loading, error } = useServicos(tenantId);
 * 
 * RETORNO:
 * - servicos: Array de serviços
 * - loading: boolean
 * - error: string | null
 * 
 * CHAMADA:
 * GET /api/servicos
 * Headers: x-tenant-id
 * 
 * RETORNO DA API:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string,
 *       nome: string,
 *       descricao: string | null,
 *       duracao_minutos: number,
 *       preco: number,
 *       buffer_antes: number,
 *       buffer_depois: number
 *     }
 *   ]
 * }
 */

export function useServicos(tenantId: string | null) {
  // Implementação:
  // - useEffect para buscar quando tenantId muda
  // - useState para servicos, loading, error
  // - fetch para GET /api/servicos
  // - Retorna { servicos, loading, error }
  
  return {
    servicos: [],
    loading: false,
    error: null,
  };
}

