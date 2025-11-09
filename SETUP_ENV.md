# ⚙️ Configuração do .env.local

## 📝 Criar o arquivo .env.local

Como o arquivo `.env.local` não pode ser criado automaticamente, você precisa criá-lo manualmente:

### Passo 1: Criar o arquivo
Na raiz do projeto, crie um arquivo chamado `.env.local`

### Passo 2: Copiar este conteúdo

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yrhjyeyyiatsxwfrvchz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=cole_sua_service_role_key_aqui
```

### Passo 3: Encontrar as chaves no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **anon public key** → cole no `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → cole no `SUPABASE_SERVICE_ROLE_KEY` (⚠️ é secreta!)

### Passo 4: Salvar o arquivo
Salve o arquivo `.env.local` na raiz do projeto (mesmo nível do `package.json`)

