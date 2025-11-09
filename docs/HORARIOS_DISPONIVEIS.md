# API de Horários Disponíveis - Documentação

## 📋 Visão Geral

API REST para buscar horários disponíveis de um profissional em uma data específica, considerando agendamentos, bloqueios, buffers e horário de funcionamento.

## 🔄 Fluxo Completo de Verificação de Disponibilidade

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VALIDAÇÃO INICIAL                                         │
│    - Recebe body (POST) ou query params (GET)               │
│    - Valida tenant_id do header                             │
│    - Valida campos obrigatórios                             │
│    - Valida formato e range da data                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDAÇÃO DE EXISTÊNCIA                                   │
│    - Verifica se tenant existe                              │
│    - Verifica se profissional existe e pertence ao tenant   │
│    - Verifica se serviço existe e pertence ao tenant       │
│    - Busca dados do serviço (duração, buffers)             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CONSULTA HORÁRIO DE FUNCIONAMENTO                         │
│    - Calcula dia_semana da data                            │
│    - Busca horario_funcionamento para dia_semana           │
│    - Se fechado → retorna array vazio                      │
│    - Extrai hora_abertura e hora_fechamento                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GERAÇÃO DE SLOTS                                          │
│    - Gera slots de 30 minutos                               │
│    - Desde hora_abertura até hora_fechamento                │
│    - Exemplo: 09:00, 09:30, 10:00, 10:30, ...             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VALIDAÇÃO POR SLOT (para cada slot)                       │
│    ├─ a) Verifica agendamento confirmado                   │
│    ├─ b) Verifica bloqueio (almoço, etc)                   │
│    ├─ c) Verifica buffer_antes                              │
│    ├─ d) Verifica buffer_depois                              │
│    └─ e) Verifica se não ultrapassa fechamento              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CHAMADA DA FUNÇÃO RPC                                     │
│    - Chama buscar_horarios_disponiveis()                    │
│    - Passa: tenant_id, profissional_id, data, duração      │
│    - Função faz toda lógica em uma única query             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. FORMATAÇÃO DA RESPOSTA                                    │
│    - Processa resultado da RPC                              │
│    - Adiciona informações extras                            │
│    - Retorna JSON formatado                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ As 5 Validações por Slot

Para cada slot gerado (ex: 09:00, 09:30, 10:00), são feitas 5 validações:

### a) Verifica Agendamento Confirmado

**Lógica:**
- Busca em `agendamentos` onde:
  - `profissional_id` = profissional_id
  - `data` = data consultada
  - `status` = 'confirmado'
  - Verifica sobreposição de horários:
    - `horario_inicio <= slot_fim` AND `horario_fim >= slot_inicio`

**Exemplo:**
- Slot: 10:00 - 10:30
- Agendamento: 09:45 - 10:15
- Resultado: **Não disponível** (sobrepõe)

**Motivo:** "Agendado"

---

### b) Verifica Bloqueio (Almoço, Limpeza, etc)

**Lógica:**
- Busca em `bloqueios_horario` onde:
  - `tenant_id` = tenant_id
  - `data` = data consultada (ou NULL para recorrente)
  - `dia_semana` = dia_semana (se recorrente)
  - Verifica sobreposição:
    - `horario_inicio <= slot_fim` AND `horario_fim >= slot_inicio`

**Exemplo:**
- Slot: 12:00 - 12:30
- Bloqueio: 12:00 - 13:00 (almoço)
- Resultado: **Não disponível** (sobrepõe)

**Motivo:** "Bloqueado"

---

### c) Verifica Buffer Antes

**Lógica:**
- Calcula `slot_anterior` = slot - `buffer_antes` minutos
- Verifica se `slot_anterior` está disponível:
  - Não tem agendamento confirmado
  - Não tem bloqueio
- Se `slot_anterior` ocupado → slot atual não disponível

**Exemplo:**
- Serviço: buffer_antes = 10 minutos
- Slot: 10:00 - 10:30
- Slot anterior (09:50 - 10:00) tem agendamento
- Resultado: **Não disponível** (buffer antes ocupado)

**Motivo:** "Buffer de limpeza"

