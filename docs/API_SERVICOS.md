# API de Serviços - Documentação

## 📋 Visão Geral

API REST para gerenciar serviços (cortes, barba, manicure, etc) com suporte multi-tenant. Todas as rotas requerem `x-tenant-id` no header e validam isolamento por tenant.

## 🔄 Fluxos das Rotas

### 1. GET /api/servicos

**Fluxo:**
```
Request com header x-tenant-id
  ↓
Valida tenant_id (UUID + existe no banco)
  ↓
Busca serviços ativos do tenant
  ├─ Filtra por tenant_id
  ├─ Filtra por ativo = true
  └─ Ordena por nome (A-Z)
  ↓
Retorna array de serviços
```

**Validações:**
- ✅ `x-tenant-id` obrigatório no header
- ✅ `tenant_id` deve ser UUID válido
- ✅ `tenant_id` deve existir na tabela `companies`
- ✅ Apenas serviços com `ativo = true`

**Status HTTP:**
- `200` - Sucesso
- `401` - Tenant ID inválido ou não fornecido
- `500` - Erro interno do servidor

---

### 2. POST /api/servicos

**Fluxo:**
```
Request com header x-tenant-id + body
  ↓
Valida tenant_id
  ↓
Valida campos obrigatórios:
  ├─ nome: não vazio, string
  ├─ duracao_minutos: número > 0
  ├─ preco: número >= 0
  ├─ buffer_antes: número >= 0
  └─ buffer_depois: número >= 0
  ↓
Valida nome único por tenant
  ↓
Insere serviço com tenant_id
  ↓
Retorna serviço criado
```

**Validações:**
- ✅ `x-tenant-id` obrigatório no header
- ✅ `nome`: não vazio, string, único por tenant
- ✅ `descricao`: opcional, string ou null
- ✅ `duracao_minutos`: obrigatório, número inteiro > 0
- ✅ `preco`: obrigatório, número >= 0
- ✅ `buffer_antes`: obrigatório, número >= 0
- ✅ `buffer_depois`: obrigatório, número >= 0

**Status HTTP:**
- `201` - Serviço criado com sucesso
- `400` - Dados inválidos (validação falhou)
- `401` - Tenant ID inválido ou não fornecido
- `409` - Nome já existe para este tenant
- `500` - Erro interno do servidor

---

### 3. PUT /api/servicos/[id]

**Fluxo:**
```
Request com header x-tenant-id + body (campos opcionais)
  ↓
Valida tenant_id
  ↓
Valida id do serviço (UUID)
  ↓
Verifica se serviço existe
  ↓
Verifica se serviço pertence ao tenant
  ↓
Valida campos enviados (mesmas regras de POST)
  ↓
Se nome alterado: valida único (exceto próprio serviço)
  ↓
Atualiza apenas campos fornecidos
  ↓
Retorna sucesso
```

**Validações:**
- ✅ `x-tenant-id` obrigatório no header
- ✅ `id` deve ser UUID válido
- ✅ Serviço deve existir
- ✅ Serviço deve pertencer ao tenant
- ✅ Se `nome` enviado: não vazio e único por tenant (exceto próprio)
- ✅ Se `duracao_minutos`: número > 0
- ✅ Se `preco`: número >= 0
- ✅ Se `buffer_antes`: número >= 0
- ✅ Se `buffer_depois`: número >= 0

**Status HTTP:**
- `200` - Serviço atualizado com sucesso
- `400` - Dados inválidos ou ID inválido
- `401` - Tenant ID inválido ou serviço não pertence ao tenant
- `404` - Serviço não encontrado
- `409` - Nome já existe para este tenant
- `500` - Erro interno do servidor

---

### 4. DELETE /api/servicos/[id]

**Fluxo:**
```
Request com header x-tenant-id
  ↓
Valida tenant_id
  ↓
Valida id do serviço (UUID)
  ↓
Verifica se serviço existe
  ↓
Verifica se serviço pertence ao tenant
  ↓
Verifica se há agendamentos futuros
  ├─ Se houver: retorna erro 409
  └─ Se não houver: continua
  ↓
Soft delete: marca ativo = false
  ↓
Retorna sucesso
```

**Validações:**
- ✅ `x-tenant-id` obrigatório no header
- ✅ `id` deve ser UUID válido
- ✅ Serviço deve existir
- ✅ Serviço deve pertencer ao tenant
- ✅ Não deve ter agendamentos futuros confirmados

**Status HTTP:**
- `200` - Serviço removido com sucesso
- `400` - ID do serviço inválido
- `401` - Tenant ID inválido ou serviço não pertence ao tenant
- `404` - Serviço não encontrado
- `409` - Serviço possui agendamentos futuros
- `500` - Erro interno do servidor

---

## 🔐 Row Level Security (RLS)

### Estratégia de Isolamento

**Em API Routes:**
- Cliente Supabase usa `service role key` (bypass RLS)
- Validação manual garante isolamento por tenant
- Todas as queries incluem filtro `WHERE tenant_id = :tenant_id`

**Políticas RLS (para uso direto do cliente):**
```sql
-- SELECT: usuário só vê serviços do seu tenant
CREATE POLICY "servicos_select" ON servicos
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));

-- INSERT: usuário só cria serviços no seu tenant
CREATE POLICY "servicos_insert" ON servicos
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));

-- UPDATE: usuário só atualiza serviços do seu tenant
CREATE POLICY "servicos_update" ON servicos
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));

-- DELETE: usuário só deleta serviços do seu tenant
CREATE POLICY "servicos_delete" ON servicos
  FOR DELETE
  USING (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));
```

