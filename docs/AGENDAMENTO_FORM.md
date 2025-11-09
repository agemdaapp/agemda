# Componente AgendamentoForm - Documentação

## 📋 Visão Geral

Componente React multi-step para criação de agendamentos, responsivo e otimizado para mobile (99% dos acessos).

## 🔄 Fluxo Completo dos 5 Steps

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Escolher Serviço                                    │
│ ─────────────────────────────────────────────────────────── │
│ Título: "Qual serviço você deseja?"                         │
│                                                              │
│ Layout: Grid de cards (2 colunas mobile, 3 desktop)        │
│                                                              │
│ Cada card mostra:                                           │
│   - Nome do serviço                                         │
│   - Duração (ex: "30 min")                                  │
│   - Preço (ex: "R$ 50")                                     │
│   - Ícone (lucide-react)                                    │
│                                                              │
│ Ação: Ao clicar → setServico(id, nome, preco)              │
│       → currentStep = 2 (avança automaticamente)            │
│                                                              │
│ Dados: GET /api/servicos                                    │
│        Headers: x-tenant-id                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Escolher Profissional                                │
│ ─────────────────────────────────────────────────────────── │
│ Título: "Com quem você quer agendar?"                       │
│ Botão: "← Voltar"                                           │
│                                                              │
│ Layout: Cards em lista vertical                             │
│                                                              │
│ Cada card mostra:                                           │
│   - Foto do profissional (se tiver)                        │
│   - Nome                                                    │
│   - Número de avaliações (opcional para MVP)                │
│                                                              │
│ Filtro: APENAS profissionais que fazem aquele serviço       │
│         (filtro automático via API)                         │
│                                                              │
│ Ação: Ao clicar → setProfissional(id, nome)                │
│       → currentStep = 3 (avança automaticamente)            │
│                                                              │
│ Dados: GET /api/profissionais?servico_id=xxx                │
│        Headers: x-tenant-id                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Escolher Data e Hora                                 │
│ ─────────────────────────────────────────────────────────── │
│ Título: "Quando você quer agendar?"                      │
│ Botão: "← Voltar"                                           │
│                                                              │
│ Seção Data:                                                 │
│   - Mostrar próximos 14 dias (não permitir passado)        │
│   - Formato: "Terça, 15 de Janeiro"                        │
│   - Input tipo date (HTML5) ou calendar picker              │
│   - Ao mudar data → carregar horários disponíveis          │
│                                                              │
│ Seção Horário:                                              │
│   - Grid de botões com horários                            │
│   - Horários disponíveis: VERDE (habilitado)               │
│   - Horários ocupados: CINZA (desabilitado)                │
│   - Ao clicar horário → setDataHora(ISO string)            │
│       → currentStep = 4 (avança automaticamente)            │
│                                                              │
│ Dados: POST /api/horarios-disponiveis                       │
│        Body: { profissional_id, data, servico_id }         │
│        Headers: x-tenant-id                                  │
│                                                              │
│ Loading: Skeleton enquanto carrega horários                │
│ Erro: Mensagem se nenhum horário disponível                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Confirmar Dados                                     │
│ ─────────────────────────────────────────────────────────── │
│ Título: "Confirme seus dados"                               │
│ Botão: "← Voltar"                                           │
│                                                              │
│ Resumo do Agendamento:                                      │
│   - Serviço e preço                                         │
│   - Profissional                                            │
│   - Data e hora formatadas                                  │
│     (ex: "Terça, 15 de janeiro de 2024 às 14:30")          │
│                                                              │
│ Formulário:                                                 │
│   - Nome (obrigatório, mínimo 3 caracteres)                │
│   - Telefone (obrigatório, máscara DDD)                    │
│   - Email (opcional, mas recomendado)                       │
│   - Checkbox: "Receber confirmação por WhatsApp"           │
│                                                              │
│ Validações:                                                 │
│   - Nome não vazio                                          │
│   - Telefone válido (com DDD)                              │
│   - Email válido (se preenchido)                            │
│   - Todos obrigatórios preenchidos                          │
│                                                              │
│ Botão: "Confirmar Agendamento" (grande, destacado)          │
│                                                              │
│ Ação: Ao clicar → setCliente(nome, email, telefone)        │
│       → criarAgendamento()                                  │
│       → Se sucesso → currentStep = 5                        │
│       → Se erro → mostrar mensagem                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Sucesso                                              │
│ ─────────────────────────────────────────────────────────── │
│ Título: "✅ Agendamento Confirmado!"                        │
│                                                              │
│ Mensagem: "Você receberá uma confirmação por email/        │
│           WhatsApp"                                         │
│                                                              │
│ Exibir:                                                     │
│   - Dados do agendamento                                    │
│   - Serviço, profissional, data/hora                       │
│                                                              │
│ Botões:                                                     │
│   - "Fechar"                                                │
│   - "Fazer outro agendamento" (reseta formulário)          │
│                                                              │
│ Auto-close: Mostrar por 5 segundos e fechar automaticamente│
│                                                              │
│ Ação: onSuccess(agendamento_id)                             │
│       → reset() (se fazer outro)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Layout de Cada Step (ASCII Art)

