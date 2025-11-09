# API de Profissionais - Documentação

## 📋 Visão Geral

API REST para gerenciar profissionais (barbeiros, manicures, etc) com suporte multi-tenant, validação de limites por plano e associação de serviços.

## 🔄 Fluxos das Rotas

### 1. GET /api/profissionais

**Fluxo:**
```
Request com header x-tenant-id
  ↓
Parâmetro opcional: ?servico_id=xxx
  ↓
Valida tenant_id
  ↓
Se servico_id fornecido:
  ├─ Valida servico_id (UUID)
  ├─ Valida se serviço pertence ao tenant
  └─ Busca profissionais com esse serviço (JOIN)
  ↓
Se servico_id não fornecido:
  └─ Busca todos os profissionais ativos
  ↓
Para cada profissional, conta serviços associados
  ↓
Ordena por nome (A-Z)
  ↓
Retorna array
```

**Validações:**
- ✅ `x-tenant-id` obrigatório no header
- ✅ Se `servico_id` fornecido: deve ser UUID válido e pertencer ao tenant
- ✅ Apenas profissionais com `ativo = true`

**Status HTTP:**
- `200` - Sucesso
- `400` - servico_id inválido (se fornecido)
- `401` - Tenant ID inválido
- `404` - Serviço não encontrado (se servico_id fornecido)
- `500` - Erro interno

---

### 2. POST /api/profissionais

**Fluxo:**
```
Request com header x-tenant-id + body
  ↓
Valida tenant_id
  ↓
Valida campos:
  ├─ nome: mínimo 2, máximo 100 caracteres
  └─ foto_url: opcional, URL válida
  ↓
Busca plano do tenant (tabela companies)
  ↓
Conta profissionais ativos do tenant
  ↓
Verifica limite do plano:
  ├─ Plano 'basico': máximo 2 profissionais
  ├─ Plano 'intermediario': máximo 5 profissionais
  └─ Plano 'premium': sem limite
  ↓
Se exceder limite: retorna erro 403
  ↓
Se dentro do limite: insere profissional
  ↓
Retorna profissional criado
```

**Validações:**
- ✅ `x-tenant-id` obrigatório
- ✅ `nome`: obrigatório, 2-100 caracteres
- ✅ `foto_url`: opcional, URL válida
- ✅ Plano do tenant deve existir
- ✅ Contagem de profissionais ativos deve respeitar limite

**Como Contar Profissionais:**
```sql
SELECT COUNT(*) FROM profissionais
WHERE tenant_id = :tenant_id
  AND ativo = true
```

**Limites por Plano:**
| Plano | Limite | Mensagem de Erro |
|-------|--------|------------------|
| `basico` | 2 profissionais | "Plano básico permite apenas 2 profissionais. Upgrade para intermediário para ter até 5 profissionais." |
| `intermediario` | 5 profissionais | "Plano intermediário permite apenas 5 profissionais. Upgrade para premium para ter profissionais ilimitados." |
| `premium` | Sem limite | - |

**Status HTTP:**
- `201` - Profissional criado
- `400` - Dados inválidos
- `401` - Tenant ID inválido
- `403` - Limite de profissionais excedido
- `500` - Erro interno

---

### 3. PUT /api/profissionais/[id]

**Fluxo:**
```
Request com header x-tenant-id + body (campos opcionais)
  ↓
Valida tenant_id
  ↓
Valida id do profissional (UUID)
  ↓
Verifica se profissional existe
  ↓
Verifica se profissional pertence ao tenant
  ↓
Valida campos enviados:
  ├─ nome: 2-100 caracteres (se fornecido)
  └─ foto_url: URL válida (se fornecido)
  ↓
Atualiza apenas campos fornecidos
  ↓
Retorna sucesso
```

**Validações:**
- ✅ `x-tenant-id` obrigatório
- ✅ `id` deve ser UUID válido
- ✅ Profissional deve existir e pertencer ao tenant
- ✅ Se `nome` enviado: 2-100 caracteres
- ✅ Se `foto_url` enviado: URL válida

**Status HTTP:**
- `200` - Atualizado
- `400` - Dados inválidos
- `401` - Não autorizado
- `404` - Profissional não encontrado
- `500` - Erro interno

---

### 4. DELETE /api/profissionais/[id]

**Fluxo:**
```
Request com header x-tenant-id
  ↓
Valida tenant_id
  ↓
Valida id do profissional (UUID)
  ↓
Verifica se profissional existe
  ↓
Verifica se profissional pertence ao tenant
  ↓
Verifica agendamentos futuros confirmados
  ├─ Se houver: retorna erro 409
  └─ Se não houver: continua
  ↓
Soft delete: marca ativo = false
  ↓
Retorna sucesso
```

**Validações:**
- ✅ `x-tenant-id` obrigatório
- ✅ `id` deve ser UUID válido
- ✅ Profissional deve existir e pertencer ao tenant
- ✅ Não deve ter agendamentos futuros confirmados