**Validação Manual (API Routes):**
- Todas as queries incluem `.eq('tenant_id', tenantId)`
- Verificação de pertencimento antes de UPDATE/DELETE
- Validação de tenant_id no middleware

---

## 📊 Estrutura de Dados

### Tabela: `servicos`

```sql
id: UUID (PK)
tenant_id: UUID (FK -> companies.id)
nome: TEXT (NOT NULL)
descricao: TEXT (NULLABLE)
duracao_minutos: INTEGER (NOT NULL)
preco: DECIMAL(10,2) (NOT NULL)
buffer_antes: INTEGER (NOT NULL, default 0)
buffer_depois: INTEGER (NOT NULL, default 0)
ativo: BOOLEAN (NOT NULL, default true)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Índices Recomendados

```sql
CREATE INDEX idx_servicos_tenant_id ON servicos(tenant_id);
CREATE INDEX idx_servicos_tenant_id_ativo ON servicos(tenant_id, ativo);
CREATE UNIQUE INDEX idx_servicos_tenant_nome_unique ON servicos(tenant_id, nome) WHERE ativo = true;
```

---

## 🛡️ Middleware de Validação

### Função: `validateTenant()`

**Fluxo:**
```
Recebe tenant_id e userId (opcional)
  ↓
Valida se tenant_id existe
  ↓
Valida formato UUID
  ↓
Verifica se tenant existe no banco
  ↓
Se userId fornecido: verifica acesso do usuário
  ↓
Retorna { valid, error?, status? }
```

**Validações:**
- ✅ `tenant_id` não nulo
- ✅ `tenant_id` é UUID válido
- ✅ Tenant existe na tabela `companies`
- ✅ Se `userId` fornecido: usuário tem acesso ao tenant

**Retorno:**
- `{ valid: true }` - Tenant válido
- `{ valid: false, error: string, status: number }` - Tenant inválido

---

## 📝 Exemplos de Uso

### GET /api/servicos

**Request:**
```http
GET /api/servicos
Headers:
  x-tenant-id: 123e4567-e89b-12d3-a456-426614174000
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc-123",
      "nome": "Corte Masculino",
      "descricao": "Corte moderno",
      "duracao_minutos": 30,
      "preco": 25.00,
      "buffer_antes": 5,
      "buffer_depois": 5
    }
  ]
}
```

### POST /api/servicos

**Request:**
```http
POST /api/servicos
Headers:
  x-tenant-id: 123e4567-e89b-12d3-a456-426614174000
Body:
{
  "nome": "Corte Masculino",
  "descricao": "Corte moderno",
  "duracao_minutos": 30,
  "preco": 25.00,
  "buffer_antes": 5,
  "buffer_depois": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "servico_id": "abc-123",
  "message": "Serviço criado com sucesso"
}
```

### PUT /api/servicos/[id]

**Request:**
```http
PUT /api/servicos/abc-123
Headers:
  x-tenant-id: 123e4567-e89b-12d3-a456-426614174000
Body:
{
  "preco": 30.00,
  "duracao_minutos": 35
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Serviço atualizado com sucesso"
}
```

### DELETE /api/servicos/[id]

**Request:**
```http
DELETE /api/servicos/abc-123
Headers:
  x-tenant-id: 123e4567-e89b-12d3-a456-426614174000
```

**Response (200):**
```json
{
  "success": true,
  "message": "Serviço removido com sucesso"
}
```

---

## ⚠️ Tratamento de Erros

### Regras Gerais

1. **Nunca expor erro interno do banco ao cliente**
   - Log no console do servidor
   - Retornar mensagem genérica: "Erro interno do servidor"

2. **Status HTTP apropriado**
   - `200` - Sucesso (GET, PUT, DELETE)
   - `201` - Criado (POST)
   - `400` - Dados inválidos
   - `401` - Não autorizado (tenant inválido)
   - `404` - Não encontrado
   - `409` - Conflito (nome duplicado, agendamentos futuros)
   - `500` - Erro interno

3. **Log de erros**
   - Todos os erros são logados no console
   - Incluir contexto (rota, tenant_id, erro)

4. **Validação sempre primeiro**
   - Validar tenant_id antes de qualquer operação
   - Validar dados antes de inserir/atualizar

---

## 🔄 Integração com Middleware de Subdomínios

O middleware de subdomínios (`middleware.ts`) adiciona `x-tenant-id` automaticamente baseado no subdomínio acessado. As rotas de API podem confiar neste header, mas ainda validam:

1. Header existe
2. Formato UUID válido
3. Tenant existe no banco
4. Usuário tem acesso (se autenticado)

---

## 📋 Checklist de Implementação

- [x] Rota GET /api/servicos
- [x] Rota POST /api/servicos
- [x] Rota PUT /api/servicos/[id]
- [x] Rota DELETE /api/servicos/[id]
- [x] Middleware de validação de tenant
- [x] Validações de campos
- [x] Tratamento de erros
- [x] Log de erros
- [x] Status HTTP apropriados
- [ ] Criar tabela `servicos` no Supabase
- [ ] Criar políticas RLS
- [ ] Criar índices
- [ ] Testes unitários
- [ ] Testes de integração

