'use client';

/**
 * COMPONENTE: AgendamentoForm
 * 
 * Componente multi-step para criação de agendamentos
 * Reutilizável em diferentes páginas (landing page, dashboard, etc)
 * 
 * ESTRUTURA:
 * - 5 steps sequenciais
 * - Estado gerenciado com Zustand
 * - Hooks customizados para buscar dados
 * - Responsivo (mobile-first)
 * - Acessível (ARIA, labels, tabindex)
 * 
 * FLUXO DOS 5 STEPS:
 * 
 * STEP 1: Escolher Serviço
 *   ↓ (servico_id selecionado)
 * STEP 2: Escolher Profissional
 *   ↓ (profissional_id selecionado)
 * STEP 3: Escolher Data e Hora
 *   ↓ (data_hora selecionada)
 * STEP 4: Confirmar Dados
 *   ↓ (dados do cliente preenchidos e validados)
 * STEP 5: Sucesso
 *   ↓ (agendamento criado)
 * 
 * PROPS:
 * - tenantId: string (obrigatório)
 * - onSuccess?: (agendamentoId: string) => void
 * - onClose?: () => void
 * 
 * ESTADO GLOBAL (Zustand):
 * - servico_id, servico_nome, servico_preco
 * - profissional_id, profissional_nome
 * - data_hora
 * - cliente_nome, cliente_email, cliente_telefone
 * - currentStep (1-5)
 * 
 * HOOKS UTILIZADOS:
 * - useServicos(tenantId) - busca serviços
 * - useProfissionais(tenantId, servico_id) - busca profissionais
 * - useHorariosDisponiveis(tenantId, profissional_id, data, servico_id) - busca horários
 * - useAgendamento() - cria agendamento
 * 
 * RESPONSIVIDADE:
 * - Mobile (375px+): 1 coluna, cards em lista
 * - Tablet (768px+): 2 colunas
 * - Desktop (1024px+): 3 colunas
 * 
 * ACESSIBILIDADE:
 * - Labels em todos inputs
 * - ARIA labels para steps
 * - Tabindex correto
 * - Tecla Enter para confirmar
 * - Feedback visual para seleções
 */

// Estrutura básica do componente (sem implementação completa)
export default function AgendamentoForm({ 
  tenantId, 
  onSuccess, 
  onClose 
}: { 
  tenantId: string; 
  onSuccess?: (agendamentoId: string) => void; 
  onClose?: () => void; 
}) {
  // Componente será implementado com:
  // - useAgendamentoStore() para estado
  // - Hooks customizados para buscar dados
  // - Renderização condicional por step
  // - Animações de transição
  // - Tratamento de erros
  
  return null; // Placeholder
}

