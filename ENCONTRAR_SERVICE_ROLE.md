# 🔍 Como Encontrar a SERVICE_ROLE_KEY - Guia Detalhado

## 📍 Método 1: Na Página de API (Mais Comum)

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Settings** (⚙️) → **API**
4. **Na seção "Project API keys"**, você verá:
   - **anon public** (você já tem esta)
   - **service_role** (esta que você precisa)

5. **Se não aparecer diretamente:**
   - Role a página para BAIXO
   - Procure por uma seção separada chamada "service_role"
   - Ou procure por "Secret keys" ou "Service keys"

## 📍 Método 2: Procurar em "API Settings"

1. Na mesma página de **Settings** → **API**
2. Procure por abas ou seções como:
   - **"API Keys"**
   - **"Project API keys"**
   - **"Service Role"**
   - **"Secret Keys"**

3. Clique em cada seção para expandir

## 📍 Método 3: URL Direta

Tente acessar diretamente:
```
https://supabase.com/dashboard/project/yrhjyeyyiatsxwfrvchz/settings/api
```

E procure por:
- Uma seção que diz "service_role"
- Um botão ou link que diz "Reveal" ou "Show" ao lado de "service_role"

## 📍 Método 4: Verificar Permissões

Se você não vê a service_role, pode ser que:
- Você não tenha permissão de administrador no projeto
- A chave esteja em outra seção

**Solução:** Verifique se você é o **owner** do projeto ou tem permissões de **admin**

## 📍 Método 5: Gerar Nova Chave (Se Necessário)

1. Vá em **Settings** → **API**
2. Procure por um botão **"Reset"** ou **"Regenerate"** ao lado de service_role
3. Ou procure por **"Create new key"**

## 🎯 O Que Você Deve Ver:

Quando encontrar, você verá algo assim:

```
┌─────────────────────────────────────────┐
│ Project API keys                        │
├─────────────────────────────────────────┤
│ anon public                             │
│ eyJhbGciOiJIUzI1NiIs... (já tem) ✅    │
├─────────────────────────────────────────┤
│ service_role                            │
│ [👁️ Reveal] ← CLIQUE AQUI!             │
│ eyJhbGciOiJIUzI1NiIs... (copie esta)   │
└─────────────────────────────────────────┘
```

## ⚠️ Dica Importante:

A **service_role** pode estar:
- **Abaixo** da anon key na mesma lista
- Em uma **seção separada** chamada "Service Role" ou "Secret Keys"
- Em uma **aba diferente** na mesma página
- **Ocultada** - precisa clicar em "Reveal" ou "Show"

## 🔄 Alternativa: Usar Apenas ANON_KEY para Teste

Se você não conseguir encontrar a service_role agora, podemos testar apenas com a anon key primeiro. A service_role é necessária para operações administrativas, mas para testes básicos podemos usar a anon key.

**Quer que eu ajuste o código para testar apenas com anon key primeiro?**

