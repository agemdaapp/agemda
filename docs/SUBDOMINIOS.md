# 🌐 Sistema de Subdomínios

## Visão Geral

O sistema implementa multi-tenancy através de subdomínios, onde cada empresa tem seu próprio subdomínio.

## Estrutura de URLs

### Domínio Principal (Landing Page)
- `https://agemda.vercel.app` → Landing page
- `https://agemda.vercel.app/signup` → Página de login/cadastro
- `https://agemda.vercel.app/planos` → Página de planos

### Subdomínios por Empresa
- `https://leticianails.agemda.vercel.app` → Dashboard da Leticia Nails
- `https://barbearia-joao.agemda.vercel.app` → Dashboard da Barbearia do João
- `https://beleza-total.agemda.vercel.app` → Dashboard do Salão Beleza Total

## Como Funciona

### 1. Middleware de Detecção

O middleware (`middleware.ts`) intercepta todas as requisições e:

1. **Detecta o hostname** da requisição
2. **Extrai o subdomínio** se existir
3. **Valida no banco** se o tenant (empresa) existe
4. **Injeta headers** com informações do tenant:
   - `x-tenant-id`: UUID da empresa
   - `x-tenant-slug`: Slug da empresa (ex: "leticianails")
   - `x-is-landing-page`: "true" ou "false"

### 2. Validação de Tenant

O middleware consulta a tabela `companies` no Supabase para:
- Verificar se o slug existe
- Verificar se a empresa está ativa (`ativo = true`)
- Retornar 404 se não encontrar

### 3. Página de Signup

A página `/signup` (`app/signup/page.tsx`) oferece:

**Lado Esquerdo:**
- Formulário de login (funcional)
- Formulário de cadastro (em desenvolvimento)

**Lado Direito:**
- Lista de empresas cadastradas
- Cards com informações de cada empresa
- Botão "Acessar" que redireciona para o subdomínio

### 4. Página de Login por Subdomínio

Quando o usuário acessa um subdomínio (ex: `leticianails.agemda.vercel.app/login`):
- O middleware já identificou o tenant
- A página de login mostra qual empresa está sendo acessada
- Após login, redireciona para `/dashboard` do subdomínio

## Fluxo Completo

### Cenário 1: Usuário Novo

1. Acessa `agemda.vercel.app/signup`
2. Vê lista de empresas à direita
3. Clica "Acessar" em uma empresa
4. Redireciona para `leticianails.agemda.vercel.app/login`
5. Faz login
6. Redireciona para `leticianails.agemda.vercel.app/dashboard`

### Cenário 2: Usuário Existente

1. Acessa diretamente `leticianails.agemda.vercel.app`
2. Middleware detecta subdomínio e valida
3. Se não autenticado → redireciona para `/login`
4. Se autenticado → mostra `/dashboard`

## Componentes Criados

### `useCompanies()` Hook
- Busca todas as empresas ativas
- Retorna `{ companies, loading, error }`
- Cache automático

### `ListaEmpresas` Component
- Renderiza cards das empresas
- Mostra informações: nome, vertical, plano, URL
- Botão "Acessar" para cada empresa

## API Endpoints

### `GET /api/companies`
Retorna todas as empresas ativas:

```json
{
  "sucesso": true,
  "empresas": [
    {
      "id": "uuid",
      "name": "Leticia Nails",
      "slug": "leticianails",
      "vertical": "unhas",
      "plan": "premium",
      "subdomain_url": "https://leticianails.agemda.vercel.app"
    }
  ],
  "total": 3
}
```

## Configuração no Vercel

Para que os subdomínios funcionem na Vercel, é necessário:

1. **Configurar Wildcard Domain** (opcional):
   - Adicionar `*.agemda.vercel.app` no painel da Vercel
   - Ou configurar DNS para apontar subdomínios

2. **Variáveis de Ambiente**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Desenvolvimento Local

Para testar subdomínios localmente, adicione ao arquivo `hosts`:

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 localhost
127.0.0.1 leticianails.localhost
127.0.0.1 barbearia-joao.localhost
127.0.0.1 beleza-total.localhost
```

**Mac/Linux** (`/etc/hosts`):
```
127.0.0.1 localhost
127.0.0.1 leticianails.localhost
127.0.0.1 barbearia-joao.localhost
127.0.0.1 beleza-total.localhost
```

Depois acesse:
- `http://localhost:3000` → Landing
- `http://leticianails.localhost:3000` → Dashboard da empresa

## Casos Especiais

### Subdomínios Reservados
Os seguintes subdomínios são bloqueados:
- `api.*` → Bloqueado
- `www.*` → Redireciona para domínio principal
- `admin.*` → Bloqueado
- `app.*` → Bloqueado

### Localhost Especial
- `localhost:3000` → Landing page
- `localhost:3000/app` → Simula tenant de teste (para desenvolvimento)

## Próximos Passos

1. ✅ Middleware de detecção de subdomínios
2. ✅ Validação no banco de dados
3. ✅ Página de signup com lista de empresas
4. ✅ Página de login por subdomínio
5. ⏳ Funcionalidade de criar conta (em desenvolvimento)
6. ⏳ Configuração de DNS para subdomínios reais

