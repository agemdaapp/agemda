# Dashboard de Administração - Documentação

## 📋 Visão Geral

Painel de administração completo para o cliente gerenciar sua barbearia, com todas as funcionalidades necessárias para operação diária.

## 🏗️ Layout Geral do Dashboard

### Estrutura Visual

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (topo fixo, altura: 64px)                            │
│ ┌─────────┬──────────────┬──────────┬──────────┬──────────┐ │
│ │ Logo    │ Nome Negócio │ Notif.   │ Avatar   │ Dropdown │ │
│ │ agemda  │ Leticia Nails│ 🔔 (3)   │ [Foto]   │ ▼        │ │
│ └─────────┴──────────────┴──────────┴──────────┴──────────┘ │
├───────────┼─────────────────────────────────────────────────┤
│ SIDEBAR   │ MAIN CONTENT                                      │
│ (240px)   │ (fluido)                                          │
│           │                                                   │
│ 📊 Home   │ ┌─────────────────────────────────────────────┐ │
│ 📅 Agenda │ │ Dashboard > Agendamentos                     │ │
│ 👥 Profis.│ ├─────────────────────────────────────────────┤ │
│ ✂️ Serviços│ │ Conteúdo específico da página                │ │
│ ⏰ Horários│ │                                               │ │
│ 🚫 Bloqueios│ │                                               │ │
│ 🌐 Landing │ │                                               │ │
│ ⚙️ Config  │ │                                               │ │
│           │ └─────────────────────────────────────────────┘ │
│           │ Footer: © 2024 Agemda                           │
└───────────┴─────────────────────────────────────────────────┘
```

### Responsividade

**Desktop (1024px+):**
- Sidebar fixo (240px)
- Conteúdo fluido (calc(100% - 240px))
- Header fixo no topo

**Tablet (768px - 1023px):**
- Sidebar colapsável (botão toggle)
- Conteúdo reflow
- Header fixo

**Mobile (< 768px):**
- Sidebar hambúrguer (overlay)
- Conteúdo full-width
- Header compacto

---

## 📄 Estrutura de Páginas

### 1. /dashboard (Home/Overview)

**Título:** "Bem-vindo, [Nome]!"

**KPIs em Cards:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Hoje        │ │ Confirmados │ │ Cancelados  │ │ Receita     │
│ 12          │ │ 8           │ │ 2           │ │ R$ 2.450    │
│ agendamentos│ │ agendamentos│ │ agendamentos│ │ este mês    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Gráfico:**
- Agendamentos por dia (últimos 7 dias)
- Gráfico de linha simples (Chart.js ou similar)

**Próximos 5 Agendamentos (Tabela):**
| Nome Cliente | Serviço | Hora | Profissional | Status |
|--------------|---------|------|--------------|--------|
| João Silva | Corte | 10:00 | Carlos | Confirmado |
| Maria Santos | Barba | 11:00 | Carlos | Confirmado |
| ... | ... | ... | ... | ... |

**Atalhos Rápidos:**
- Botão: "Novo agendamento"
- Botão: "Ver todos agendamentos"
- Botão: "Editar horários"

---

### 2. /dashboard/agendamentos (Listar)

**Tabela com Colunas:**
| Data/Hora | Cliente | Serviço | Profissional | Status | Ações |
|-----------|---------|---------|--------------|--------|-------|
| 15/01 10:00 | João Silva<br>11999999999 | Corte | Carlos | 🟢 Confirmado | [Editar] [Cancelar] |
| 15/01 11:00 | Maria Santos<br>11988888888 | Barba | Carlos | 🟢 Confirmado | [Editar] [Finalizar] |
| 15/01 14:00 | Pedro Costa<br>11977777777 | Corte | João | 🔴 Cancelado | [Ver] |

**Filtros (acima da tabela):**
```
┌─────────────────────────────────────────────────────────┐
│ Status: [Todos ▼] Data: [De] [Até] Profissional: [Todos]│
│ Buscar: [________________] [Buscar]                      │
└─────────────────────────────────────────────────────────┘
```

**Ações:**
- Botão "Novo agendamento" (topo direito)
- Botão "Exportar CSV" (topo direito)
- Paginação: 20 por página
- Ordenação: por data decrescente (padrão)

**Status Badges:**
- 🟢 Confirmado (verde)
- 🟡 Pendente (amarelo)
- 🔴 Cancelado (vermelho)
- ⚫ No-show (cinza)
- ✅ Finalizado (azul)

---

### 3. /dashboard/agendamentos/[id] (Detalhe)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [← Voltar]  Agendamento #123                            │
│ ─────────────────────────────────────────────────────── │
│                                                          │
│ 📋 Detalhes:                                             │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Cliente: João Silva                                │ │
│ │ Telefone: (11) 99999-9999                          │ │
│ │ Email: joao@email.com                              │ │
│ │                                                     │ │
│ │ Serviço: Corte Masculino - R$ 50                   │ │
│ │ Profissional: Carlos Barbeiro                       │ │
│ │ Data/Hora: Terça, 15/01/2024 às 10:00              │ │
│ │ Status: Confirmado                                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ✏️ Editar:                                              │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Status: [Confirmado ▼]                              │ │
│ │ Data/Hora: [15/01/2024] [10:00] (só se futuro)     │ │
│ │ [Salvar]                                            │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ 🚫 Cancelar:                                            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Motivo: [________________________]                │ │
│ │ [Cancelar Agendamento]                            │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ✅ Marcar como Finalizado: [Finalizar]                  │
│                                                          │
│ 📧 Enviar Confirmação: [Email] [WhatsApp]               │
│                                                          │
│ 📜 Histórico:                                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 15/01 10:00 - Criado por Sistema                  │ │
│ │ 15/01 10:05 - Confirmado por Admin                │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 4. /dashboard/profissionais (CRUD)

**Tabela:**
| Foto | Nome | Serviços que faz | Ativo | Ações |
|------|------|------------------|-------|-------|
| [Foto] | Carlos Barbeiro | Corte, Barba | ✅ | [Editar] [Deletar] |
| [Foto] | Maria Manicure | Unhas, Tratamento | ✅ | [Editar] [Deletar] |

**Contador:**
```
"2 de 2 profissionais" (se plano básico)
"5 de 5 profissionais" (se plano intermediário)
"10 profissionais" (se plano premium - sem limite)
```

**Se no limite:**
```
⚠️ Limite de profissionais atingido
[Upgrade para adicionar mais]
```

**Modal "Adicionar Profissional":**
```
┌─────────────────────────────────────────┐
│ Adicionar Profissional          [X]     │
│ ─────────────────────────────────────── │
│                                         │
│ Nome *                                  │
│ [_____________________________]         │
│                                         │
│ Foto (URL ou upload)                    │
│ [_____________________________] [Upload] │
│                                         │
│ Serviços que faz:                       │
│ ☑ Corte Masculino                       │
│ ☑ Barba                                 │
│ ☐ Unhas                                 │
│                                         │
│ [Cancelar]  [Adicionar]                │
└─────────────────────────────────────────┘
```

**Modal "Editar Profissional":**
- Mesmos campos
- Toggle: "Ativo" / "Inativo"
- Botão: "Salvar"

**Confirmação Deletar:**
```
┌─────────────────────────────────────────┐
│ Confirmar Exclusão                     │
│ ─────────────────────────────────────── │
│                                         │
│ Tem certeza que deseja remover         │
│ "Carlos Barbeiro"?                     │
│                                         │
│ Esta ação não pode ser desfeita.       │
│                                         │
│ [Cancelar]  [Deletar]                  │
└─────────────────────────────────────────┘
```

---

### 5. /dashboard/servicos (CRUD)

**Tabela:**
| Nome | Duração | Preço | Ativo | Ações |
|------|---------|-------|-------|-------|
| Corte Masculino | 30 min | R$ 50 | ✅ | [Editar] [Deletar] |
| Barba | 20 min | R$ 30 | ✅ | [Editar] [Deletar] |
| Unhas | 45 min | R$ 80 | ✅ | [Editar] [Deletar] |

**Modal "Adicionar Serviço":**
```
┌─────────────────────────────────────────┐
│ Adicionar Serviço               [X]     │
│ ─────────────────────────────────────── │
│                                         │
│ Nome *                                  │
│ [_____________________________]         │
│                                         │
│ Descrição (opcional)                    │
│ [_____________________________]         │
│ [_____________________________]         │
│                                         │
│ Duração (minutos) *                     │
│ [30]                                    │
│                                         │
│ Preço (R$) *                            │
│ [R$ 50,00]                              │
│                                         │
│ Buffer antes (minutos)                  │
│ [5]                                     │
│                                         │
│ Buffer depois (minutos)                 │
│ [5]                                     │
│                                         │
│ [Cancelar]  [Adicionar]                │
└─────────────────────────────────────────┘
```

**Modal "Editar Serviço":**
- Mesmos campos
- Toggle: "Ativo" / "Inativo"
- Botão: "Salvar"

---

### 6. /dashboard/horarios (Configurar Horários)

**Tabela:**
| Dia | Hora Abertura | Hora Fechamento | Ativo | Ações |
|-----|---------------|-----------------|-------|-------|
| Segunda | 09:00 | 18:00 | ✅ | [Copiar] |
| Terça | 09:00 | 18:00 | ✅ | [Copiar] |
| Quarta | 09:00 | 18:00 | ✅ | [Copiar] |
| Quinta | 09:00 | 18:00 | ✅ | [Copiar] |
| Sexta | 09:00 | 18:00 | ✅ | [Copiar] |
| Sábado | 10:00 | 16:00 | ✅ | [Copiar] |
| Domingo | - | - | ❌ | [Copiar] |

**Ações:**
- Botão "Copiar para todos" (copia horário de uma linha para todas)
- Salvar automaticamente ao mudar (ou botão "Salvar tudo")
- Inputs: time picker (formato 24h)

---

### 7. /dashboard/bloqueios (Gerenciar Bloqueios)

**Tabela:**
| Data/Hora Início | Data/Hora Fim | Motivo | Profissional | Ações |
|------------------|---------------|--------|-------------|-------|
| 15/01 12:00 | 15/01 13:00 | Almoço | Todos | [Editar] [Deletar] |
| 16/01 14:00 | 16/01 15:00 | Limpeza | Carlos | [Editar] [Deletar] |

**Modal "Adicionar Bloqueio":**
```
┌─────────────────────────────────────────┐
│ Adicionar Bloqueio              [X]     │
│ ─────────────────────────────────────── │
│                                         │
│ Data início *                            │
│ [15/01/2024]                            │
│                                         │
│ Hora início *                            │
│ [12:00]                                 │
│                                         │
│ Data fim *                               │
│ [15/01/2024]                            │
│                                         │
│ Hora fim *                               │
│ [13:00]                                 │
│                                         │
│ Motivo *                                 │
│ [Almoço ▼]                              │
│   - Almoço                              │
│   - Limpeza                             │
│   - Consulta                            │
│   - Outro                               │
│                                         │
│ Profissional                            │
│ [Todos ▼]                               │
│   - Todos                               │
│   - Carlos Barbeiro                     │
│   - Maria Manicure                      │
│                                         │
│ ☑ Recorrente (todo dia neste horário)  │
│                                         │
│ [Cancelar]  [Adicionar]                │
└─────────────────────────────────────────┘
```

---

### 8. /dashboard/landing (Editar Landing Page)

**Layout Split:**
```
┌─────────────────────┬─────────────────────┐
│ Formulário          │ Preview              │
│                     │                      │
│ Cor primária:       │ ┌─────────────────┐ │
│ [Color Picker]      │ │ Landing Preview │ │
│                     │ │                 │ │
│ Cor secundária:     │ │ [Logo]          │ │
│ [Color Picker]      │ │                 │ │
│                     │ │ Descrição...    │ │
│ Logo:               │ │                 │ │
│ [Upload]            │ │ [Agendar]       │ │
│                     │ └─────────────────┘ │
│ Descrição:          │                      │
│ [Textarea]          │                      │
│                     │                      │
│ ☑ Mostrar agendamento rápido             │
│ ☑ Mostrar lista de serviços               │
│                     │                      │
│ [Visualizar landing] [Salvar]            │
└─────────────────────┴─────────────────────┘
```

**Mobile:** Preview acima, formulário abaixo

---

### 9. /dashboard/configuracoes (Dados da Barbearia)

**Formulário:**
```
┌─────────────────────────────────────────┐
│ Dados da Barbearia                     │
│ ─────────────────────────────────────── │
│                                         │
│ Nome do negócio *                       │
│ [Leticia Nails]                         │
│                                         │
│ Vertical *                              │
│ [Barbearia ▼]                           │
│                                         │
│ Email de contato *                      │
│ [leticia@email.com]                     │
│                                         │
│ Telefone *                              │
│ [(11) 99999-9999]                       │
│                                         │
│ Endereço (opcional)                     │
│ [Rua Exemplo, 123]                      │
│                                         │
│ WhatsApp para confirmações              │
│ [(11) 99999-9999]                       │
│                                         │
│ Plano atual: Básico (2 profissionais)   │
│ [Upgrade de plano]                      │
│                                         │
│ [Salvar]                                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Conta                                   │
│ ─────────────────────────────────────── │
│                                         │
│ Email: admin@email.com                  │
│                                         │
│ [Mudar senha]                           │
│                                         │
│ [Deletar conta] (com confirmação)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Integrações (futura)                    │
│ ─────────────────────────────────────── │
│                                         │
│ WhatsApp: [Conectar] (desabilitado)     │
│ Stripe/Pix: [Conectar] (desabilitado)  │
└─────────────────────────────────────────┘
```

---

## 📊 Tabelas com Colunas

### Tabela de Agendamentos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Data/Hora | DateTime | Data e hora do agendamento |
| Cliente | String | Nome + telefone (2 linhas) |
| Serviço | String | Nome do serviço |
| Profissional | String | Nome do profissional |
| Status | Badge | Confirmado/Cancelado/No-show |
| Ações | Buttons | Editar, Cancelar, Finalizar |

### Tabela de Profissionais
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Foto | Image | Thumbnail 40x40px |
| Nome | String | Nome do profissional |
| Serviços | String | Lista de serviços (separado por vírgula) |
| Ativo | Toggle | Switch on/off |
| Ações | Buttons | Editar, Deletar |

### Tabela de Serviços
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Nome | String | Nome do serviço |
| Duração | String | "30 min" |
| Preço | Currency | "R$ 50,00" |
| Ativo | Toggle | Switch on/off |
| Ações | Buttons | Editar, Deletar |

### Tabela de Horários
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Dia | String | "Segunda", "Terça", etc |
| Hora Abertura | Time | "09:00" |
| Hora Fechamento | Time | "18:00" |
| Ativo | Checkbox | ✓ ou ✗ |
| Ações | Button | "Copiar" |

### Tabela de Bloqueios
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Data/Hora Início | DateTime | Data e hora início |
| Data/Hora Fim | DateTime | Data e hora fim |
| Motivo | String | "Almoço", "Limpeza", etc |
| Profissional | String | "Todos" ou nome específico |
| Ações | Buttons | Editar, Deletar |

---

## 📝 Formulários e Campos

### Adicionar Profissional
- **Nome** (obrigatório, string, min 2 chars)
- **Foto** (opcional, URL ou upload)
- **Serviços** (checkbox múltiplo, obrigatório pelo menos 1)

### Editar Profissional
- Mesmos campos + **Ativo** (toggle)

### Adicionar Serviço
- **Nome** (obrigatório, string, min 2 chars)
- **Descrição** (opcional, textarea)
- **Duração** (obrigatório, number, > 0)
- **Preço** (obrigatório, currency, >= 0)
- **Buffer antes** (obrigatório, number, >= 0)
- **Buffer depois** (obrigatório, number, >= 0)

### Editar Serviço
- Mesmos campos + **Ativo** (toggle)

### Adicionar Bloqueio
- **Data início** (obrigatório, date)
- **Hora início** (obrigatório, time)
- **Data fim** (obrigatório, date)
- **Hora fim** (obrigatório, time)
- **Motivo** (obrigatório, select: Almoço/Limpeza/Consulta/Outro)
- **Profissional** (select: Todos ou específico)
- **Recorrente** (checkbox, opcional)

### Editar Landing Page
- **Cor primária** (color picker)
- **Cor secundária** (color picker)
- **Logo** (upload ou URL)
- **Descrição** (textarea)
- **Mostrar agendamento rápido** (toggle)
- **Mostrar lista de serviços** (toggle)

### Configurações
- **Nome do negócio** (obrigatório, string)
- **Vertical** (obrigatório, select: Barbearia/Unhas/Beleza)
- **Email de contato** (obrigatório, email válido)
- **Telefone** (obrigatório, formato válido)
- **Endereço** (opcional, string)
- **WhatsApp** (opcional, formato válido)

---

## ✅ Validações e Permissões

### Validações Gerais

**Autenticação:**
- Usuário deve estar autenticado
- Token válido no header
- Sessão ativa no Supabase

**Tenant:**
- tenant_id do header deve bater com da URL
- Verificar pertencimento antes de qualquer ação
- RLS do Supabase garante isolamento

**Plano:**
- Verificar limite antes de criar profissional
- Se básico: máx 2 profissionais
- Se intermediário: máx 5 profissionais
- Se premium: sem limite
- Mostrar mensagem clara de upgrade quando necessário

### Validações por Ação

**Criar Profissional:**
- Nome: obrigatório, min 2 chars
- Verificar limite do plano
- Se no limite: erro 403 com mensagem de upgrade

**Editar Profissional:**
- Profissional deve existir
- Profissional deve pertencer ao tenant
- Nome: min 2 chars (se alterado)

**Deletar Profissional:**
- Profissional deve existir
- Profissional deve pertencer ao tenant
- Verificar agendamentos futuros (não pode deletar se tiver)
- Confirmação obrigatória

**Criar Serviço:**
- Nome: obrigatório, min 2 chars, único por tenant
- Duração: > 0
- Preço: >= 0
- Buffers: >= 0

**Editar Agendamento:**
- Agendamento deve existir
- Agendamento deve pertencer ao tenant
- Data/hora só pode editar se futuro
- Status: valores permitidos apenas

**Cancelar Agendamento:**
- Agendamento deve existir
- Agendamento deve pertencer ao tenant
- Não pode cancelar se já finalizado
- Motivo obrigatório

---

## 📱 Como Ficará em Mobile

### Layout Mobile (< 768px)

```
┌─────────────────────────┐
│ [☰] Logo  Notif. Avatar │ ← Header compacto
├─────────────────────────┤
│                         │
│ Conteúdo full-width     │
│                         │
│ Tabelas:                │
│ - Scroll horizontal     │
│ - Ou card view          │
│                         │
│ Formulários:            │
│ - Inputs full-width     │
│ - Botões full-width     │
│                         │
└─────────────────────────┘
```

### Sidebar Mobile (Overlay)

```
┌─────────────────────────┐
│ [X] Menu                │
├─────────────────────────┤
│ 📊 Home                 │
│ 📅 Agendamentos         │
│ 👥 Profissionais        │
│ ✂️ Serviços             │
│ ⏰ Horários             │
│ 🚫 Bloqueios            │
│ 🌐 Landing              │
│ ⚙️ Configurações        │
│                         │
│ [Logout]                │
└─────────────────────────┘
```

### Tabelas Mobile (Card View)

```
┌─────────────────────────┐
│ Agendamento #123        │
│ ─────────────────────── │
│ Cliente: João Silva     │
│ Serviço: Corte           │
│ Profissional: Carlos     │
│ Data: 15/01 10:00       │
│ Status: Confirmado       │
│                         │
│ [Editar] [Cancelar]     │
└─────────────────────────┘
```

---

## 🔌 Chamadas à API Necessárias

### Agendamentos
- `GET /api/agendamentos` - Listar (com filtros, paginação)
- `GET /api/agendamentos/[id]` - Detalhe
- `POST /api/agendamentos/criar` - Criar
- `PUT /api/agendamentos/[id]` - Editar
- `POST /api/agendamentos/[id]/cancelar` - Cancelar
- `DELETE /api/agendamentos/[id]` - Deletar (admin)

### Profissionais
- `GET /api/profissionais` - Listar
- `GET /api/profissionais?servico_id=xxx` - Filtrar por serviço
- `POST /api/profissionais` - Criar
- `PUT /api/profissionais/[id]` - Editar
- `DELETE /api/profissionais/[id]` - Deletar
- `POST /api/profissionais/[id]/servicos` - Associar serviços

### Serviços
- `GET /api/servicos` - Listar
- `POST /api/servicos` - Criar
- `PUT /api/servicos/[id]` - Editar
- `DELETE /api/servicos/[id]` - Deletar

### Horários
- `GET /api/horario-funcionamento` - Buscar
- `PUT /api/horario-funcionamento` - Atualizar

### Bloqueios
- `GET /api/bloqueios-horario` - Listar
- `POST /api/bloqueios-horario` - Criar
- `PUT /api/bloqueios-horario/[id]` - Editar
- `DELETE /api/bloqueios-horario/[id]` - Deletar

### Landing Page
- `GET /api/landing-pages` - Buscar
- `PUT /api/landing-pages` - Atualizar

### Dashboard (Home)
- `GET /api/dashboard/stats` - KPIs (agendamentos hoje, receita, etc)
- `GET /api/dashboard/grafico` - Dados do gráfico (últimos 7 dias)
- `GET /api/agendamentos?limit=5&status=confirmado` - Próximos agendamentos

---

## 🔔 Padrão de Notificações (Toast)

### Tipos de Toast

**Sucesso (verde):**
- "Profissional adicionado com sucesso!"
- "Serviço atualizado com sucesso!"
- "Agendamento cancelado"
- "Salvo!"

**Erro (vermelho):**
- "Erro ao adicionar profissional: [motivo]"
- "Limite de profissionais atingido. Upgrade para adicionar mais"
- "Horário não disponível"
- "Erro ao salvar. Tente novamente."

**Aviso (amarelo):**
- "Salvando..."
- "Aguarde enquanto processamos..."
- "Este profissional possui agendamentos futuros"

**Info (azul):**
- "Agendamento criado. Email de confirmação enviado."
- "Alterações salvas automaticamente"

### Posicionamento

- **Desktop:** Top-right, stack vertical
- **Mobile:** Top-center, full-width
- **Duração:** 3 segundos (sucesso), 5 segundos (erro)
- **Ação:** Botão "X" para fechar manualmente

### Exemplo de Uso

```typescript
// Sucesso
toast.success("Profissional adicionado com sucesso!");

