# 🚀 Deploy na Vercel - Guia Rápido

## ✅ O que foi ajustado para produção

1. **Middleware** - Removidas referências específicas a localhost
2. **Next.js Config** - Configurado para produção standalone
3. **Vercel.json** - Arquivo de configuração criado
4. **Variáveis de Ambiente** - Template atualizado

## 📋 Checklist de Deploy

### 1. Variáveis de Ambiente na Vercel

Configure estas variáveis no dashboard da Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

### 2. Deploy

**Opção A: Via GitHub (Recomendado)**
1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

**Opção B: Via CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Domínios

**Domínio Principal:**
- Adicione `agemda.com.br` nas configurações da Vercel
- Configure DNS conforme instruções

**Subdomínios Wildcard (Opcional):**
- Adicione `*.agemda.com.br` para suportar subdomínios dinâmicos
- Configure DNS: `CNAME * → cname.vercel-dns.com`

## 🔍 Estrutura de URLs

**Domínio Vercel (temporário):**
- **Landing**: `https://agemda.vercel.app`
- **Dashboard**: `https://agemda.vercel.app/dashboard` (requer login)
- **Agendamento**: `https://agemda.vercel.app/agendar` (usa tenant do contexto)

**Domínio próprio (futuro):**
- **Landing**: `https://agemda.com.br`
- **Dashboard**: `https://agemda.com.br/dashboard` (requer login)
- **Agendamento**: `https://leticianails.agemda.com.br/agendar` (subdomínio)

## ⚠️ Importante

- O sistema detecta automaticamente subdomínios
- Landing page é servida no domínio principal
- Cada tenant precisa ter seu subdomínio configurado
- O middleware valida se o tenant existe no banco

## 🐛 Troubleshooting

**Build falha?**
- Verifique variáveis de ambiente
- Veja logs em Deployments > Functions

**Subdomínios não funcionam?**
- Verifique DNS wildcard
- Confirme que o tenant existe no banco
- Veja logs do middleware

**Variáveis não carregam?**
- Certifique-se de que estão marcadas para "Production"
- Faça novo deploy após adicionar variáveis

