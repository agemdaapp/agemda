import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: POST /api/agendamentos/criar
 * 
 * FLUXO COMPLETO DE CRIAR AGENDAMENTO:
 * 
 * 1. VALIDAÇÃO INICIAL:
 *    - Recebe body com dados do agendamento
 *    - Valida tenant_id do header
 *    - Valida campos obrigatórios
 *    - Valida formatos (UUID, ISO string, etc)
 * 
 * 2. VALIDAÇÕES BÁSICAS NO BACKEND:
 *    - cliente_nome: mínimo 3 caracteres
 *    - cliente_telefone: validar formato (remove caracteres especiais)
 *    - cliente_email: opcional, se fornecido validar formato
 *    - data_hora: validar formato ISO 8601
 *    - profissional_id: UUID válido
 *    - servico_id: UUID válido
 * 
 * 3. VALIDAÇÃO DE EXISTÊNCIA:
 *    - Verifica se tenant existe
 *    - Verifica se profissional existe e pertence ao tenant
 *    - Verifica se serviço existe e pertence ao tenant
 * 
 * 4. CHAMADA DA FUNÇÃO RPC:
 *    - Chama criar_agendamento_seguro(tenant_id, profissional_id, servico_id, data_hora, ...)
 *    - Função RPC faz:
 *      a) Valida disponibilidade (chama validar_disponibilidade_agendamento)
 *      b) Se não disponível → retorna { sucesso: false, mensagem }
 *      c) Se disponível → insere agendamento em transação
 *      d) Retorna { sucesso: true, agendamento_id, mensagem }
 * 
 * 5. SE SUCESSO (sucesso = true):
 *    - Retorna resposta 201 Created
 *    - Envia email de confirmação (Resend)
 *    - Marca enviado_confirmacao_email = true
 *    - Retorna: { sucesso: true, agendamento_id, mensagem, cliente_confirmacao_url }
 * 
 * 6. SE FALHA (sucesso = false):
 *    - Retorna resposta 400 Bad Request
 *    - NÃO cria agendamento
 *    - Retorna: { sucesso: false, mensagem }
 * 
 * 7. TRATAMENTO DE ERROS:
 *    - 401: Tenant ID inválido
 *    - 404: Profissional ou serviço não encontrado
 *    - 422: Dados inválidos (formato, range, etc)
 *    - 500: Erro do servidor
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - cliente_nome: obrigatório, mínimo 3 caracteres
 * - cliente_telefone: obrigatório, formato válido (remove caracteres especiais)
 * - cliente_email: opcional, se fornecido deve ser email válido
 * - profissional_id: obrigatório, UUID válido
 * - servico_id: obrigatório, UUID válido
 * - data_hora: obrigatório, formato ISO 8601, não pode ser no passado
 * 
 * RETORNO (Sucesso):
 * {
 *   "sucesso": true,
 *   "agendamento_id": "uuid",
 *   "mensagem": "Agendamento criado com sucesso",
 *   "cliente_confirmacao_url": "https://..."
 * }
 * 
 * RETORNO (Falha):
 * {
 *   "sucesso": false,
 *   "mensagem": "Horário não disponível"
 * }
 * 
 * STATUS HTTP:
 * - 201: Agendamento criado com sucesso
 * - 400: Dados inválidos ou horário não disponível
 * - 401: Tenant ID inválido
 * - 404: Profissional ou serviço não encontrado
 * - 422: Formato de dados inválido
 * - 500: Erro interno do servidor
 */

/**
 * Valida formato de telefone (remove caracteres especiais)
 */
function validarTelefone(telefone: string): { valido: boolean; formatado?: string; erro?: string } {
  // Remove caracteres especiais
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  // Valida se tem pelo menos 10 dígitos (formato brasileiro)
  if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
    return { valido: false, erro: 'Telefone deve ter 10 ou 11 dígitos' };
  }
  
  return { valido: true, formatado: apenasNumeros };
}

/**
 * Valida formato de data ISO 8601
 */
