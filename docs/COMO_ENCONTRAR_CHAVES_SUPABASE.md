# 🔑 Como Encontrar as Chaves do Supabase - Guia Visual

## 📍 Passo a Passo Detalhado

### Passo 1: Acessar o Dashboard
1. Vá para: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Você verá a lista de seus projetos

### Passo 2: Selecionar o Projeto
- Clique no projeto que tem a URL: `yrhjyeyyiatsxwfrvchz`
- Ou procure pelo nome do projeto

### Passo 3: Ir para Settings (Configurações)
- No **menu lateral esquerdo**, procure por **Settings** (⚙️)
- Clique em **Settings**

### Passo 4: Acessar a Seção API
- Dentro de Settings, você verá várias opções:
  - General
  - **API** ← CLIQUE AQUI
  - Database
  - Auth
  - Storage
  - etc.

### Passo 5: Encontrar as Chaves

Agora você verá uma página com várias seções. Procure por:

#### Seção: "Project URL"
- Aqui está a URL que você já tem: `https://yrhjyeyyiatsxwfrvchz.supabase.co`

#### Seção: "Project API keys" (IMPORTANTE!)
Esta seção tem várias chaves. Você precisa de 2:

**1. anon public key:**
- Procure por uma linha que diz:
  - **"anon"** ou **"public"**
  - Ou **"Project API keys"** > **"anon public"**
- Ao lado tem um ícone de **olho** 👁️ ou **cadeado** 🔒
- Clique no ícone para **revelar** a chave
- A chave é MUITO LONGA, começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Copie a chave COMPLETA** (use Ctrl+A para selecionar tudo)
- Esta é a `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**2. service_role key:**
- Procure por uma linha que diz:
  - **"service_role"**
  - Ou **"Project API keys"** > **"service_role"**
- ⚠️ **CUIDADO:** Esta chave é SECRETA e tem privilégios totais!
- Ao lado tem um ícone de **olho** 👁️ ou **cadeado** 🔒
- Clique no ícone para **revelar** a chave
- A chave também é MUITO LONGA, começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Copie a chave COMPLETA**
- Esta é a `SUPABASE_SERVICE_ROLE_KEY`

## 🎯 Onde Está Exatamente?

### Visualização da Tela:

```
┌─────────────────────────────────────────┐
│ SUPABASE DASHBOARD                      │
├──────────┬──────────────────────────────┤
│ Menu     │ Conteúdo                     │
│          │                              │
│ Home     │ Settings > API               │
│ Table    │ ──────────────────────────── │
│ Editor   │                              │
│ SQL      │ Project URL:                 │
│ Editor   │ https://yrhjyeyyiatsxwfr... │
│          │                              │
│ Settings │ Project API keys:            │
│   ├─ API │ ┌─────────────────────────┐ │
│   ├─ ... │ │ anon public             │ │
│          │ │ [👁️ Reveal]             │ │
│          │ │ eyJhbGciOiJIUzI1NiIs... │ │ ← COPIE ESTA
│          │ └─────────────────────────┘ │
│          │                              │
│          │ ┌─────────────────────────┐ │
│          │ │ service_role            │ │
│          │ │ [👁️ Reveal]             │ │
│          │ │ eyJhbGciOiJIUzI1NiIs... │ │ ← COPIE ESTA
│          │ └─────────────────────────┘ │
└──────────┴──────────────────────────────┘
```

## 📋 Checklist

- [ ] Acessei https://supabase.com/dashboard
- [ ] Fiz login
- [ ] Selecionei o projeto correto
- [ ] Cliquei em **Settings** (⚙️)
- [ ] Cliquei em **API**
- [ ] Encontrei a seção **"Project API keys"**
- [ ] Revelei e copiei a chave **anon public**
- [ ] Revelei e copiei a chave **service_role**

## ⚠️ Dicas Importantes

1. **As chaves são MUITO longas** - certifique-se de copiar tudo
2. **Não deixe espaços** antes ou depois das chaves
3. **Use Ctrl+A** para selecionar tudo antes de copiar
4. **A service_role é SECRETA** - nunca compartilhe ou commite no Git

## 🔍 Se Não Encontrar

### Alternativa 1: Menu Diferente
Alguns projetos podem ter o menu diferente. Procure por:
- **Project Settings**
- **Configuration**
- **API Keys**
- **Credentials**

### Alternativa 2: URL Direta
Tente acessar diretamente:
```
https://supabase.com/dashboard/project/yrhjyeyyiatsxwfrvchz/settings/api
```
(Substitua `yrhjyeyyiatsxwfrvchz` pelo ID do seu projeto se diferente)

### Alternativa 3: Verificar Permissões
- Certifique-se de que você tem acesso ao projeto
- Se for um projeto compartilhado, verifique suas permissões

## 📸 O Que Você Deve Ver

Quando encontrar as chaves, você verá algo assim:

**anon public:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIzNDU2NzgsImV4cCI6MjAyNzk0MTY3OH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567
```

**service_role:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGp5ZXl5aWF0c3h3ZnJ2Y2h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjM0NTY3OCwiZXhwIjoyMDI3OTQxNjc4fQ.xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234
```

Ambas começam com `eyJ` e são muito longas (centenas de caracteres).

## ✅ Próximo Passo

Depois de copiar as chaves:
1. Crie o arquivo `.env.local` na raiz do projeto
2. Cole as chaves no formato:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yrhjyeyyiatsxwfrvchz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_a_chave_anon_completa
SUPABASE_SERVICE_ROLE_KEY=cole_aqui_a_chave_service_role_completa
```

