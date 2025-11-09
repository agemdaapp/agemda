# ✅ Atualizações do Schema - Concluídas

## 📋 Resumo das Mudanças

O código foi atualizado para usar o schema real criado no Supabase. Todas as referências foram corrigidas.

## ✅ Arquivos Atualizados

### 1. `app/api/auth/signup/route.ts`
- ✅ `nome` → `name`
- ✅ `plano` → `plan`
- ✅ Adicionado `subdomain`
- ✅ Adicionado `owner_email`
- ✅ Adicionado `ativo`

### 2. `app/api/profissionais/route.ts`
- ✅ `plano` → `plan` (na busca do tenant)

### 3. `app/api/servicos/route.ts`
- ✅ `buffer_antes` → `buffer_minutos_antes`
- ✅ `buffer_depois` → `buffer_minutos_depois`
- ✅ Atualizado SELECT para usar nomes corretos
- ✅ Atualizado INSERT para usar nomes corretos

### 4. `app/api/servicos/[id]/route.ts`
- ✅ `buffer_antes` → `buffer_minutos_antes`
- ✅ `buffer_depois` → `buffer_minutos_depois`
- ✅ Atualizado UPDATE para usar nomes corretos

### 5. `app/api/horarios-disponiveis/route.ts`
- ✅ `buffer_antes` → `buffer_minutos_antes`
- ✅ `buffer_depois` → `buffer_minutos_depois`
- ✅ Atualizado SELECT para usar nomes corretos

### 6. `app/api/agendamentos/criar/route.ts`
- ✅ `enviado_confirmacao_email` → `enviado_confirmacao_whatsapp`

## 📊 Mapeamento Completo

| Campo Antigo | Campo Novo | Status |
|--------------|------------|--------|
| `companies.nome` | `companies.name` | ✅ Atualizado |
| `companies.plano` | `companies.plan` | ✅ Atualizado |
| `servicos.buffer_antes` | `servicos.buffer_minutos_antes` | ✅ Atualizado |
| `servicos.buffer_depois` | `servicos.buffer_minutos_depois` | ✅ Atualizado |
| `agendamentos.enviado_confirmacao_email` | `agendamentos.enviado_confirmacao_whatsapp` | ✅ Atualizado |

## 🆕 Campos Novos Adicionados

### Tabela `companies`:
- `subdomain` - Subdomínio completo (ex: leticianails.agemda.com.br)
- `owner_email` - Email do dono da empresa
- `owner_id` - ID do dono (pode ser NULL)
- `ativo` - Se a empresa está ativa

## ✅ Próximos Passos

1. **Testar a rota `/api/test`** - Deve funcionar agora
2. **Testar criação de empresa** - `/api/auth/signup`
3. **Testar criação de serviços** - `/api/servicos`
4. **Testar criação de profissionais** - `/api/profissionais`
5. **Testar busca de horários** - `/api/horarios-disponiveis`
6. **Testar criação de agendamentos** - `/api/agendamentos/criar`

## 🔍 Verificação

Execute:
```bash
npm run dev
```

E teste:
```
http://localhost:3000/api/test
```

Deve retornar dados da tabela `companies` se houver registros.

## 📝 Notas

- A função RPC `buscar_horarios_disponiveis` não recebe buffers como parâmetro, eles são calculados internamente
- O campo `enviado_confirmacao_whatsapp` substitui `enviado_confirmacao_email` (mudança de email para WhatsApp)
- Todos os campos novos foram adicionados automaticamente no signup

