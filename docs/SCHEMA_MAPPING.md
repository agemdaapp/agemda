# 📊 Mapeamento do Schema Real vs Código

## ⚠️ Diferenças Importantes

O schema real criado no Supabase tem algumas diferenças em relação ao que foi planejado inicialmente. Este documento mapeia essas diferenças.

## 📋 Tabela: companies

### Schema Real:
```sql
companies (
  id UUID,
  name VARCHAR(255),           ← DIFERENTE: era "nome"
  slug VARCHAR(50),
  subdomain VARCHAR(50),        ← NOVO CAMPO
  plan VARCHAR(50),             ← DIFERENTE: era "plano"
  owner_email VARCHAR(255),     ← NOVO CAMPO
  owner_id UUID,                ← NOVO CAMPO
  vertical VARCHAR(50),
  ativo BOOLEAN,                ← NOVO CAMPO
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Campos que Mudaram:
| Código Original | Schema Real | Ação |
|----------------|-------------|------|
| `nome` | `name` | **ATUALIZAR** todas as referências |
| `plano` | `plan` | **ATUALIZAR** todas as referências |

### Campos Novos:
- `subdomain` - Subdomínio completo (ex: leticianails.agemda.com.br)
- `owner_email` - Email do dono da empresa
- `owner_id` - ID do dono (pode ser NULL)
- `ativo` - Se a empresa está ativa

## 📋 Tabela: servicos

### Schema Real:
```sql
servicos (
  id UUID,
  tenant_id UUID,
  nome VARCHAR(255),
  descricao TEXT,
  duracao_minutos INT,
  preco DECIMAL(10,2),
  buffer_minutos_antes INT,     ← DIFERENTE: era "buffer_antes"
  buffer_minutos_depois INT,    ← DIFERENTE: era "buffer_depois"
  ativo BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Campos que Mudaram:
| Código Original | Schema Real | Ação |
|----------------|-------------|------|
| `buffer_antes` | `buffer_minutos_antes` | **ATUALIZAR** |
| `buffer_depois` | `buffer_minutos_depois` | **ATUALIZAR** |

## 📋 Tabela: profissionais

### Schema Real:
```sql
profissionais (
  id UUID,
  tenant_id UUID,
  nome VARCHAR(255),
  foto_url VARCHAR(500),
  ativo BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

✅ **Compatível** - Nenhuma mudança necessária.

## 📋 Tabela: agendamentos

### Schema Real:
```sql
agendamentos (
  id UUID,
  tenant_id UUID,
  cliente_nome VARCHAR(255),
  cliente_email VARCHAR(255),
  cliente_telefone VARCHAR(20),
  profissional_id UUID,
  servico_id UUID,
  data_hora TIMESTAMP,
  duracao_minutos INT,
  status VARCHAR(50),
  confirmado_em TIMESTAMP,
  cancelado_em TIMESTAMP,
  motivo_cancelamento VARCHAR(255),
  enviado_confirmacao_whatsapp BOOLEAN,  ← DIFERENTE: era "enviado_confirmacao_email"
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Campos que Mudaram:
| Código Original | Schema Real | Ação |
|----------------|-------------|------|
| `enviado_confirmacao_email` | `enviado_confirmacao_whatsapp` | **ATUALIZAR** |

## 📋 Tabela: horario_funcionamento

### Schema Real:
```sql
horario_funcionamento (
  id UUID,
  tenant_id UUID,
  dia_semana INT,               ← 0 (domingo) a 6 (sábado)
  hora_abertura TIME,
  hora_fechamento TIME,
  ativo BOOLEAN,
  created_at TIMESTAMP
)
```

✅ **Compatível** - Nenhuma mudança necessária.

## 📋 Tabela: bloqueios_horario

### Schema Real:
```sql
bloqueios_horario (
  id UUID,
  tenant_id UUID,
  profissional_id UUID,        ← Pode ser NULL (todos profissionais)
  data_hora_inicio TIMESTAMP,  ← DIFERENTE: era separado data/hora
  data_hora_fim TIMESTAMP,     ← DIFERENTE: era separado data/hora
  motivo VARCHAR(255),
  created_at TIMESTAMP
)
```

### Campos que Mudaram:
| Código Original | Schema Real | Ação |
|----------------|-------------|------|
| `data_inicio` + `hora_inicio` | `data_hora_inicio` | **ATUALIZAR** |
| `data_fim` + `hora_fim` | `data_hora_fim` | **ATUALIZAR** |

## 📋 Tabela: landing_pages

### Schema Real:
```sql
landing_pages (
  id UUID,
  tenant_id UUID UNIQUE,
  cor_primaria VARCHAR(7),
  cor_secundaria VARCHAR(7),
  logo_url VARCHAR(500),
  descricao TEXT,
  botao_agendamento_ativo BOOLEAN,  ← DIFERENTE: era "mostrar_agendamento_rapido"
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Campos que Mudaram:
| Código Original | Schema Real | Ação |
|----------------|-------------|------|
| `mostrar_agendamento_rapido` | `botao_agendamento_ativo` | **ATUALIZAR** |

## 🔧 Arquivos que Precisam ser Atualizados

### 1. API Routes que usam `companies`:
- `app/api/auth/signup/route.ts` - Usa `nome` e `plano` → mudar para `name` e `plan`
- `app/api/profissionais/route.ts` - Usa `plano` → mudar para `plan`
- `lib/middleware-tenant.ts` - Pode precisar ajustes

### 2. API Routes que usam `servicos`:
- `app/api/servicos/route.ts` - Usa `buffer_antes` e `buffer_depois` → mudar para `buffer_minutos_antes` e `buffer_minutos_depois`
- `app/api/horarios-disponiveis/route.ts` - Usa buffers → atualizar

### 3. API Routes que usam `agendamentos`:
- `app/api/agendamentos/criar/route.ts` - Usa `enviado_confirmacao_email` → mudar para `enviado_confirmacao_whatsapp`

### 4. Validações:
- `lib/validations.ts` - Verificar se precisa ajustar tipos

## ✅ Próximos Passos

1. **Atualizar todas as referências** de `nome` → `name` e `plano` → `plan`
2. **Atualizar buffers** de `buffer_antes` → `buffer_minutos_antes`
3. **Atualizar campo de confirmação** de `enviado_confirmacao_email` → `enviado_confirmacao_whatsapp`
4. **Testar todas as rotas** após as atualizações