**Como Funciona:**
- Buffer antes garante tempo de limpeza/preparação antes do serviço
- Se o slot anterior está ocupado, não há tempo para limpeza
- Portanto, o slot atual não pode ser usado

---

### d) Verifica Buffer Depois

**Lógica:**
- Calcula `horario_fim_real` = slot + `duracao_minutos` + `buffer_depois`
- Verifica se `horario_fim_real` não ultrapassa `hora_fechamento`
- Se ultrapassa → slot não disponível

**Exemplo:**
- Serviço: duracao_minutos = 30, buffer_depois = 10
- Slot: 17:30 - 18:00
- Horário fim real: 18:00 + 10 = 18:10
- Fechamento: 18:00
- Resultado: **Não disponível** (ultrapassa fechamento)

**Motivo:** "Fora do horário"

**Como Funciona:**
- Buffer depois garante tempo de limpeza após o serviço
- O horário de fim real (serviço + buffer) não pode ultrapassar o fechamento
- Se ultrapassar, o slot não pode ser usado

---

### e) Verifica se Não Ultrapassa Fechamento

**Lógica:**
- Calcula `horario_fim` = slot + `duracao_minutos`
- Verifica se `horario_fim <= hora_fechamento`
- Se ultrapassa → slot não disponível

**Exemplo:**
- Serviço: duracao_minutos = 45
- Slot: 17:30 - 18:00
- Horário fim: 17:30 + 45 = 18:15
- Fechamento: 18:00
- Resultado: **Não disponível** (ultrapassa fechamento)

**Motivo:** "Fora do horário"

---

## 🔧 Como os Buffers Funcionam

### Buffer Antes

**Propósito:** Garantir tempo de limpeza/preparação antes do serviço

**Funcionamento:**
1. Para cada slot, calcula `slot_anterior` = slot - `buffer_antes` minutos
2. Verifica se `slot_anterior` está livre (sem agendamento/bloqueio)
3. Se `slot_anterior` ocupado → slot atual não disponível

**Exemplo Prático:**
```
Serviço: Corte (30 min) com buffer_antes = 10 min
Slot avaliado: 10:00 - 10:30

1. Calcula slot anterior: 09:50 - 10:00
2. Verifica se 09:50-10:00 está livre
3. Se ocupado → 10:00 não disponível (não há tempo para limpeza)
4. Se livre → 10:00 disponível
```

### Buffer Depois

**Propósito:** Garantir tempo de limpeza após o serviço

**Funcionamento:**
1. Para cada slot, calcula `horario_fim_real` = slot + `duracao_minutos` + `buffer_depois`
2. Verifica se `horario_fim_real <= hora_fechamento`
3. Se ultrapassa → slot não disponível

**Exemplo Prático:**
```
Serviço: Corte (30 min) com buffer_depois = 10 min
Slot avaliado: 17:30 - 18:00
Fechamento: 18:00

1. Calcula horário fim real: 17:30 + 30 + 10 = 18:10
2. Verifica se 18:10 <= 18:00
3. Se ultrapassa → 17:30 não disponível (não há tempo para limpeza)
4. Se não ultrapassa → 17:30 disponível
```

### Resumo dos Buffers

| Buffer | Quando Aplica | O Que Verifica | Motivo de Indisponibilidade |
|--------|---------------|----------------|----------------------------|
| **Antes** | Antes do serviço | Slot anterior está livre? | Não há tempo para preparação |
| **Depois** | Depois do serviço | Horário fim real <= fechamento? | Não há tempo para limpeza |

---

## 📊 Exemplo de Resposta JSON Completa

### Caso 1: Resposta com Horários Disponíveis

