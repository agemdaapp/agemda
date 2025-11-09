# Sistema de Autenticação Multi-Tenant - Documentação

## 📋 Visão Geral

Sistema de autenticação integrado com Supabase Auth que suporta multi-tenancy, onde cada empresa (tenant) tem seu próprio subdomínio e dados isolados.

## 🔄 Fluxo Completo: Signup → Login → Dashboard

### 1. SIGNUP (Cadastro)

```
Usuário preenche formulário
  ↓
POST /api/auth/signup
  ├─ Valida email (formato + único)
  ├─ Valida senha (força)
  ├─ Gera slug a partir de nome_barbearia
  ├─ Valida slug único
  ├─ Cria usuário no Supabase Auth
  ├─ Cria registro em companies (tenant)
  ├─ Cria registro em usuarios (vincula user + tenant)
  ├─ Cria registro vazio em landing_pages
  ↓
Retorna: { user_id, tenant_id, tenant_slug, token }
  ↓
Frontend:
  ├─ Armazena token no Supabase Auth
  ├─ Salva tenant_id no localStorage
  ├─ Redireciona para /dashboard
```

**Arquivo:** `app/api/auth/signup/route.ts`

**Validações:**
- ✅ Email: formato válido (regex) + único no Supabase Auth
- ✅ Senha: mínimo 8 caracteres, letra + número
- ✅ Slug: gerado automaticamente, validado como único
- ✅ Vertical: 'barbearia' | 'unhas' | 'beleza'
- ✅ Plano: 'basico' | 'premium' | 'enterprise'

**Tabelas criadas:**
1. `auth.users` (Supabase Auth) - Usuário autenticado
2. `companies` - Empresa/tenant com slug
3. `usuarios` - Vínculo user_id + tenant_id + role
4. `landing_pages` - Página inicial do tenant (vazia)

---

### 2. LOGIN (Autenticação)

```
Usuário preenche email + senha
  ↓
POST /api/auth/login
  ├─ Valida email (formato)
  ├─ Autentica com Supabase Auth
  ├─ Busca tenant_id na tabela usuarios
  ├─ Busca tenant_slug na tabela companies
  ↓
Retorna: { user_id, tenant_id, tenant_slug, token }
  ↓
Frontend:
  ├─ Armazena token no Supabase Auth
  ├─ Salva tenant_id no localStorage
  ├─ Redireciona para /dashboard
```

**Arquivo:** `app/api/auth/login/route.ts`

**Validações:**
- ✅ Email: formato válido
- ✅ Password: não vazio
- ✅ Usuário existe no Supabase Auth
- ✅ Usuário tem registro em `usuarios`
- ✅ Tenant está ativo

---

### 3. DASHBOARD (Acesso Protegido)

```
Usuário acessa /dashboard
  ↓
ProtectedRoute verifica:
  ├─ isAuthenticated === true?
  ├─ tenantId existe?
  ↓
Se não autenticado:
  └─ Redireciona para /login
  ↓
Se autenticado:
  ├─ Renderiza dashboard
  ├─ Passa tenant_id como prop
  └─ Componente usa tenant_id para filtrar dados
```

**Arquivo:** `components/ProtectedRoute.tsx`

**Validações:**
- ✅ Usuário autenticado (token válido)
- ✅ tenantId existe no contexto
- ✅ Sessão ativa no Supabase

---

## 📁 Arquivos Criados

### 1. **Rotas de API**

#### `/app/api/auth/signup/route.ts`
- Recebe dados de cadastro
- Valida e cria usuário + tenant
- Retorna token e dados do tenant

#### `/app/api/auth/login/route.ts`
- Autentica usuário
- Busca tenant_id do usuário
- Retorna token e dados do tenant

#### `/app/api/auth/logout/route.ts`
- Invalida sessão
- Limpa dados locais

### 2. **Hooks**

#### `/hooks/useAuth.ts`
- Gerencia estado de autenticação
- Sincroniza com Supabase Auth
- Persiste tenant_id no localStorage
- Fornece funções: login, signup, logout

### 3. **Context**

#### `/context/AuthContext.tsx`
- Provider global de autenticação
- Valida token ao montar
- Disponibiliza auth em toda a app

### 4. **Componentes**

#### `/components/ProtectedRoute.tsx`
- Protege rotas privadas
- Verifica autenticação
- Redireciona se não autenticado
- Passa tenant_id para children

### 5. **Utilitários**

