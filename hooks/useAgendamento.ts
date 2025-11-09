'use client';

/**
 * HOOK: useAgendamento
 * 
 * Cria agendamento
 * 
 * USO:
 * const { criarAgendamento, loading, error } = useAgendamento(tenantId);
 * 
 * await criarAgendamento({
 *   cliente_nome,
 *   cliente_email,
 *   cliente_telefone,
 *   profissional_id,
 *   servico_id,
 *   data_hora
 * });
 * 
 * RETORNO:
 * - criarAgendamento: função async
 * - loading: boolean
 * - error: string | null
 * 
 * CHAMADA:
 * POST /api/agendamentos/criar
 * Body: { cliente_nome, cliente_email, cliente_telefone, profissional_id, servico_id, data_hora }
 * Headers: x-tenant-id
 * 
 * RETORNO DA API (Sucesso):
 * {
 *   sucesso: true,
 *   agendamento_id: "uuid",
 *   mensagem: "Agendamento criado com sucesso",
 *   cliente_confirmacao_url: "https://..."
 * }
 * 
 * RETORNO DA API (Erro):
 * {
 *   sucesso: false,
 *   mensagem: "Horário não disponível"
 * }
 * 
 * TRATAMENTO DE ERROS:
 * - Se horário não disponível: mostrar mensagem e permitir voltar
 * - Se rede falhar: retry automático (3 tentativas)
 * - Se erro do servidor: mostrar mensagem genérica
 */

export function useAgendamento(tenantId: string | null) {
  // Implementação:
  // - useState para loading, error
  // - Função criarAgendamento que:
  //   a) Valida dados
  //   b) Faz POST /api/agendamentos/criar
  //   c) Retorna agendamento_id se sucesso
  //   d) Lança erro se falhar
  // - Retorna { criarAgendamento, loading, error }
  
  return {
    criarAgendamento: async (dados: any) => {
      // Placeholder
    },
    loading: false,
    error: null,
  };
}

