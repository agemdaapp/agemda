# Middleware de Multi-Tenancy - Documentação

## 📋 Visão Geral

O middleware Next.js detecta subdomínios e gerencia acesso multi-tenant, direcionando usuários para a landing page ou para o dashboard do tenant específico.

## 🔄 Fluxo de Detecção de Subdomínios

### 1. Extração do Host
```
Request → req.headers.get('host') → Análise do hostname
```

### 2. Análise do Hostname

#### Caso A: Domínio Principal (Landing Page)
- `agemda.com.br` → Landing page
- `www.agemda.com.br` → Landing page (www removido)
- **Resultado**: `isLandingPage = true`, `tenantSlug = null`

#### Caso B: Subdomínio de Tenant
- `leticianails.agemda.com.br` → Tenant "leticianails"
- **Processo**:
  1. Remove "www." se existir
  2. Extrai primeira parte antes do domínio principal
  3. Valida se tenant existe no banco
  4. Se válido: adiciona headers `x-tenant-id` e `x-tenant-slug`
  5. Se inválido: retorna 404

#### Caso C: Localhost (Desenvolvimento)
- `localhost:3000` → Landing page
- `localhost:3000/app/*` → Tenant "local-test"
- **Resultado**: `isDevelopment = true`

### 3. Headers Customizados Adicionados

O middleware adiciona os seguintes headers em todas as requisições:

| Header | Descrição | Exemplo |
|--------|-----------|---------|
| `x-tenant-id` | ID do tenant no banco | `"abc123"` ou `""` (landing) |
| `x-tenant-slug` | Slug do tenant (subdomínio) | `"leticianails"` ou `""` |
| `x-is-landing-page` | Se está na landing page | `"true"` ou `"false"` |

## 🛣️ Rotas Sempre Permitidas

O middleware **não intercepta** as seguintes rotas:

- `/api/*` - API Routes
- `/_next/*` - Assets do Next.js
- `/favicon.ico` - Favicon
- `/robots.txt` - Robots.txt
- `/sitemap*` - Sitemaps

## 📁 Arquivos Criados

### 1. `/middleware.ts` (Raiz do projeto)
**Responsabilidades:**
- Extrai subdomínio do host
- Valida tenant no banco de dados
- Adiciona headers customizados
- Redireciona ou retorna 404 quando necessário

**Funções principais:**
- `extractSubdomain(host)` - Extrai slug do subdomínio
- `isLandingPage(host, pathname)` - Detecta se é landing page
- `validateTenant(slug)` - Valida tenant no banco (TODO: implementar)

### 2. `/hooks/useTenant.ts`
**Responsabilidades:**
- Fornece acesso ao contexto do tenant em Client Components
- Lê headers do middleware (via localStorage fallback)
- Detecta mudanças de rota

**Hooks exportados:**
- `useTenant()` - Retorna `TenantContext` completo
- `useIsTenant(slug)` - Verifica se está em tenant específico
- `useIsLandingPage()` - Verifica se está na landing page

### 3. `/types/tenant.ts`
**Tipos TypeScript:**
- `TenantSlug` - Tipo para slug do tenant
- `TenantStatus` - Status do tenant ('active' | 'inactive' | 'suspended' | 'pending')
- `TenantContext` - Interface completa do contexto
- `TenantValidation` - Resposta da validação no banco

## 🎯 Casos de Uso Tratados

### ✅ Caso 1: Acesso à Landing Page
```
URL: https://agemda.com.br
Host: "agemda.com.br"
Resultado:
  - isLandingPage: true
  - tenantSlug: null
  - tenantId: null
  - Headers: x-is-landing-page: "true"
```

### ✅ Caso 2: Acesso com www
```
URL: https://www.agemda.com.br
Host: "www.agemda.com.br"
Processo: Remove "www." → "agemda.com.br"
Resultado: Mesmo que Caso 1 (landing page)
```

### ✅ Caso 3: Acesso a Tenant Válido
```
URL: https://leticianails.agemda.com.br
Host: "leticianails.agemda.com.br"
Processo:
  1. Extrai subdomain: "leticianails"
  2. Valida no banco: ✅ existe
  3. Adiciona headers
Resultado:
  - isLandingPage: false
  - tenantSlug: "leticianails"
  - tenantId: "abc123" (do banco)
  - Headers: x-tenant-slug: "leticianails", x-tenant-id: "abc123"
```

### ✅ Caso 4: Acesso a Tenant Inválido
```
URL: https://inexistente.agemda.com.br
Host: "inexistente.agemda.com.br"
Processo:
  1. Extrai subdomain: "inexistente"
  2. Valida no banco: ❌ não existe
Resultado: HTTP 404 - "Tenant not found"
```

### ✅ Caso 5: Localhost (Desenvolvimento)
```
URL: http://localhost:3000
Host: "localhost:3000"
Resultado:
  - isLandingPage: true
  - isDevelopment: true
  - tenantSlug: null
```

### ✅ Caso 6: Localhost com /app/* (Teste Local)
```
URL: http://localhost:3000/app/dashboard
Host: "localhost:3000"
Pathname: "/app/dashboard"
Resultado:
  - isLandingPage: false
  - isDevelopment: true
  - tenantSlug: "local-test"
  - tenantId: "local-test-id"
```

### ✅ Caso 7: Sem Subdomínio (Redirecionamento)
```
URL: https://subdominio-invalido.com
Host: "subdominio-invalido.com"
Processo: Não é domínio principal nem tem subdomínio válido
Resultado: Redireciona para landing page (agemda.com.br)
```

### ✅ Caso 8: API Routes (Bypass)
```
URL: https://leticianails.agemda.com.br/api/users
Pathname: "/api/users"
Resultado: Middleware não intercepta, passa direto
```

## 🔧 Implementação Pendente

### TODO: Validação no Banco de Dados

A função `validateTenant()` em `middleware.ts` precisa ser implementada:

```typescript
async function validateTenant(slug: TenantSlug) {
  // TODO: Consultar Supabase
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('id, status, slug')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  
  if (error || !data) {
    return { exists: false };
  }
  
  return {
    exists: true,
    tenantId: data.id,
  };
}
```

## 📊 Estrutura de Dados Esperada no Banco

Tabela `tenants` no Supabase:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do tenant |
| `slug` | TEXT | Slug do subdomínio (único) |
| `status` | TEXT | Status: 'active', 'inactive', 'suspended', 'pending' |
| `name` | TEXT | Nome do tenant |
| `created_at` | TIMESTAMP | Data de criação |

## 🚀 Como Usar

### Em Server Components
```typescript
import { headers } from 'next/headers';

const headersList = headers();
const tenantId = headersList.get('x-tenant-id');
const tenantSlug = headersList.get('x-tenant-slug');
const isLandingPage = headersList.get('x-is-landing-page') === 'true';
```

### Em Client Components
```typescript
'use client';
import { useTenant } from '@/hooks/useTenant';

export default function MyComponent() {
  const { tenantId, tenantSlug, isLandingPage } = useTenant();
  
  if (isLandingPage) {
    return <LandingPage />;
  }
  
  return <TenantDashboard tenantId={tenantId} />;
}
```

### Em API Routes
```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  const tenantSlug = request.headers.get('x-tenant-slug');
  
  // Usar tenantId para filtrar dados
  // ...
}
```

