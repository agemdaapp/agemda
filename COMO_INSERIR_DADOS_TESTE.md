# 📝 Como Inserir Dados de Teste

## ✅ Status Atual:
- ✅ Conexão com Supabase funcionando!
- ✅ Tabela `companies` existe
- ❌ Tabela está vazia (por isso `dados: []`)

## 🗄️ Inserir Dados de Teste:

### Passo 1: Acessar SQL Editor
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query** (ou use o editor que já está aberto)

### Passo 2: Copiar e Colar o SQL
Copie TODO o conteúdo do arquivo `sql/insert_test_data.sql` e cole no SQL Editor.

Ou copie este SQL diretamente:

```sql
-- Inserir empresas de teste
INSERT INTO companies (name, slug, subdomain, plan, owner_email, vertical, ativo)
VALUES 
  (
    'Leticia Nails',
    'leticianails',
    'leticianails.agemda.com.br',
    'premium',
    'leticia@nails.com',
    'unhas',
    true
  ),
  (
    'Barbearia do João',
    'barbearia-joao',
    'barbearia-joao.agemda.com.br',
    'basico',
    'joao@barbearia.com',
    'barbearia',
    true
  ),
  (
    'Salão Beleza Total',
    'beleza-total',
    'beleza-total.agemda.com.br',
    'intermediario',
    'contato@belezatotal.com',
    'beleza',
    true
  )
ON CONFLICT (slug) DO NOTHING;
```

### Passo 3: Executar o SQL
1. Clique no botão **Run** (ou pressione Ctrl+Enter)
2. Aguarde a mensagem de sucesso: "Success. 3 rows inserted"

### Passo 4: Verificar no Table Editor
1. No menu lateral, clique em **Table Editor**
2. Procure pela tabela `companies`
3. Deve aparecer com 3 registros de teste

### Passo 5: Testar Novamente
1. Acesse: http://localhost:3000/api/test
2. Agora você deve ver:
```json
{
  "sucesso": true,
  "mensagem": "Conectado ao Supabase com sucesso!",
  "dados": [
    {
      "id": "...",
      "name": "Leticia Nails",
      "slug": "leticianails",
      "subdomain": "leticianails.agemda.com.br",
      "plan": "premium",
      "owner_email": "leticia@nails.com",
      "vertical": "unhas",
      "ativo": true,
      "created_at": "...",
      "updated_at": "..."
    },
    {
      "id": "...",
      "name": "Barbearia do João",
      "slug": "barbearia-joao",
      ...
    },
    {
      "id": "...",
      "name": "Salão Beleza Total",
      ...
    }
  ],
  "total": 3
}
```

## ✅ Pronto!

Depois de executar o SQL, a rota `/api/test` retornará os dados das empresas de teste!

## 🔍 Verificar Dados Manualmente

Você também pode verificar os dados diretamente no Supabase:
1. Vá em **Table Editor**
2. Selecione a tabela `companies`
3. Deve ver os 3 registros inseridos

