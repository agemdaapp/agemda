# 🚀 Instruções Rápidas - Encontrar Chaves do Supabase

## 📍 Caminho Rápido:

1. **Acesse:** https://supabase.com/dashboard
2. **Clique no seu projeto** (ou acesse diretamente)
3. **Menu lateral esquerdo** → Clique em **Settings** (⚙️)
4. **Clique em "API"**
5. **Procure a seção "Project API keys"**

## 🔑 As 2 Chaves que Você Precisa:

### 1. anon public
- Procure por **"anon"** ou **"public"**
- Clique no ícone **👁️** para revelar
- Copie a chave COMPLETA (é muito longa!)
- → Esta vai no `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. service_role
- Procure por **"service_role"**
- Clique no ícone **👁️** para revelar
- ⚠️ Esta é SECRETA! Não compartilhe!
- Copie a chave COMPLETA
- → Esta vai no `SUPABASE_SERVICE_ROLE_KEY`

## 📝 Depois de Copiar:

1. Crie o arquivo `.env.local` na raiz do projeto
2. Cole este conteúdo (substitua as chaves):

```env
NEXT_PUBLIC_SUPABASE_URL=https://yrhjyeyyiatsxwfrvchz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_a_chave_anon
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_a_chave_service_role
```

3. Salve o arquivo
4. Reinicie o servidor (`npm run dev`)

## ❓ Ainda Não Encontrou?

- Verifique se você tem acesso ao projeto
- Tente acessar diretamente: `https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/settings/api`
- As chaves podem estar em uma seção chamada "Credentials" ou "API Keys"