**Verificação de Agendamentos:**
```sql
SELECT COUNT(*) FROM agendamentos
WHERE profissional_id = :profissional_id
  AND tenant_id = :tenant_id
  AND data >= CURRENT_DATE
  AND status = 'confirmado'
```

**Status HTTP:**
- `200` - Removido
- `400` - ID inválido
- `401` - Não autorizado
- `404` - Profissional não encontrado
- `409` - Possui agendamentos futuros
- `500` - Erro interno

---

### 5. POST /api/profissionais/[id]/servicos

**Fluxo:**
```
Request com header x-tenant-id + body { servico_id: [array] }
  ↓
Valida tenant_id
  ↓
Valida id do profissional (UUID)
  ↓
Verifica se profissional existe e pertence ao tenant
  ↓
Valida array de servico_id:
  ├─ Deve ser array
  ├─ Cada ID deve ser UUID válido
  └─ Remove duplicatas
  ↓
Valida cada serviço:
  ├─ Serviço deve existir
  ├─ Serviço deve pertencer ao tenant
  └─ Serviço deve estar ativo
  ↓
Remove associações antigas (DELETE)
  ↓
Insere novas associações (INSERT em lote)
  ↓
Retorna sucesso com lista de serviços associados
```

**Fluxo de Associação Serviço-Profissional:**

1. **Validação Inicial:**
   - Verifica se profissional existe e pertence ao tenant

2. **Validação de Serviços:**
   - Para cada `servico_id` no array:
     a. Valida formato UUID
     b. Verifica se serviço existe
     c. Verifica se serviço pertence ao tenant
     d. Verifica se serviço está ativo
   - Se algum serviço inválido: retorna erro 400/404

3. **Limpeza de Associações Antigas:**
   ```sql
   DELETE FROM profissional_servico
   WHERE profissional_id = :profissional_id
     AND tenant_id = :tenant_id
   ```

4. **Inserção de Novas Associações:**
   ```sql
   INSERT INTO profissional_servico (profissional_id, servico_id, tenant_id)
   VALUES
     (:profissional_id, :servico_id_1, :tenant_id),
     (:profissional_id, :servico_id_2, :tenant_id),
     ...
   ```

5. **Retorno:**
   - Lista de IDs dos serviços associados
   - Confirmação de sucesso

**Estrutura da Tabela `profissional_servico`:**
```sql
id: UUID (PK)
profissional_id: UUID (FK -> profissionais.id)
servico_id: UUID (FK -> servicos.id)
tenant_id: UUID (FK -> companies.id) -- para garantir isolamento
created_at: TIMESTAMP
```

**Validações:**
- ✅ `x-tenant-id` obrigatório
- ✅ `servico_id` deve ser array
- ✅ Cada ID deve ser UUID válido
- ✅ Cada serviço deve existir e pertencer ao tenant
- ✅ Serviços devem estar ativos

**Status HTTP:**
- `200` - Serviços associados
- `400` - Dados inválidos
- `401` - Não autorizado
- `404` - Profissional ou serviço não encontrado
- `500` - Erro interno

---

### 6. GET /api/profissionais/[id]/disponibilidade?data=2024-01-15

**Fluxo:**
```
Request com header x-tenant-id
  ↓
Parâmetro obrigatório: ?data=YYYY-MM-DD
  ↓
Valida tenant_id
  ↓
Valida id do profissional (UUID)
  ↓
Valida formato da data (YYYY-MM-DD)
  ↓
Valida se data não é no passado
  ↓
Verifica se profissional existe e pertence ao tenant
  ↓
Chama função RPC: buscar_horarios_disponiveis
  ├─ Parâmetros: profissional_id, tenant_id, data
  └─ Retorna: array de { hora, disponivel }
  ↓
Retorna horários disponíveis
```

**Validações:**
- ✅ `x-tenant-id` obrigatório
- ✅ `data` obrigatória na query string
- ✅ `data` no formato YYYY-MM-DD
- ✅ `data` não pode ser no passado
- ✅ Profissional deve existir e pertencer ao tenant

**Função RPC: `buscar_horarios_disponiveis`**

Assinatura:
```sql
CREATE OR REPLACE FUNCTION buscar_horarios_disponiveis(
  p_profissional_id UUID,
  p_tenant_id UUID,
  p_data DATE
)
RETURNS TABLE (
  hora TIME,
  disponivel BOOLEAN
) AS $$
BEGIN
  -- Lógica:
  -- 1. Busca horários de funcionamento do tenant
  -- 2. Busca agendamentos confirmados do profissional na data
  -- 3. Calcula slots disponíveis considerando:
  --    - Horário de funcionamento
  --    - Agendamentos existentes
  --    - Duração dos serviços do profissional
  --    - Buffers (antes e depois)
  -- 4. Retorna array de horários com disponibilidade
END;
$$ LANGUAGE plpgsql;
```

