# ⚙️ Configurar Variáveis de Ambiente na Vercel

## 🚨 Erro Resolvido

O arquivo `vercel.json` foi corrigido. Agora você precisa configurar as variáveis de ambiente diretamente no dashboard da Vercel.

## 📋 Passo a Passo

### 1. Acesse o Dashboard da Vercel

1. Vá para https://vercel.com
2. Faça login na sua conta
3. Selecione o projeto **agemda**

### 2. Configure as Variáveis de Ambiente

1. No projeto, vá em **Settings** (Configurações)
2. No menu lateral, clique em **Environment Variables**
3. Adicione as seguintes variáveis:

#### Variável 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://yrhjyeyyiatsxwfrvchz.supabase.co` (ou sua URL do Supabase)
- **Environments**: Marque todas (Production, Preview, Development)

#### Variável 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDMzMDEsImV4cCI6MjA3ODI3OTMwMX0.Pqz2A7rRVIrbKCxb5tUH6kxJuUgNrb3PHtV9XT63rKQ` (ou sua anon key)
- **Environments**: Marque todas (Production, Preview, Development)

#### Variável 3:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `[COLE_AQUI_A_SERVICE_ROLE_KEY]` (obtenha no Supabase Dashboard)
- **Environments**: Marque todas (Production, Preview, Development)

### 3. Obter a Service Role Key

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **service_role** key (⚠️ NÃO a anon key!)
5. Cole no campo `SUPABASE_SERVICE_ROLE_KEY` na Vercel

### 4. Fazer Novo Deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo push para o GitHub (deploy automático)

## ✅ Verificação

Após o deploy, verifique:

1. O build deve passar sem erros
2. Acesse `https://agemda.vercel.app`
3. A landing page deve carregar normalmente

## 🔒 Segurança

- ⚠️ **NUNCA** commite as variáveis de ambiente no código
- ⚠️ A **Service Role Key** tem acesso total ao banco - mantenha segura
- ✅ Use apenas o dashboard da Vercel para configurar variáveis