// Erro
toast.error("Limite de profissionais atingido. Upgrade para adicionar mais");

// Aviso
toast.warning("Salvando...");

// Info
toast.info("Alterações salvas automaticamente");
```

---

## 🔐 Validação de Plano

### Como Validar

**Antes de Criar Profissional:**
```typescript
1. Buscar plano do tenant (GET /api/companies?select=plano)
2. Contar profissionais ativos (GET /api/profissionais?ativo=true)
3. Verificar limite:
   - Se plano = 'basico' e count >= 2 → erro 403
   - Se plano = 'intermediario' e count >= 5 → erro 403
   - Se plano = 'premium' → sem limite
4. Se no limite: mostrar toast com mensagem de upgrade
```

**Mensagens de Upgrade:**

**Plano Básico:**
```
⚠️ Limite de profissionais atingido
Você atingiu o limite de 2 profissionais do plano básico.
[Upgrade para intermediário] para ter até 5 profissionais.
```

**Plano Intermediário:**
```
⚠️ Limite de profissionais atingido
Você atingiu o limite de 5 profissionais do plano intermediário.
[Upgrade para premium] para ter profissionais ilimitados.
```

**Verificação no Frontend:**
- Mostrar contador: "2 de 2 profissionais"
- Desabilitar botão "Adicionar" se no limite
- Mostrar banner de upgrade acima da tabela

---

## 🎯 Componentes Reutilizáveis

### 1. DashboardHeader
- Logo, nome do negócio, notificações, avatar

### 2. DashboardSidebar
- Menu lateral com links, collapse/expand

### 3. CardKPI
- Título, valor, ícone, cor

### 4. DataTable
- Sorting, paginação, filtros, ações

### 5. Modal
- Adicionar, editar, confirmar (genérico)

### 6. FormField
- Input com label, validação, erro

### 7. StatusBadge
- Badge colorido (confirmado, cancelado, etc)

### 8. Button
- Variantes: primary, secondary, danger, ghost

### 9. LoadingSkeleton
- Placeholder durante carregamento

### 10. EmptyState
- Ilustração quando lista vazia

### 11. Toast
- Notificações (sucesso, erro, aviso, info)

---

## 🎨 UX/UI Detalhes

### Cores
- Usar tema da tenant (cor primária + secundária)
- Cores padrão se não configurado

### Ícones
- lucide-react para todos os ícones

### Feedback
- Toast após cada ação
- Loading spinner em botões
- Confirmação modal para ações destrutivas

### Estados
- Loading: skeleton ou spinner
- Error: mensagem clara + botão "Tentar novamente"
- Empty: ilustração + mensagem + CTA

### Performance
- Lazy load das páginas
- Caching com React Query
- Debounce em filtros de search
- Virtualização de tabelas grandes (se necessário)

---

## ✅ Pontos Principais Implementados

1. ✅ **Layout completo** (header, sidebar, main)
2. ✅ **9 páginas** documentadas
3. ✅ **Tabelas** com colunas definidas
4. ✅ **Formulários** com campos e validações
5. ✅ **Permissões** e validações de plano
6. ✅ **Responsividade** mobile-first
7. ✅ **Chamadas API** listadas
8. ✅ **Toast notifications** padronizadas
9. ✅ **Validação de plano** documentada
10. ✅ **Componentes reutilizáveis** listados

Tudo estruturado e documentado. Pronto para implementação.