**Retorno:**
```json
{
  "success": true,
  "data": "2024-01-15",
  "profissional_id": "abc-123",
  "horarios": [
    { "hora": "09:00", "disponivel": true },
    { "hora": "09:30", "disponivel": false },
    { "hora": "10:00", "disponivel": true }
  ]
}
```

**Status HTTP:**
- `200` - Sucesso
- `400` - Dados inválidos (data inválida)
- `401` - Não autorizado
- `404` - Profissional não encontrado
- `500` - Erro interno

---

## 📊 Estrutura de Dados

### Tabela: `profissionais`

```sql
id: UUID (PK)
tenant_id: UUID (FK -> companies.id)
nome: TEXT (NOT NULL, 2-100 caracteres)
foto_url: TEXT (NULLABLE, URL válida)
ativo: BOOLEAN (NOT NULL, default true)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Tabela: `profissional_servico`

```sql
id: UUID (PK)
profissional_id: UUID (FK -> profissionais.id)
servico_id: UUID (FK -> servicos.id)
tenant_id: UUID (FK -> companies.id) -- para garantir isolamento
created_at: TIMESTAMP
```

### Índices Recomendados

```sql
CREATE INDEX idx_profissionais_tenant_id ON profissionais(tenant_id);
CREATE INDEX idx_profissionais_tenant_id_ativo ON profissionais(tenant_id, ativo);
CREATE INDEX idx_profissional_servico_profissional ON profissional_servico(profissional_id);
CREATE INDEX idx_profissional_servico_servico ON profissional_servico(servico_id);
CREATE INDEX idx_profissional_servico_tenant ON profissional_servico(tenant_id);
```

---

## 🔐 Validações Gerais

### Nome
- **Mínimo:** 2 caracteres
- **Máximo:** 100 caracteres
- **Tipo:** String
- **Obrigatório:** Sim (POST)

### Foto URL
- **Tipo:** String (URL válida)
- **Obrigatório:** Não
- **Validação:** Deve ser URL válida (usar `new URL()`)

### Tenant ID
- **Sempre validado** em todas as rotas
- **Formato:** UUID válido
- **Fonte:** Header `x-tenant-id`

### Contagem de Profissionais
- **Sempre contado antes de criar** novo profissional
- **Query:** `SELECT COUNT(*) WHERE tenant_id = :tenant_id AND ativo = true`
- **Uso:** Verificar limite do plano

### Consulta de Plano
- **Tabela:** `companies`
- **Campo:** `plano`
- **Valores:** 'basico', 'intermediario', 'premium'
- **Uso:** Determinar limite de profissionais

---

## ⚠️ Tratamento de Erro para Limite de Plano

### Mensagens de Erro 403

**Plano Básico:**
```json
{
  "success": false,
  "message": "Plano básico permite apenas 2 profissionais. Upgrade para intermediário para ter até 5 profissionais."
}
```

**Plano Intermediário:**
```json
{
  "success": false,
  "message": "Plano intermediário permite apenas 5 profissionais. Upgrade para premium para ter profissionais ilimitados."
}
```

### Status HTTP: `403 Forbidden`

Usado quando:
- Tentativa de criar profissional além do limite do plano
- Mensagem clara indicando limite atual e opção de upgrade

---

## 📋 Resumo de Status HTTP por Rota

| Rota | Método | Status de Sucesso | Status de Erro |
|------|--------|-------------------|----------------|
| `/api/profissionais` | GET | `200` | `400`, `401`, `404`, `500` |
| `/api/profissionais` | POST | `201` | `400`, `401`, `403`, `500` |
| `/api/profissionais/[id]` | PUT | `200` | `400`, `401`, `404`, `500` |
| `/api/profissionais/[id]` | DELETE | `200` | `400`, `401`, `404`, `409`, `500` |
| `/api/profissionais/[id]/servicos` | POST | `200` | `400`, `401`, `404`, `500` |
| `/api/profissionais/[id]/disponibilidade` | GET | `200` | `400`, `401`, `404`, `500` |

---

## 🎯 Pontos Principais Implementados

1. ✅ **Listagem de profissionais** com filtro opcional por serviço
2. ✅ **Criação com validação de limite por plano**
3. ✅ **Atualização** de dados do profissional
4. ✅ **Soft delete** com verificação de agendamentos
5. ✅ **Associação serviço-profissional** (limpa e recria)
6. ✅ **Consulta de disponibilidade** via função RPC
7. ✅ **Validações completas** (nome, URL, UUID, etc)
8. ✅ **Isolamento por tenant** em todas as queries
9. ✅ **Tratamento de erros** apropriado
10. ✅ **Mensagens claras** para limite de plano

Tudo estruturado e documentado. Pronto para integração com o banco de dados.