```json
{
  "sucesso": true,
  "horarios": [
    { "hora": "09:00", "disponivel": true },
    { "hora": "09:30", "disponivel": true },
    { "hora": "10:00", "disponivel": false, "motivo": "Agendado" },
    { "hora": "10:30", "disponivel": false, "motivo": "Agendado" },
    { "hora": "11:00", "disponivel": true },
    { "hora": "11:30", "disponivel": true },
    { "hora": "12:00", "disponivel": false, "motivo": "Bloqueado" },
    { "hora": "12:30", "disponivel": false, "motivo": "Bloqueado" },
    { "hora": "13:00", "disponivel": true },
    { "hora": "13:30", "disponivel": true },
    { "hora": "14:00", "disponivel": false, "motivo": "Buffer de limpeza" },
    { "hora": "14:30", "disponivel": true },
    { "hora": "15:00", "disponivel": true },
    { "hora": "15:30", "disponivel": true },
    { "hora": "16:00", "disponivel": true },
    { "hora": "16:30", "disponivel": true },
    { "hora": "17:00", "disponivel": true },
    { "hora": "17:30", "disponivel": false, "motivo": "Fora do horário" }
  ],
  "data_formatada": "15/01/2024",
  "dia_semana": "Segunda-feira",
  "total_slots": 18,
  "slots_disponiveis": 12
}
```

### Caso 2: Barbearia Fechada

```json
{
  "sucesso": true,
  "horarios": [],
  "data_formatada": "14/01/2024",
  "dia_semana": "Domingo",
  "total_slots": 0,
  "slots_disponiveis": 0
}
```

### Caso 3: Todos os Horários Ocupados

```json
{
  "sucesso": true,
  "horarios": [
    { "hora": "09:00", "disponivel": false, "motivo": "Agendado" },
    { "hora": "09:30", "disponivel": false, "motivo": "Agendado" },
    { "hora": "10:00", "disponivel": false, "motivo": "Agendado" }
  ],
  "data_formatada": "15/01/2024",
  "dia_semana": "Segunda-feira",
  "total_slots": 3,
  "slots_disponiveis": 0
}
```

---

## 🔌 Integração com Função RPC

### Assinatura da Função

```sql
CREATE OR REPLACE FUNCTION buscar_horarios_disponiveis(
  p_tenant_id UUID,
  p_profissional_id UUID,
  p_data DATE,
  p_duracao_minutos INTEGER,
  p_buffer_antes INTEGER,
  p_buffer_depois INTEGER
)
RETURNS TABLE (
  hora TIME,
  disponivel BOOLEAN,
  motivo TEXT
) AS $$
BEGIN
  -- Lógica completa implementada em SQL
  -- Retorna array de horários com disponibilidade
END;
$$ LANGUAGE plpgsql;
```

### Como a Função RPC é Chamada

**No código da API:**
```typescript
const { data: horarios, error: rpcError } = await supabase.rpc(
  'buscar_horarios_disponiveis',
  {
    p_tenant_id: tenantId,
    p_profissional_id: profissional_id,
    p_data: data,
    p_duracao_minutos: servico.duracao_minutos,
    p_buffer_antes: servico.buffer_antes,
    p_buffer_depois: servico.buffer_depois,
  }
);
```

### Parâmetros Passados

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `p_tenant_id` | UUID | ID do tenant |
| `p_profissional_id` | UUID | ID do profissional |
| `p_data` | DATE | Data no formato YYYY-MM-DD |
| `p_duracao_minutos` | INTEGER | Duração do serviço em minutos |
| `p_buffer_antes` | INTEGER | Buffer antes em minutos |
| `p_buffer_depois` | INTEGER | Buffer depois em minutos |

### Retorno da Função RPC

```sql
-- Retorna array de objetos:
[
  { hora: '09:00', disponivel: true, motivo: NULL },
  { hora: '09:30', disponivel: false, motivo: 'Agendado' },
  { hora: '10:00', disponivel: true, motivo: NULL }
]
```

### Lógica Interna da Função RPC

A função RPC executa em uma única query:

1. **Busca horário de funcionamento:**
   ```sql
   SELECT hora_abertura, hora_fechamento
   FROM horario_funcionamento
   WHERE tenant_id = p_tenant_id
     AND dia_semana = EXTRACT(DOW FROM p_data)
   ```

2. **Gera slots de 30 minutos:**
   ```sql
   -- Gera série de horários de 30 em 30 minutos
   -- Desde hora_abertura até hora_fechamento
   ```

3. **Para cada slot, valida:**
   - Agendamentos confirmados
   - Bloqueios
   - Buffer antes
   - Buffer depois
   - Limite de fechamento

