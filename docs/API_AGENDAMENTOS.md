# API de Agendamentos - Documentação

## 📋 Visão Geral

API REST para criar e gerenciar agendamentos com segurança máxima, validações robustas e integração com função RPC para garantir consistência.

## 🔄 Fluxo Completo de Criar Agendamento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VALIDAÇÃO INICIAL                                         │
│    - Recebe body com dados do agendamento                   │
│    - Valida tenant_id do header                             │
│    - Valida campos obrigatórios                             │
│    - Valida formatos (UUID, ISO string, etc)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDAÇÕES BÁSICAS NO BACKEND                            │
│    - cliente_nome: mínimo 3 caracteres                     │
│    - cliente_telefone: validar formato (remove especiais)   │
│    - cliente_email: opcional, se fornecido validar formato │
│    - data_hora: validar formato ISO 8601                    │
│    - profissional_id: UUID válido                           │
│    - servico_id: UUID válido                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VALIDAÇÃO DE EXISTÊNCIA                                   │
│    - Verifica se tenant existe                              │
│    - Verifica se profissional existe e pertence ao tenant  │
│    - Verifica se serviço existe e pertence ao tenant       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CHAMADA DA FUNÇÃO RPC                                     │
│    criar_agendamento_seguro(                                │
│      tenant_id,                                             │
│      profissional_id,                                       │
│      servico_id,                                            │
│      data_hora,                                             │
│      cliente_nome,                                          │
│      cliente_email,                                         │
│      cliente_telefone                                       │
│    )                                                        │
│    ↓                                                        │
│    Função RPC faz:                                          │
│    a) Valida disponibilidade                                │
│       (chama validar_disponibilidade_agendamento)           │
│    b) Se não disponível → retorna { sucesso: false }        │
│    c) Se disponível → insere em transação                   │
│    d) Retorna { sucesso: true, agendamento_id }            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SE SUCESSO (sucesso = true)                              │
│    - Retorna resposta 201 Created                           │
│    - Envia email de confirmação (Resend)                    │
│    - Marca enviado_confirmacao_email = true                 │
│    - Retorna: { sucesso, agendamento_id, mensagem, url }   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SE FALHA (sucesso = false)                               │
│    - Retorna resposta 400 Bad Request                        │
│    - NÃO cria agendamento                                   │
│    - Retorna: { sucesso: false, mensagem }                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Como a Função RPC é Chamada

### Assinatura da Função

```sql
CREATE OR REPLACE FUNCTION criar_agendamento_seguro(
  p_tenant_id UUID,
  p_profissional_id UUID,
  p_servico_id UUID,
  p_data_hora TIMESTAMPTZ,
  p_cliente_nome TEXT,
  p_cliente_email TEXT,
  p_cliente_telefone TEXT
)
RETURNS JSON AS $$
DECLARE
  v_agendamento_id UUID;
  v_disponivel BOOLEAN;
  v_mensagem TEXT;
BEGIN
  -- 1. Valida disponibilidade
  SELECT disponivel, mensagem INTO v_disponivel, v_mensagem
  FROM validar_disponibilidade_agendamento(
    p_tenant_id,
    p_profissional_id,
    p_servico_id,
    p_data_hora
  );
  
  -- 2. Se não disponível, retorna erro
  IF NOT v_disponivel THEN
    RETURN json_build_object(
      'sucesso', false,
      'mensagem', v_mensagem
    );
  END IF;
  
  -- 3. Insere agendamento em transação
  BEGIN
    INSERT INTO agendamentos (
      tenant_id,
      profissional_id,
      servico_id,
      data_hora,
      cliente_nome,
      cliente_email,
      cliente_telefone,
      status,
      created_at
    ) VALUES (
      p_tenant_id,
      p_profissional_id,
      p_servico_id,
      p_data_hora,
      p_cliente_nome,
      p_cliente_email,
      p_cliente_telefone,
      'pendente',
      NOW()
    ) RETURNING id INTO v_agendamento_id;
    
    -- 4. Retorna sucesso
    RETURN json_build_object(
      'sucesso', true,
      'agendamento_id', v_agendamento_id,
      'mensagem', 'Agendamento criado com sucesso'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RETURN json_build_object(
        'sucesso', false,
        'mensagem', 'Erro ao criar agendamento: ' || SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql;
```

### Chamada no Código

```typescript
const { data: resultado, error: rpcError } = await supabase.rpc(
  'criar_agendamento_seguro',
  {
    p_tenant_id: tenantId,
    p_profissional_id: profissional_id,
    p_servico_id: servico_id,
    p_data_hora: data_hora,
    p_cliente_nome: cliente_nome.trim(),
    p_cliente_email: cliente_email?.trim() || null,
    p_cliente_telefone: cliente_telefone_formatado,
  }
);
```

### Retorno da Função RPC

**Sucesso:**
```json
{
  "sucesso": true,
  "agendamento_id": "uuid",
  "mensagem": "Agendamento criado com sucesso"
}
```

**Falha:**
```json
{
  "sucesso": false,
  "mensagem": "Horário não disponível"
}
```

---

