# 🔧 Solução: Encontrar SERVICE_ROLE_KEY

## ✅ Solução Temporária: Testar Sem SERVICE_ROLE_KEY

Criei uma rota de teste alternativa que funciona **apenas com ANON_KEY**:

### Teste Agora (sem service_role):

1. **Rode o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse:**
   ```
   http://localhost:3000/api/test-simple
   ```

Esta rota usa apenas a ANON_KEY e deve funcionar para testar a conexão básica.

---

## 🔍 Onde Está a SERVICE_ROLE_KEY?

### Opção 1: Na Mesma Página de API

1. Vá em **Settings** → **API**
2. **Role a página para BAIXO** (muito importante!)
3. Procure por uma seção que diz:
   - **"service_role"**
   - **"Service Role Key"**
   - **"Secret Keys"**
   - **"Service Keys"**

### Opção 2: Verificar Seções Expandidas

Na página de API, pode haver:
- **Abas** no topo (clique em cada uma)
- **Seções colapsáveis** (clique para expandir)
- **Links** que dizem "Show service role" ou "Reveal"

### Opção 3: Verificar Permissões

A service_role pode estar oculta se você não for o **owner** do projeto.

**Solução:** Verifique se você criou o projeto ou se tem permissões de administrador.

### Opção 4: Gerar Nova Chave

1. Na página de API, procure por:
   - Botão **"Reset service_role key"**
   - Botão **"Regenerate"**
   - Link **"Create new service role key"**

2. Se encontrar, clique e gere uma nova chave

---

## 📸 O Que Você Deve Ver:

Quando encontrar, a tela deve mostrar algo assim:

```
Project API keys
├── anon public
│   └── eyJhbGciOiJIUzI1NiIs... (já tem) ✅
│
└── service_role  ← PROCURE ESTA!
    └── [👁️ Reveal] ← CLIQUE AQUI
        └── eyJhbGciOiJIUzI1NiIs... (copie esta)
```

---

## 💡 Dica Importante:

A **service_role** pode estar:
- **Muito abaixo** na página (role bastante!)
- Em uma **seção separada** chamada "Service Role" ou "Secret"
- **Ocultada** - precisa clicar em "Reveal" ou "Show"
- Em uma **aba diferente** na mesma página

---

## 🚀 Próximos Passos:

1. **Teste primeiro com:** `http://localhost:3000/api/test-simple`
2. **Depois procure a service_role** seguindo os métodos acima
3. **Quando encontrar**, cole no `.env.local` e teste com `/api/test`

---

## ❓ Ainda Não Encontrou?

Se mesmo assim não encontrar, pode ser que:
- O projeto seja novo e a chave ainda não esteja visível
- Você precise de permissões de administrador
- A interface do Supabase mudou

**Nesse caso, podemos continuar usando apenas a ANON_KEY para desenvolvimento inicial e adicionar a service_role depois.**

