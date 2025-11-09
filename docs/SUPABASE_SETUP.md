# Configuração do Supabase - Guia Completo

## 🔑 Onde Encontrar as Chaves do Supabase

### Passo a Passo:

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione seu Projeto:**
   - Clique no projeto: `yrhjyeyyiatsxwfrvchz` (ou o nome do projeto)

3. **Acesse as Configurações de API:**
   - No menu lateral esquerdo, clique em **Settings** (⚙️)
   - Depois clique em **API**

4. **Encontre as Chaves:**
   
   **a) Project URL:**
   - Já temos: `https://yrhjyeyyiatsxwfrvchz.supabase.co`
   - Está na seção "Project URL"
   
   **b) anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY):**
   - Está na seção "Project API keys"
   - Procure por "anon" ou "public"
   - Clique no ícone de "olho" 👁️ para revelar
   - Copie a chave completa (é longa, começa com `eyJ...`)
   
   **c) service_role key (SUPABASE_SERVICE_ROLE_KEY):**
   - Está na mesma seção "Project API keys"
   - Procure por "service_role"
   - ⚠️ **CUIDADO:** Esta chave é SECRETA e tem privilégios administrativos!
   - Clique no ícone de "olho" 👁️ para revelar
   - Copie a chave completa

5. **Cole no arquivo .env.local:**
   - Abra o arquivo `.env.local` na raiz do projeto
   - Substitua `SUA_ANON_KEY_AQUI` pela chave anon
   - Substitua `SUA_SERVICE_ROLE_KEY_AQUI` pela chave service_role
   - Salve o arquivo

## 📝 Exemplo de .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://yrhjyeyyiatsxwfrvchz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIzNDU2NzgsImV4cCI6MjAyNzk0MTY3OH0.abc123...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjM0NTY3OCwiZXhwIjoyMDI3OTQxNjc4fQ.xyz789...
```

## 🗄️ Criar Tabela de Teste no Supabase

### SQL para criar a tabela `companies`:

1. **Acesse o SQL Editor:**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

2. **Cole este SQL:**

```sql
-- Criar tabela companies (se não existir)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  vertical TEXT NOT NULL CHECK (vertical IN ('barbearia', 'unhas', 'beleza')),
  plano TEXT NOT NULL CHECK (plano IN ('basico', 'intermediario', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para slug
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Inserir dados de teste (opcional)
INSERT INTO companies (slug, nome, vertical, plano)
VALUES 
  ('leticianails', 'Leticia Nails', 'unhas', 'premium'),
  ('barbearia-exemplo', 'Barbearia Exemplo', 'barbearia', 'basico')
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para teste)
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT
  USING (true);
```

3. **Execute o SQL:**
   - Clique em **Run** (ou pressione Ctrl+Enter)
   - Verifique se apareceu "Success. No rows returned"

4. **Verificar no Table Editor:**
   - No menu lateral, clique em **Table Editor**
   - Procure pela tabela `companies`
   - Deve aparecer com os dados de teste

## 🚀 Testar a Conexão

### 1. Configure o .env.local:
```bash
# Edite o arquivo .env.local e cole suas chaves
```

### 2. Instale as dependências (se ainda não fez):
```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### 4. Acesse a rota de teste:
Abra no navegador:
```
http://localhost:3000/api/test
```

### 5. Verifique a resposta:

**Se sucesso, você verá:**
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
    }
  ],
  "total": 2
}
```

**Se erro, você verá:**
```json
{
  "sucesso": false,
  "erro": "mensagem de erro",
  "detalhes": "..."
}
```

## 🔍 Troubleshooting

### Erro: "Missing Supabase environment variables"
- **Solução:** Verifique se o arquivo `.env.local` está na raiz do projeto
- **Solução:** Reinicie o servidor (`npm run dev`) após editar `.env.local`
- **Solução:** Verifique se as chaves estão corretas (sem espaços extras)

### Erro: "relation 'companies' does not exist"
- **Solução:** Execute o SQL acima no SQL Editor do Supabase
- **Solução:** Verifique se a tabela aparece no Table Editor

### Erro: "Invalid API key"
- **Solução:** Verifique se copiou a chave completa (são muito longas)
- **Solução:** Verifique se não há espaços ou quebras de linha nas chaves
- **Solução:** Gere novas chaves no Supabase se necessário

### Erro: "JWT expired" ou "Invalid token"
- **Solução:** As chaves podem ter expirado, gere novas no Supabase
- **Solução:** Verifique se está usando a chave correta (anon vs service_role)

## ✅ Checklist de Configuração

- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] Tabela `companies` criada no Supabase
- [ ] Dados de teste inseridos
- [ ] Servidor rodando (`npm run dev`)
- [ ] Rota `/api/test` retorna sucesso

## 📚 Próximos Passos

Após confirmar que a conexão está funcionando:

1. Criar as outras tabelas necessárias:
   - `usuarios`
   - `servicos`
   - `profissionais`
   - `agendamentos`
   - etc.

2. Configurar RLS (Row Level Security) adequadamente

3. Testar as outras rotas de API

4. Implementar autenticação

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env.local` no Git
- O arquivo já está no `.gitignore`
- A `SERVICE_ROLE_KEY` é secreta e tem privilégios administrativos
- Use apenas em API routes do servidor
- Nunca exponha no frontend