### STEP 1 - Escolher Serviço

```
┌─────────────────────────────────────────┐
│  Qual serviço você deseja?              │
│  ─────────────────────────────────────  │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ ✂️ Corte │  │ 💇 Barba │           │
│  │ 30 min   │  │ 20 min   │           │
│  │ R$ 50    │  │ R$ 30    │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ 💅 Unhas │  │ 🧴 Trat. │           │
│  │ 45 min   │  │ 60 min   │           │
│  │ R$ 80    │  │ R$ 120   │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  [Próximo →] (desabilitado até selecionar)│
└─────────────────────────────────────────┘
```

### STEP 2 - Escolher Profissional

```
┌─────────────────────────────────────────┐
│  [← Voltar]                             │
│                                         │
│  Com quem você quer agendar?           │
│  ─────────────────────────────────────  │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │ [Foto]  Carlos Barbeiro          │ │
│  │          ⭐ 4.8 (120 avaliações)  │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │ [Foto]  Maria Manicure             │ │
│  │          ⭐ 4.9 (95 avaliações)    │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │ [Foto]  João Esteticista          │ │
│  │          ⭐ 5.0 (200 avaliações)   │ │
│  └──────────────────────────────────┘ │
│                                         │
│  [Próximo →] (desabilitado até selecionar)│
└─────────────────────────────────────────┘
```

### STEP 3 - Escolher Data e Hora

```
┌─────────────────────────────────────────┐
│  [← Voltar]                             │
│                                         │
│  Quando você quer agendar?              │
│  ─────────────────────────────────────  │
│                                         │
│  📅 Data:                               │
│  ┌──────────────────────────────────┐ │
│  │ [Calendário]                      │ │
│  │ Terça, 15 de Janeiro              │ │
│  │ Quarta, 16 de Janeiro             │ │
│  │ Quinta, 17 de Janeiro             │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ⏰ Horário:                            │
│  ┌──────────────────────────────────┐ │
│  │ [09:00] [09:30] [10:00] [10:30] │ │
│  │ [11:00] [11:30] [12:00] [12:30] │ │
│  │ [13:00] [13:30] [14:00] [14:30] │ │
│  │                                   │ │
│  │ 🟢 Disponível  ⚪ Ocupado         │ │
│  └──────────────────────────────────┘ │
│                                         │
│  [Próximo →] (desabilitado até selecionar)│
└─────────────────────────────────────────┘
```

### STEP 4 - Confirmar Dados

```
┌─────────────────────────────────────────┐
│  [← Voltar]                             │
│                                         │
│  Confirme seus dados                    │
│  ─────────────────────────────────────  │
│                                         │
│  📋 Resumo:                             │
│  ┌──────────────────────────────────┐ │
│  │ Serviço: Corte Masculino - R$ 50  │ │
│  │ Profissional: Carlos Barbeiro     │ │
│  │ Data: Terça, 15 de janeiro de 2024│ │
│  │ Horário: 14:30                    │ │
│  └──────────────────────────────────┘ │
│                                         │
│  👤 Seus Dados:                         │
│  ┌──────────────────────────────────┐ │
│  │ Nome *                             │ │
│  │ [_____________________________]   │ │
│  │                                    │ │
│  │ Telefone *                         │ │
│  │ [(11) 9____-____]                 │ │
│  │                                    │ │
│  │ Email                              │ │
│  │ [_____________________________]   │ │
│  │                                    │ │
│  │ ☑ Receber confirmação por WhatsApp│ │
│  └──────────────────────────────────┘ │
│                                         │
│  [✅ Confirmar Agendamento]            │
└─────────────────────────────────────────┘
```

