# 🔑 Como Pegar a SERVICE_ROLE_KEY

## ✅ Você Já Tem:
- ✅ URL: `https://yrhjyeyyiatsxwfrvchz.supabase.co`
- ✅ ANON_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ❌ Falta Apenas:
- ❌ **SERVICE_ROLE_KEY**

## 📍 Onde Encontrar a SERVICE_ROLE_KEY:

### Passo a Passo:

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Settings** (⚙️) → **API**
4. **Na seção "Project API keys"**, procure por:
   - **"service_role"** (não é "anon", é outra chave!)
5. **Clique no ícone 👁️** para revelar
6. **Copie a chave COMPLETA**

### ⚠️ Importante:
- A **service_role** é uma chave **DIFERENTE** da anon
- Ela também é muito longa (centenas de caracteres)
- Ela começa com `eyJ...` (igual a anon, mas é outra chave)
- Ela tem **privilégios totais** - é SECRETA!

### 🎯 Visualização:

```
Project API keys:
├── anon public [👁️] ← Você já pegou esta ✅
└── service_role [👁️] ← PEGUE ESTA! ❌
```

## 📝 Depois de Pegar:

1. **Crie o arquivo `.env.local`** na raiz do projeto
2. **Cole este conteúdo** (substitua `COLE_AQUI_A_SERVICE_ROLE_KEY`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://yrhjyeyyiatsxwfrvchz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDMzMDEsImV4cCI6MjA3ODI3OTMwMX0.Pqz2A7rRVIrbKCxb5tUH6kxJuUgNrb3PHtV9XT63rKQ
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_a_service_role_key_completa
```

3. **Salve o arquivo**
4. **Teste:** `npm run dev` → `http://localhost:3000/api/test`

## 💡 Dica:

A service_role geralmente está **logo abaixo** da anon na mesma página. Procure por uma linha que diz "service_role" ou "service role".

