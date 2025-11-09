# 🎯 Pegar a SERVICE_ROLE_KEY Agora

## 📍 Na Tela que Você Está Vendo:

Na seção **"API Key"** (anon public), há um texto que diz:

> "You may also use the service key which can be found **here**"

### ⬇️ AÇÃO:

1. **Clique na palavra "here"** (é um link clicável, geralmente em verde ou azul)
2. Isso vai te levar para a **service_role key**
3. **Copie a chave completa** (é muito longa, começa com `eyJ...`)

## 📝 Depois de Pegar:

1. **Crie o arquivo `.env.local`** na raiz do projeto
2. **Cole este conteúdo** (substitua a última linha pela service_role que você copiou):

```env
NEXT_PUBLIC_SUPABASE_URL=https://yrhjyeyyiatsxwfrvchz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDMzMDEsImV4cCI6MjA3ODI3OTMwMX0.Pqz2A7rRVIrbKCxb5tUH6kxJuUgNrb3PHtV9XT63rKQ
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_a_service_role_key_completa
```

3. **Salve o arquivo**
4. **Teste:** `npm run dev` → `http://localhost:3000/api/test`

## 🔍 Se Não Encontrar o Link "here":

Alternativa: Na mesma página, role para baixo ou procure por:
- Uma seção chamada **"service_role"**
- Ou vá em **Settings** → **API** e procure por **"service_role"** na lista de chaves