### STEP 5 - Sucesso

```
┌─────────────────────────────────────────┐
│                                         │
│         ✅ Agendamento Confirmado!     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Você receberá uma confirmação por     │
│  email/WhatsApp                         │
│                                         │
│  📋 Detalhes:                           │
│  ┌──────────────────────────────────┐ │
│  │ Serviço: Corte Masculino          │ │
│  │ Profissional: Carlos Barbeiro     │ │
│  │ Data: Terça, 15/01/2024 às 14:30  │ │
│  └──────────────────────────────────┘ │
│                                         │
│  [Fechar]  [Fazer outro agendamento]   │
│                                         │
│  (Fecha automaticamente em 5s)         │
└─────────────────────────────────────────┘
```

---

## ✅ Validações por Step

### STEP 1 - Escolher Serviço
- ✅ Serviço selecionado (servico_id não nulo)
- ✅ Próximo botão só ativa quando serviço selecionado

### STEP 2 - Escolher Profissional
- ✅ Profissional selecionado (profissional_id não nulo)
- ✅ Profissional faz aquele serviço (filtro automático via API)
- ✅ Próximo botão só ativa quando profissional selecionado

### STEP 3 - Escolher Data e Hora
- ✅ Data selecionada (não pode ser no passado)
- ✅ Data não pode ser mais de 90 dias no futuro
- ✅ Horário selecionado (data_hora não nulo)
- ✅ Horário deve estar disponível (verde, não cinza)
- ✅ Próximo botão só ativa quando data e hora selecionadas

### STEP 4 - Confirmar Dados
- ✅ Nome: obrigatório, mínimo 3 caracteres, não vazio
- ✅ Telefone: obrigatório, formato válido com DDD (mínimo 10 dígitos)
- ✅ Email: opcional, mas se preenchido deve ser válido (regex)
- ✅ Todos os campos obrigatórios preenchidos
- ✅ Botão "Confirmar" só ativa quando validações passam

### STEP 5 - Sucesso
- ✅ Agendamento criado com sucesso (agendamento_id retornado)
- ✅ Auto-close após 5 segundos
- ✅ Opção de fazer outro agendamento (reseta formulário)

---

## 🔄 Fluxo de Dados (State Management)

### Zustand Store

```typescript
// store/agendamentoStore.ts

Estado:
- servico_id: string | null
- servico_nome: string | null
- servico_preco: number | null
- profissional_id: string | null
- profissional_nome: string | null
- data_hora: string | null
- cliente_nome: string
- cliente_email: string
- cliente_telefone: string
- currentStep: number (1-5)

Ações:
- setServico(id, nome, preco) → currentStep = 2
- setProfissional(id, nome) → currentStep = 3
- setDataHora(dataHora) → currentStep = 4
- setCliente(nome, email, telefone) → mantém step 4
- nextStep() → incrementa step
- prevStep() → decrementa step
- reset() → volta para estado inicial
```

### Fluxo de Dados

```
STEP 1:
  useServicos(tenantId) → servicos[]
  Usuário clica em card → setServico(id, nome, preco)
  → currentStep = 2

STEP 2:
  useProfissionais(tenantId, servico_id) → profissionais[]
  Usuário clica em card → setProfissional(id, nome)
  → currentStep = 3

STEP 3:
  useHorariosDisponiveis(tenantId, profissional_id, data, servico_id) → horarios[]
  Usuário seleciona data → busca horários
  Usuário clica em horário → setDataHora(ISO string)
  → currentStep = 4

STEP 4:
  Usuário preenche formulário → setCliente(nome, email, telefone)
  Usuário clica "Confirmar" → criarAgendamento(dados)
  → Se sucesso → currentStep = 5
  → Se erro → mostra mensagem, mantém step 4

STEP 5:
  Mostra sucesso → onSuccess(agendamento_id)
  → Auto-close após 5s ou reset() se fazer outro
```

