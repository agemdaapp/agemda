import { create } from 'zustand';

/**
 * STORE: agendamentoStore
 * 
 * Gerencia estado global do formulário de agendamento
 * Usado pelo componente AgendamentoForm
 * 
 * ESTADO:
 * - servico_id: UUID do serviço selecionado
 * - servico_nome: Nome do serviço (para exibição)
 * - servico_preco: Preço do serviço
 * - profissional_id: UUID do profissional selecionado
 * - profissional_nome: Nome do profissional (para exibição)
 * - data_hora: Data/hora selecionada (ISO string)
 * - cliente_nome: Nome do cliente
 * - cliente_email: Email do cliente (opcional)
 * - cliente_telefone: Telefone do cliente
 * - currentStep: Step atual (1-5)
 * 
 * AÇÕES:
 * - setServico(id, nome, preco): Define serviço selecionado
 * - setProfissional(id, nome): Define profissional selecionado
 * - setDataHora(dataHora): Define data/hora selecionada
 * - setCliente(nome, email, telefone): Define dados do cliente
 * - nextStep(): Avança para próximo step
 * - prevStep(): Volta para step anterior
 * - reset(): Reseta todo o estado
 * 
 * FLUXO DE DADOS:
 * 
 * STEP 1 → setServico() → currentStep = 2
 * STEP 2 → setProfissional() → currentStep = 3
 * STEP 3 → setDataHora() → currentStep = 4
 * STEP 4 → setCliente() → cria agendamento → currentStep = 5
 * STEP 5 → reset() ou onSuccess()
 */

interface AgendamentoState {
  // Dados do serviço
  servico_id: string | null;
  servico_nome: string | null;
  servico_preco: number | null;
  
  // Dados do profissional
  profissional_id: string | null;
  profissional_nome: string | null;
  
  // Data e hora
  data_hora: string | null;
  
  // Dados do cliente
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  
  // Step atual
  currentStep: number;
  
  // Ações
  setServico: (id: string, nome: string, preco: number) => void;
  setProfissional: (id: string, nome: string) => void;
  setDataHora: (dataHora: string) => void;
  setCliente: (nome: string, email: string, telefone: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  servico_id: null,
  servico_nome: null,
  servico_preco: null,
  profissional_id: null,
  profissional_nome: null,
  data_hora: null,
  cliente_nome: '',
  cliente_email: '',
  cliente_telefone: '',
  currentStep: 1,
};

export const useAgendamentoStore = create<AgendamentoState>((set) => ({
  ...initialState,
  
  setServico: (id, nome, preco) => set({ 
    servico_id: id, 
    servico_nome: nome, 
    servico_preco: preco,
    currentStep: 2, // Avança automaticamente
  }),
  
  setProfissional: (id, nome) => set({ 
    profissional_id: id, 
    profissional_nome: nome,
    currentStep: 3, // Avança automaticamente
  }),
  
  setDataHora: (dataHora) => set({ 
    data_hora: dataHora,
    currentStep: 4, // Avança automaticamente
  }),
  
  setCliente: (nome, email, telefone) => set({ 
    cliente_nome: nome,
    cliente_email: email,
    cliente_telefone: telefone,
  }),
  
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, 5) 
  })),
  
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 1) 
  })),
  
  reset: () => set(initialState),
}));

