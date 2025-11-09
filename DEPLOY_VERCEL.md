# Guia de Deploy na Vercel

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Projeto Supabase configurado
3. Variáveis de ambiente do Supabase

## Passo 1: Configurar Variáveis de Ambiente na Vercel

1. Acesse o dashboard da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

## Passo 2: Configurar Domínio (Opcional)

**Por enquanto, você pode usar o domínio padrão da Vercel:**
- `https://agemda.vercel.app` (já configurado automaticamente)

**Para usar domínio próprio no futuro:**
1. No projeto Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio principal (ex: `agemda.com.br`)
3. Configure os DNS conforme instruções da Vercel

## Passo 3: Configurar Subdomínios Wildcard (Opcional)

Para suportar subdomínios dinâmicos (ex: `leticianails.agemda.com.br`):

1. Na Vercel, vá em **Settings** > **Domains**
2. Adicione um domínio wildcard: `*.agemda.com.br`
3. Configure DNS:
   - Tipo: `CNAME`
   - Nome: `*`
   - Valor: `cname.vercel-dns.com`

## Passo 4: Deploy

### Opção 1: Via GitHub (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. A Vercel fará deploy automático a cada push

### Opção 2: Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Passo 5: Verificar Deploy

1. Acesse seu domínio principal
2. Teste a landing page
3. Teste um subdomínio (ex: `leticianails.agemda.com.br`)

## Estrutura de URLs

**Com domínio Vercel (atual):**
- **Landing Page**: `https://agemda.vercel.app`
- **Dashboard**: `https://agemda.vercel.app/dashboard` (requer autenticação)
- **Agendamento**: `https://agemda.vercel.app/agendar` (usa tenant do contexto/localStorage)

**Com domínio próprio (futuro):**
- **Landing Page**: `https://agemda.com.br`
- **Dashboard**: `https://agemda.com.br/dashboard` (requer autenticação)
- **Agendamento Público**: `https://leticianails.agemda.com.br/agendar` (subdomínio)

## Troubleshooting

### Subdomínios não funcionam

- Verifique se o DNS wildcard está configurado corretamente
- Verifique se o middleware está detectando o subdomínio
- Veja os logs da Vercel em **Deployments** > **Functions**

### Variáveis de ambiente não carregam

- Certifique-se de que as variáveis estão configuradas para **Production**
- Faça um novo deploy após adicionar variáveis
- Verifique se os nomes das variáveis estão corretos

### Erro de build

- Verifique os logs de build na Vercel
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se não há imports de arquivos que não existem

## Notas Importantes

- O middleware detecta automaticamente subdomínios
- Landing page é servida no domínio principal
- Cada tenant tem seu próprio subdomínio
- O sistema funciona sem configuração adicional de subdomínios (usa pathname)

