# 🎨 Sistema Whitelabel Completo

## Visão Geral

Cada empresa (subdomínio) tem suas próprias páginas completamente customizadas com cores, logo e dados específicos.

## Estrutura de URLs

### Domínio Principal (SAAS)
- `https://agemda.vercel.app` → Landing page do SAAS
- `https://agemda.vercel.app/signup` → Página de login/cadastro
- `https://agemda.vercel.app/planos` → Página de planos

### Subdomínios Whitelabel (Cada Empresa)
- `https://leticianails.agemda.vercel.app/` → Página pública de agendamento (branding Leticia Nails)
- `https://leticianails.agemda.vercel.app/admin` → Painel administrativo (branding Leticia Nails)
- `https://barbearia-joao.agemda.vercel.app/` → Página pública (branding Barbearia João)
- `https://barbearia-joao.agemda.vercel.app/admin` → Painel admin (branding Barbearia João)

## Como Funciona

### 1. Middleware de Detecção

O middleware detecta o subdomínio e valida no banco:
- Extrai slug do subdomínio (ex: `leticianails`)
- Valida se existe na tabela `companies`
- Injeta headers com `tenant_id` e `tenant_slug`

### 2. API de Tenant

**GET `/api/tenant/[slug]`**

Retorna todos os dados do tenant:
- Empresa (nome, slug, vertical, plano)
- Customizações (cores, logo, descrição)
- Horários de funcionamento
- Profissionais ativos
- Serviços ativos

### 3. Contexto de Tenant

O `TenantContext` fornece globalmente:
- Dados da empresa
- Customizações (cores, logo)
- Horários, profissionais, serviços
- Funções helper (`getCorPrimaria()`, `isAberto()`, etc)

### 4. Componentes Whitelabel

Todos os componentes recebem customizações do contexto:

- **`HeaderPublica`** → Header com logo e cores da empresa
- **`BotaoPrimario`** → Botão que usa `cor_primaria`
- **`FooterPublica`** → Footer customizado
- **`AgendamentoFormMultiStep`** → Formulário com cores da empresa

### 5. Página Pública (`/(tenant)/page.tsx`)

Layout completo:
- Hero section com cor primária
- Formulário de agendamento multi-step
- Seção de profissionais
- Seção de serviços
- Footer customizado

### 6. Painel Admin (`/(tenant)/admin`)

Estrutura:
- Header com logo e nome da empresa
- Sidebar com menu customizado
- Dashboard com KPIs
- Páginas de gerenciamento

## Customizações Disponíveis

Cada empresa pode personalizar:

1. **Cores:**
   - `cor_primaria` → Cor principal
   - `cor_secundaria` → Cor de texto em botões

2. **Branding:**
   - `logo_url` → URL da logo
   - `descricao` → Descrição do negócio

3. **Funcionalidades:**
   - `botao_agendamento_ativo` → Ativar/desativar agendamento

## Tabela `landing_pages`

```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY,
  tenant_id UUID UNIQUE REFERENCES companies(id),
  cor_primaria VARCHAR(7) DEFAULT '#000000',
  cor_secundaria VARCHAR(7) DEFAULT '#FFFFFF',
  logo_url VARCHAR(500),
  descricao TEXT,
  botao_agendamento_ativo BOOLEAN DEFAULT true
);
```

## Fluxo de Dados

1. Usuário acessa `leticianails.agemda.vercel.app`
2. Middleware detecta subdomínio e valida
3. `TenantProvider` carrega dados via `/api/tenant/leticianails`
4. Componentes usam `useTenantContext()` para acessar customizações
5. Página renderiza com cores, logo e dados da empresa

## Exemplo de Uso

```tsx
// Em qualquer componente
import { useTenantContext } from '@/context/TenantContext';
import { BotaoPrimario } from '@/components/whitelabel/BotaoPrimario';

export function MeuComponente() {
  const { empresa, customizacoes, getCorPrimaria } = useTenantContext();
  
  return (
    <div>
      <h1 style={{ color: getCorPrimaria() }}>{empresa?.name}</h1>
      <BotaoPrimario onClick={() => {}}>
        Agendar
      </BotaoPrimario>
    </div>
  );
}
```

## Próximos Passos

1. ✅ Sistema de subdomínios
2. ✅ API de tenant
3. ✅ Contexto de customizações
4. ✅ Componentes whitelabel
5. ✅ Página pública customizada
6. ✅ Painel admin customizado
7. ⏳ Páginas restantes do admin
8. ⏳ API para atualizar customizações
9. ⏳ Upload de logo