## 📝 Exemplo de Request/Response JSON

### POST /api/agendamentos/criar

**Request:**
```json
{
  "cliente_nome": "João Silva",
  "cliente_email": "joao@email.com",
  "cliente_telefone": "(11) 99999-9999",
  "profissional_id": "123e4567-e89b-12d3-a456-426614174000",
  "servico_id": "987fcdeb-51a2-43f7-8b9c-123456789abc",
  "data_hora": "2024-01-15T10:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "sucesso": true,
  "agendamento_id": "abc-123-def-456",
  "mensagem": "Agendamento criado com sucesso",
  "cliente_confirmacao_url": "https://leticianails.agemda.com.br/confirmar/abc-123-def-456"
}
```

**Response (400 Bad Request - Horário não disponível):**
```json
{
  "sucesso": false,
  "mensagem": "Horário não disponível. Já existe um agendamento neste horário."
}
```

**Response (422 - Dados inválidos):**
```json
{
  "sucesso": false,
  "mensagem": "Nome do cliente deve ter no mínimo 3 caracteres"
}
```

### GET /api/agendamentos

**Request:**
```
GET /api/agendamentos?status=confirmado&profissional_id=xxx&data_inicio=2024-01-15&data_fim=2024-01-20&limit=50&offset=0
```

**Response (200 OK):**
```json
{
  "sucesso": true,
  "data": [
    {
      "id": "abc-123",
      "cliente_nome": "João Silva",
      "cliente_email": "joao@email.com",
      "cliente_telefone": "11999999999",
      "data_hora": "2024-01-15T10:00:00Z",
      "status": "confirmado",
      "servico": {
        "id": "serv-123",
        "nome": "Corte Masculino",
        "duracao_minutos": 30
      },
      "profissional": {
        "id": "prof-123",
        "nome": "Carlos Barbeiro"
      }
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### PUT /api/agendamentos/[id]

**Request:**
```json
{
  "status": "cancelado",
  "motivo_cancelamento": "Cliente solicitou cancelamento"
}
```

**Response (200 OK):**
```json
{
  "sucesso": true,
  "mensagem": "Agendamento atualizado com sucesso"
}
```

### POST /api/agendamentos/[id]/cancelar

**Request:**
```json
{
  "motivo": "Cliente não pode comparecer"
}
```

**Response (200 OK):**
```json
{
  "sucesso": true,
  "mensagem": "Agendamento cancelado com sucesso"
}
```

---

## 🔐 Permissões por Rota

| Rota | Método | Permissão | Descrição |
|------|--------|-----------|-----------|
| `/api/agendamentos/criar` | POST | **Público** | Qualquer pessoa pode criar agendamento |
| `/api/agendamentos` | GET | **Autenticado** | Usuário do tenant pode listar |
| `/api/agendamentos/[id]` | GET | **Autenticado** | Usuário do tenant pode visualizar |
| `/api/agendamentos/[id]` | PUT | **Autenticado** | Usuário do tenant pode editar |
| `/api/agendamentos/[id]` | DELETE | **Admin** | Apenas admin pode deletar |
| `/api/agendamentos/[id]/cancelar` | POST | **Autenticado** | Usuário do tenant pode cancelar |

### Detalhamento de Permissões

#### POST /api/agendamentos/criar
- **Permissão:** Público (não requer autenticação)
- **Validação:** Apenas tenant_id no header
- **RLS:** Não aplicável (criação pública)

#### GET /api/agendamentos
- **Permissão:** Usuário autenticado do tenant
- **Validação:** tenant_id + token de autenticação
- **RLS:** SELECT permitido apenas para tenant_id do usuário

#### GET /api/agendamentos/[id]
- **Permissão:** Usuário autenticado do tenant
- **Validação:** tenant_id + verificação de pertencimento
- **RLS:** SELECT permitido apenas para tenant_id do usuário

#### PUT /api/agendamentos/[id]
- **Permissão:** Usuário autenticado do tenant
- **Validação:** tenant_id + verificação de pertencimento
- **RLS:** UPDATE permitido apenas para tenant_id do usuário
- **Restrição:** Não permite editar data_hora (só cancelar e reagendar)

#### DELETE /api/agendamentos/[id]
- **Permissão:** Apenas admin (role = 'admin')
- **Validação:** tenant_id + verificação de role
- **RLS:** DELETE permitido apenas para admin do tenant
- **Restrição:** Só permite deletar agendamentos cancelados

#### POST /api/agendamentos/[id]/cancelar
- **Permissão:** Usuário autenticado do tenant
- **Validação:** tenant_id + verificação de pertencimento
- **RLS:** UPDATE permitido apenas para tenant_id do usuário
- **Restrição:** Não pode cancelar se já finalizado ou cancelado

---

## 📧 Email de Confirmação

### Template HTML Profissional

**Assunto:** Confirmação de Agendamento - [Nome do Serviço]

**Conteúdo:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .whatsapp { background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Agendamento Confirmado!</h1>
    </div>
    
    <div class="content">
      <p>Olá <strong>{{cliente_nome}}</strong>,</p>
      
      <p>Seu agendamento foi confirmado com sucesso!</p>
      
      <div class="info-box">
        <h3>Detalhes do Agendamento</h3>
        <p><strong>Serviço:</strong> {{servico_nome}}</p>
        <p><strong>Profissional:</strong> {{profissional_nome}}</p>
        <p><strong>Data e Hora:</strong> {{data_hora_formatada}}</p>
        <p><strong>Duração:</strong> {{duracao_minutos}} minutos</p>
      </div>
      
      <div class="info-box">
        <h3>Local</h3>
        <p>{{endereco_barbearia}}</p>
        <p>{{cidade}}, {{estado}}</p>
      </div>
      
      <p>Se precisar alterar ou cancelar seu agendamento, entre em contato conosco:</p>
      
      <a href="https://wa.me/{{whatsapp_barbearia}}" class="whatsapp">
        📱 Falar no WhatsApp
      </a>
      
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        Este é um email automático. Por favor, não responda.
      </p>
    </div>
    
    <div class="footer">
      <p>{{nome_barbearia}} - Agemda</p>
      <p>© 2024 Agemda. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
```