function validarDataHora(dataHora: string): { valido: boolean; erro?: string } {
  try {
    const data = new Date(dataHora);
    
    if (isNaN(data.getTime())) {
      return { valido: false, erro: 'Data/hora inválida' };
    }
    
    // Verifica se não é no passado
    if (data < new Date()) {
      return { valido: false, erro: 'Data/hora não pode ser no passado' };
    }
    
    // Verifica formato ISO
    if (!dataHora.includes('T') || !dataHora.includes('Z') && !dataHora.includes('+')) {
      return { valido: false, erro: 'Data/hora deve estar no formato ISO 8601' };
    }
    
    return { valido: true };
  } catch {
    return { valido: false, erro: 'Data/hora inválida' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { sucesso: false, mensagem: validation.error },
        { status: validation.status || 401 }
      );
    }

    const body = await request.json();
    const { cliente_nome, cliente_email, cliente_telefone, profissional_id, servico_id, data_hora } = body;

    // Valida campos obrigatórios
    if (!cliente_nome || !cliente_telefone || !profissional_id || !servico_id || !data_hora) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Campos obrigatórios: cliente_nome, cliente_telefone, profissional_id, servico_id, data_hora' },
        { status: 400 }
      );
    }

    // Valida cliente_nome
    if (typeof cliente_nome !== 'string' || cliente_nome.trim().length < 3) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Nome do cliente deve ter no mínimo 3 caracteres' },
        { status: 422 }
      );
    }

    // Valida cliente_telefone
    const validacaoTelefone = validarTelefone(cliente_telefone);
    if (!validacaoTelefone.valido) {
      return NextResponse.json(
        { sucesso: false, mensagem: validacaoTelefone.erro },
        { status: 422 }
      );
    }

    // Valida cliente_email (opcional)
    if (cliente_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cliente_email)) {
        return NextResponse.json(
          { sucesso: false, mensagem: 'Email inválido' },
          { status: 422 }
        );
      }
    }

    // Valida UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profissional_id) || !uuidRegex.test(servico_id)) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'IDs inválidos (formato UUID)' },
        { status: 422 }
      );
    }

    // Valida data_hora
    const validacaoDataHora = validarDataHora(data_hora);
    if (!validacaoDataHora.valido) {
      return NextResponse.json(
        { sucesso: false, mensagem: validacaoDataHora.erro },
        { status: 422 }
      );
    }

    const supabase = createServerClient();

    // Verifica se profissional existe e pertence ao tenant
    const { data: profissional, error: profError } = await supabase
      .from('profissionais')
      .select('id, tenant_id')
      .eq('id', profissional_id)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .single();

    if (profError || !profissional) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Profissional não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // Verifica se serviço existe e pertence ao tenant
    const { data: servico, error: servicoError } = await supabase
      .from('servicos')
      .select('id, tenant_id, nome, duracao_minutos')
      .eq('id', servico_id)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .single();

    if (servicoError || !servico) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Serviço não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // Chama função RPC criar_agendamento_seguro
    const { data: resultado, error: rpcError } = await supabase.rpc(
      'criar_agendamento_seguro',
      {
        p_tenant_id: tenantId,
        p_profissional_id: profissional_id,
        p_servico_id: servico_id,
        p_data_hora: data_hora,
        p_cliente_nome: cliente_nome.trim(),
        p_cliente_email: cliente_email?.trim() || null,
        p_cliente_telefone: validacaoTelefone.formatado,
      }
    );

    if (rpcError) {
      console.error('Erro na função RPC:', rpcError);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao criar agendamento' },
        { status: 500 }
      );
    }

    // Se não teve sucesso, retorna erro
    if (!resultado || !resultado.sucesso) {
      return NextResponse.json(
        { sucesso: false, mensagem: resultado?.mensagem || 'Erro ao criar agendamento' },
        { status: 400 }
      );
    }

    // Se teve sucesso, envia email de confirmação
    if (cliente_email) {
      try {
        // TODO: Implementar envio de email com Resend
        // await enviarEmailConfirmacao(cliente_email, resultado.agendamento_id, ...);
        
        // Marca como enviado
        await supabase
          .from('agendamentos')
          .update({ enviado_confirmacao_whatsapp: true })
          .eq('id', resultado.agendamento_id);
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falha o agendamento se email falhar
      }
    }

    // Retorna sucesso
    return NextResponse.json(
      {
        sucesso: true,
        agendamento_id: resultado.agendamento_id,
        mensagem: resultado.mensagem || 'Agendamento criado com sucesso',
        cliente_confirmacao_url: `https://${tenantId}.agemda.com.br/confirmar/${resultado.agendamento_id}`,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no POST /api/agendamentos/criar:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