4. **Retorna resultado formatado:**
   ```sql
   SELECT hora, disponivel, motivo
   FROM slots_gerados
   ORDER BY hora
   ```

---

## ⚠️ Casos de Erro Possíveis

### 400 - Bad Request

**Campos obrigatórios faltando:**
```json
{
  "sucesso": false,
  "mensagem": "Campos obrigatórios: profissional_id, data, servico_id"
}
```

**Formato inválido:**
```json
{
  "sucesso": false,
  "mensagem": "IDs inválidos (formato UUID)"
}
```

### 401 - Unauthorized

**Tenant ID inválido:**
```json
{
  "sucesso": false,
  "mensagem": "Tenant ID não fornecido"
}
```

**Tenant não encontrado:**
```json
{
  "sucesso": false,
  "mensagem": "Tenant não encontrado"
}
```

### 404 - Not Found

**Profissional não encontrado:**
```json
{
  "sucesso": false,
  "mensagem": "Profissional não encontrado"
}
```

**Serviço não encontrado:**
```json
{
  "sucesso": false,
  "mensagem": "Serviço não encontrado ou inativo"
}
```

### 422 - Unprocessable Entity

**Data no passado:**
```json
{
  "sucesso": false,
  "mensagem": "Data não pode ser no passado"
}
```

**Data muito no futuro:**
```json
{
  "sucesso": false,
  "mensagem": "Data não pode ser mais de 90 dias no futuro"
}
```

**Formato de data inválido:**
```json
{
  "sucesso": false,
  "mensagem": "Data deve estar no formato YYYY-MM-DD"
}
```

### 500 - Internal Server Error

**Erro na função RPC:**
```json
{
  "sucesso": false,
  "mensagem": "Erro ao buscar horários disponíveis"
}
```

**Erro interno:**
```json
{
  "sucesso": false,
  "mensagem": "Erro interno do servidor"
}
```

---

## 📋 Resumo de Status HTTP

| Status | Quando Ocorre | Exemplo |
|--------|---------------|---------|
| `200` | Sucesso | Horários retornados |
| `400` | Campos faltando ou formato inválido | UUID inválido |
| `401` | Tenant ID inválido | Tenant não encontrado |
| `404` | Recurso não encontrado | Profissional não existe |
| `422` | Data inválida | Data no passado |
| `500` | Erro interno | Erro na função RPC |

---

## 🚀 Performance e Otimizações

### 1. Query Única
- Função RPC executa toda lógica em uma única query
- Evita múltiplas round-trips ao banco

### 2. Cache (Opcional)
- Cachear resultado por 5 minutos
- Chave: `horarios:{tenant_id}:{profissional_id}:{data}`
- Pode usar Redis no futuro

### 3. Limite de Slots
- Limitar quantidade de slots retornados
- Máximo: 48 slots (24 horas em intervalos de 30 min)

### 4. Índices Recomendados

```sql
-- Tabela agendamentos
CREATE INDEX idx_agendamentos_prof_data ON agendamentos(profissional_id, data, status);

-- Tabela bloqueios_horario
CREATE INDEX idx_bloqueios_tenant_data ON bloqueios_horario(tenant_id, data, dia_semana);

-- Tabela horario_funcionamento
CREATE INDEX idx_horario_func_tenant_dia ON horario_funcionamento(tenant_id, dia_semana);
```

---

## 🎯 Pontos Principais Implementados

1. ✅ **Validação completa** de entrada (campos, formato, range)
2. ✅ **5 validações por slot** (agendamento, bloqueio, buffers, fechamento)
3. ✅ **Buffers inteligentes** (antes e depois)
4. ✅ **Função RPC** para performance (query única)
5. ✅ **Suporte GET e POST** (query string ou body)
6. ✅ **Resposta formatada** com informações extras
7. ✅ **Tratamento de erros** apropriado
8. ✅ **Isolamento por tenant** em todas as queries
9. ✅ **Casos especiais** (barbearia fechada, todos ocupados)
10. ✅ **Documentação completa** do fluxo

Tudo estruturado e documentado. Pronto para integração com o banco de dados.