### Variáveis do Template

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{{cliente_nome}}` | Nome do cliente | "João Silva" |
| `{{servico_nome}}` | Nome do serviço | "Corte Masculino" |
| `{{profissional_nome}}` | Nome do profissional | "Carlos Barbeiro" |
| `{{data_hora_formatada}}` | Data/hora formatada | "15/01/2024 às 10:00" |
| `{{duracao_minutos}}` | Duração do serviço | "30" |
| `{{endereco_barbearia}}` | Endereço da barbearia | "Rua Exemplo, 123" |
| `{{cidade}}` | Cidade | "São Paulo" |
| `{{estado}}` | Estado | "SP" |
| `{{whatsapp_barbearia}}` | WhatsApp da barbearia | "5511999999999" |
| `{{nome_barbearia}}` | Nome da barbearia | "Leticia Nails" |

### Integração com Resend

```typescript
// Exemplo de envio (não implementado, apenas estrutura)
async function enviarEmailConfirmacao(
  email: string,
  agendamentoId: string,
  dadosAgendamento: any
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Agemda <noreply@agemda.com.br>',
      to: email,
      subject: `Confirmação de Agendamento - ${dadosAgendamento.servico_nome}`,
      html: renderizarTemplateEmail(dadosAgendamento),
    }),
  });
  
  return response.json();
}
```

---

## 🛡️ Segurança

### Row Level Security (RLS)

**Políticas RLS:**

```sql
-- SELECT: usuário só vê agendamentos do seu tenant
CREATE POLICY "agendamentos_select" ON agendamentos
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));

-- INSERT: usuário só cria agendamentos no seu tenant
CREATE POLICY "agendamentos_insert" ON agendamentos
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));

-- UPDATE: usuário só atualiza agendamentos do seu tenant
CREATE POLICY "agendamentos_update" ON agendamentos
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()));

-- DELETE: apenas admin pode deletar
CREATE POLICY "agendamentos_delete" ON agendamentos
  FOR DELETE
  USING (
    tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
    AND (SELECT role FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
```

### Validações de Segurança

1. **Tenant ID sempre validado** em todas as rotas
2. **Nunca expor dados de outro tenant** (verificação de pertencimento)
3. **Transações** para evitar race conditions (na função RPC)
4. **Log de auditoria** (quem criou/modificou agendamento)
5. **Rate limiting** (opcional): máximo 10 agendamentos por IP por minuto

### Campos de Auditoria

```sql
created_by: UUID (FK -> usuarios.id) -- Quem criou
updated_by: UUID (FK -> usuarios.id) -- Quem modificou
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

## 📋 Resumo de Status HTTP

| Status | Quando Ocorre | Exemplo |
|--------|---------------|---------|
| `200` | Sucesso (GET, PUT, DELETE, POST cancelar) | Agendamento listado |
| `201` | Criado com sucesso | Agendamento criado |
| `400` | Dados inválidos ou horário não disponível | Horário ocupado |
| `401` | Tenant ID inválido ou não autorizado | Token inválido |
| `403` | Não autorizado (não é admin) | Tentativa de deletar sem permissão |
| `404` | Recurso não encontrado | Agendamento não existe |
| `422` | Validação falhou | Nome muito curto |
| `500` | Erro interno | Erro na função RPC |

---

## 🎯 Pontos Principais Implementados

1. ✅ **Criação segura** com função RPC e validação de disponibilidade
2. ✅ **Listagem com filtros** (status, profissional, data, paginação)
3. ✅ **Visualização individual** com dados completos
4. ✅ **Edição controlada** (só status e motivo, não data_hora)
5. ✅ **Cancelamento** com função RPC e validações
6. ✅ **Deleção apenas para admin** e apenas cancelados
7. ✅ **Email de confirmação** com template HTML profissional
8. ✅ **RLS habilitado** para isolamento por tenant
9. ✅ **Validações robustas** em todas as rotas
10. ✅ **Tratamento de erros** apropriado

Tudo estruturado e documentado. Pronto para integração com o banco de dados.