#### `/lib/validations.ts`
- `isValidEmail()` - Valida formato de email
- `isStrongPassword()` - Valida força da senha
- `generateSlug()` - Gera slug a partir de nome
- `isValidSlug()` - Valida formato de slug
- `isValidVertical()` - Valida vertical
- `isValidPlano()` - Valida plano

---

## ✅ Validações Implementadas

### Email
- **Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Único:** Verifica no Supabase Auth antes de criar

### Senha
- **Mínimo:** 8 caracteres
- **Letra:** Pelo menos uma letra (a-z, A-Z)
- **Número:** Pelo menos um número (0-9)

### Slug
- **Geração:** A partir de nome_barbearia
- **Formato:** Apenas letras minúsculas, números e hífens
- **Tamanho:** 3-50 caracteres
- **Único:** Verifica no banco antes de criar

### Vertical
- **Valores:** 'barbearia' | 'unhas' | 'beleza'
- **Tipo:** TypeScript com type guard

### Plano
- **Valores:** 'basico' | 'premium' | 'enterprise'
- **Tipo:** TypeScript com type guard

---

## 🔐 Propagação do tenant_id

### 1. **No Signup/Login**
```
API retorna tenant_id
  ↓
Frontend salva no localStorage
  ↓
useAuth atualiza estado
  ↓
AuthContext disponibiliza globalmente
```

### 2. **Em Requisições API**
```
Frontend envia tenant_id no header:
  Authorization: Bearer {token}
  x-tenant-id: {tenant_id}
  ↓
Middleware valida token
  ↓
API usa tenant_id para filtrar dados
```

### 3. **Em Componentes**
```
useAuthContext() retorna tenantId
  ↓
Componente usa tenantId para:
  - Filtrar queries do Supabase
  - Passar como prop
  - Validar acesso
```

### 4. **No Middleware de Subdomínios**
```
Middleware detecta subdomínio
  ↓
Valida tenant existe no banco
  ↓
Adiciona x-tenant-id no header
  ↓
API Routes podem ler do header
```

---

## 🗄️ Estrutura de Banco de Dados Esperada

### Tabela: `companies`
```sql
id: UUID (PK)
slug: TEXT (UNIQUE) -- Ex: "leticianails"
nome: TEXT
vertical: TEXT -- 'barbearia' | 'unhas' | 'beleza'
plano: TEXT -- 'basico' | 'premium' | 'enterprise'
created_at: TIMESTAMP
```

### Tabela: `usuarios`
```sql
id: UUID (PK, FK -> auth.users)
tenant_id: UUID (FK -> companies.id)
role: TEXT -- 'admin' | 'user'
email: TEXT
created_at: TIMESTAMP
```

### Tabela: `landing_pages`
```sql
id: UUID (PK)
tenant_id: UUID (FK -> companies.id)
-- outros campos da landing page
created_at: TIMESTAMP
```

---

## 🚀 Como Usar

### 1. Envolver App com AuthProvider
```tsx
// app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Usar em Componentes
```tsx
'use client';
import { useAuthContext } from '@/context/AuthContext';

export default function Dashboard() {
  const { user, tenantId, isAuthenticated, logout } = useAuthContext();
  
  if (!isAuthenticated) return null;
  
  return (
    <div>
      <h1>Dashboard - Tenant: {tenantId}</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### 3. Proteger Rotas
```tsx
// app/dashboard/page.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### 4. Fazer Login
```tsx
const { login } = useAuthContext();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    router.push('/dashboard');
  } else {
    alert(result.error);
  }
};
```

---

## 🔄 Fluxo de Dados

```
┌─────────────┐
│   Signup    │
│  Formulário │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ POST /api/auth/  │
│     signup       │
└──────┬───────────┘
       │
       ├─► Valida dados
       ├─► Cria user (Auth)
       ├─► Cria company
       ├─► Cria usuario
       └─► Cria landing_page
       │
       ▼
┌──────────────────┐
│  Retorna token + │
│   tenant_id      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  useAuth salva   │
│  no localStorage │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  AuthContext     │
│  disponibiliza   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  ProtectedRoute  │
│  valida acesso   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│    Dashboard     │
│  usa tenant_id   │
└──────────────────┘
```

---

## ⚠️ Próximos Passos

1. **Implementar validação de tenant no middleware** - Verificar se tenant existe antes de permitir acesso
2. **Criar tabelas no Supabase** - Executar migrations
3. **Adicionar RLS (Row Level Security)** - Isolar dados por tenant
4. **Implementar refresh token** - Renovar sessão automaticamente
5. **Adicionar recuperação de senha** - Fluxo de reset password