---

## ⏰ Como os Horários Serão Carregados

### Hook: useHorariosDisponiveis

```typescript
const { horarios, loading, error } = useHorariosDisponiveis(
  tenantId,
  profissional_id,
  data,
  servico_id
);
```

### Fluxo de Carregamento

1. **Usuário seleciona data:**
   - `data` muda no estado
   - Hook detecta mudança
   - Faz POST /api/horarios-disponiveis

2. **Durante carregamento:**
   - `loading = true`
   - Mostra skeleton (grid de botões desabilitados)
   - Não permite selecionar horário

3. **Após carregar:**
   - `loading = false`
   - `horarios = [...]` (array de horários)
   - Renderiza botões:
     - **Verde** (disponivel: true) → habilitado
     - **Cinza** (disponivel: false) → desabilitado

4. **Se mudar data:**
   - Refresca automaticamente
   - Limpa seleção anterior
   - Carrega novos horários

5. **Se erro:**
   - `error = "mensagem"`
   - Mostra mensagem: "Nenhum horário disponível nesta data"
   - Permite voltar ou escolher outra data

### Exemplo de Resposta

```json
{
  "sucesso": true,
  "horarios": [
    { "hora": "09:00", "disponivel": true },
    { "hora": "09:30", "disponivel": false, "motivo": "Agendado" },
    { "hora": "10:00", "disponivel": true },
    { "hora": "10:30", "disponivel": false, "motivo": "Bloqueado" }
  ],
  "data_formatada": "15/01/2024",
  "dia_semana": "Terça-feira",
  "total_slots": 16,
  "slots_disponiveis": 12
}
```

---

## 🪝 Hooks que Serão Criados

### 1. useServicos.ts
- **Função:** Busca serviços do tenant
- **Parâmetros:** `tenantId: string | null`
- **Retorno:** `{ servicos: Servico[], loading: boolean, error: string | null }`
- **Chamada:** GET /api/servicos
- **Quando usar:** STEP 1

### 2. useProfissionais.ts
- **Função:** Busca profissionais filtrados por serviço
- **Parâmetros:** `tenantId: string | null, servicoId: string | null`
- **Retorno:** `{ profissionais: Profissional[], loading: boolean, error: string | null }`
- **Chamada:** GET /api/profissionais?servico_id=xxx
- **Quando usar:** STEP 2 (só busca se servicoId fornecido)

### 3. useHorariosDisponiveis.ts
- **Função:** Busca horários disponíveis
- **Parâmetros:** `tenantId, profissionalId, data, servicoId`
- **Retorno:** `{ horarios: Horario[], loading: boolean, error: string | null }`
- **Chamada:** POST /api/horarios-disponiveis
- **Quando usar:** STEP 3 (só busca se todos parâmetros fornecidos)

### 4. useAgendamento.ts
- **Função:** Cria agendamento
- **Parâmetros:** `tenantId: string | null`
- **Retorno:** `{ criarAgendamento: Function, loading: boolean, error: string | null }`
- **Chamada:** POST /api/agendamentos/criar
- **Quando usar:** STEP 4 (ao confirmar)

---

## 📱 Como Ficará em Mobile (99% dos Casos)

### Viewport: 375px (iPhone SE)

#### STEP 1 - Escolher Serviço
```
┌─────────────────────┐
│ Qual serviço você   │
│ deseja?            │
│ ─────────────────── │
│                     │
│ ┌───────────────┐  │
│ │ ✂️ Corte      │  │
│ │ 30 min        │  │
│ │ R$ 50         │  │
│ └───────────────┘  │
│                     │
│ ┌───────────────┐  │
│ │ 💇 Barba      │  │
│ │ 20 min        │  │
│ │ R$ 30         │  │
│ └───────────────┘  │
│                     │
│ [Próximo →]        │
└─────────────────────┘
```
- **Layout:** 1 coluna (cards empilhados)
- **Cards:** Largura total, altura ~120px
- **Botão:** Fixo no rodapé, altura 44px

