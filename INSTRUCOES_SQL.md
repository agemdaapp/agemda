# 📝 Instruções para Criar a Tabela companies

## ✅ Status Atual:
- ✅ Conexão com Supabase funcionando!
- ✅ Servidor rodando em http://localhost:3000
- ❌ Tabela `companies` ainda não existe (por isso dados vazios)

## 🗄️ Criar a Tabela:

### Passo 1: Acessar SQL Editor
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query** (ou use o editor que já está aberto)

### Passo 2: Copiar e Colar o SQL
Copie TODO o conteúdo do arquivo `sql/create_companies.sql` e cole no SQL Editor.

Ou copie este SQL diretamente:

```sql
-- Criar tabela companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  vertical TEXT NOT NULL CHECK (vertical IN ('barbearia', 'unhas', 'beleza')),
  plano TEXT NOT NULL CHECK (plano IN ('basico', 'intermediario', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Inserir dados de teste
INSERT INTO companies (slug, nome, vertical, plano)
VALUES 
  ('leticianails', 'Leticia Nails', 'unhas', 'premium'),
  ('barbearia-exemplo', 'Barbearia Exemplo', 'barbearia', 'basico')
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para teste)
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT
  USING (true);
```

### Passo 3: Executar o SQL
1. Clique no botão **Run** (ou pressione Ctrl+Enter)
2. Aguarde a mensagem de sucesso: "Success. No rows returned"

### Passo 4: Verificar no Table Editor
1. No menu lateral, clique em **Table Editor**
2. Procure pela tabela `companies`
3. Deve aparecer com 2 registros de teste

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
      "slug": "leticianails",
      "nome": "Leticia Nails",
      "vertical": "unhas",
      "plano": "premium"
    },
    {
      "id": "...",
      "slug": "barbearia-exemplo",
      "nome": "Barbearia Exemplo",
      "vertical": "barbearia",
      "plano": "basico"
    }
  ],
  "total": 2
}
```

## ✅ Pronto!

Depois de executar o SQL, a conexão estará 100% funcional e você poderá ver os dados retornando!