#### STEP 2 - Escolher Profissional
```
┌─────────────────────┐
│ [← Voltar]          │
│                     │
│ Com quem você quer  │
│ agendar?           │
│ ─────────────────── │
│                     │
│ ┌───────────────┐  │
│ │ [Foto]        │  │
│ │ Carlos        │  │
│ │ ⭐ 4.8        │  │
│ └───────────────┘  │
│                     │
│ ┌───────────────┐  │
│ │ [Foto]        │  │
│ │ Maria         │  │
│ │ ⭐ 4.9        │  │
│ └───────────────┘  │
│                     │
│ [Próximo →]        │
└─────────────────────┘
```
- **Layout:** 1 coluna (cards empilhados)
- **Cards:** Largura total, altura ~100px
- **Foto:** 60x60px, circular

#### STEP 3 - Escolher Data e Hora
```
┌─────────────────────┐
│ [← Voltar]          │
│                     │
│ Quando você quer    │
│ agendar?            │
│ ─────────────────── │
│                     │
│ 📅 Data:            │
│ [Calendário]        │
│ Terça, 15 Jan       │
│                     │
│ ⏰ Horário:         │
│ [09:00] [09:30]     │
│ [10:00] [10:30]     │
│ [11:00] [11:30]     │
│                     │
│ [Próximo →]        │
└─────────────────────┘
```
- **Data:** Input date nativo (melhor UX mobile)
- **Horários:** Grid 2 colunas, botões ~80px largura
- **Botões:** Altura 44px (touch-friendly)

#### STEP 4 - Confirmar Dados
```
┌─────────────────────┐
│ [← Voltar]          │
│                     │
│ Confirme seus dados │
│ ─────────────────── │
│                     │
│ 📋 Resumo:          │
│ Serviço: R$ 50      │
│ Prof: Carlos        │
│ Terça, 15/01 14:30  │
│                     │
│ Nome *              │
│ [____________]      │
│                     │
│ Telefone *          │
│ [(11) 9____-____]   │
│                     │
│ Email               │
│ [____________]      │
│                     │
│ ☑ WhatsApp          │
│                     │
│ [✅ Confirmar]      │
└─────────────────────┘
```
- **Inputs:** Largura total, altura 44px
- **Teclado virtual:** Não bloqueia conteúdo (scroll automático)
- **Botão:** Largura total, altura 56px (destaque)

#### STEP 5 - Sucesso
```
┌─────────────────────┐
│                     │
│   ✅ Confirmado!    │
│                     │
│ Você receberá uma   │
│ confirmação         │
│                     │
│ 📋 Detalhes:        │
│ Serviço: Corte      │
│ Prof: Carlos        │
│ Terça, 15/01 14:30  │
│                     │
│ [Fechar]            │
│                     │
└─────────────────────┘
```
- **Layout:** Centralizado, simples
- **Auto-close:** 5 segundos

### Otimizações Mobile

1. **Botões grandes:** Mínimo 44px de altura (touch-friendly)
2. **Teclado virtual:** Scroll automático quando input focado
3. **Máscara telefone:** Automática (react-input-mask)
4. **Labels claros:** Sempre visíveis, não placeholder-only
5. **Progress bar:** Mostra "Step 1/4" no topo
6. **Animações:** Suaves, não pesadas (performance)
7. **Loading:** Skeleton durante carregamento
8. **Erros:** Mensagens claras, botão "Tentar novamente"

---

## 🎯 Pontos Principais Implementados

1. ✅ **5 steps sequenciais** com fluxo claro
2. ✅ **Estado global** com Zustand
3. ✅ **Hooks customizados** para buscar dados
4. ✅ **Responsivo** (mobile-first, 99% dos acessos)
5. ✅ **Validações** em cada step
6. ✅ **Tratamento de erros** robusto
7. ✅ **Loading states** (skeleton, spinners)
8. ✅ **Acessibilidade** (ARIA, labels, tabindex)
9. ✅ **Animações** sutis (transições, hover)
10. ✅ **Auto-close** após sucesso

Tudo estruturado e documentado. Pronto para implementação.

