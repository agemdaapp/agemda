import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: GET /api/agendamentos/[id]
 * 
 * FLUXO:
 * 1. Recebe id do agendamento na URL
 * 2. Valida tenant_id do header
 * 3. Valida id do agendamento (UUID)
 * 4. Busca agendamento com JOIN completo
 * 5. Verifica se pertence ao tenant
 * 6. Retorna dados completos
 * 
 * RETORNO:
 * {
 *   "sucesso": true,
 *   "data": {
 *     "id": "uuid",
 *     "cliente_nome": "João Silva",
 *     "cliente_email": "joao@email.com",
 *     "cliente_telefone": "11999999999",
 *     "data_hora": "2024-01-15T10:00:00Z",
 *     "status": "confirmado",
 *     "motivo_cancelamento": null,
 *     "cancelado_em": null,
 *     "servico": { ... },
 *     "profissional": { ... },
 *     "created_at": "...",
 *     "updated_at": "..."
 *   }
 * }
 * 
 * PERMISSÕES:
 * - Qualquer usuário autenticado do tenant pode visualizar
 * - RLS garante que só vê agendamentos do próprio tenant
 * 
 * STATUS HTTP:
 * - 200: Sucesso
 * - 401: Tenant ID inválido ou agendamento não pertence ao tenant
 * - 404: Agendamento não encontrado
 * - 500: Erro interno do servidor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const agendamentoId = params.id;

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { sucesso: false, mensagem: validation.error },
        { status: validation.status || 401 }
      );
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(agendamentoId)) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'ID do agendamento inválido' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Busca agendamento
    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        servico:servicos(*),
        profissional:profissionais(*)
      `)
      .eq('id', agendamentoId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !agendamento) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      data: agendamento,
    });

  } catch (error) {
    console.error('Erro no GET /api/agendamentos/[id]:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * ROTA: PUT /api/agendamentos/[id]
 * 
 * FLUXO:
 * 1. Recebe id do agendamento na URL
 * 2. Recebe body com campos editáveis: { status?, motivo_cancelamento? }
 * 3. Valida tenant_id do header
 * 4. Valida id do agendamento (UUID)
 * 5. Verifica se agendamento existe e pertence ao tenant
 * 6. Valida campos editáveis:
 *    - status: deve ser um dos valores permitidos
 *    - motivo_cancelamento: obrigatório se status = cancelado
 * 7. NÃO permite editar data_hora (só cancelar e reagendar)
 * 8. Atualiza apenas campos fornecidos
 * 9. Retorna sucesso
 * 
 * CAMPOS EDITÁVEIS:
 * - status: 'confirmado', 'cancelado', 'finalizado', 'pendente'
 * - motivo_cancelamento: string (obrigatório se status = cancelado)
 * 
 * CAMPOS NÃO EDITÁVEIS:
 * - data_hora (só pode ser alterado cancelando e criando novo)
 * - profissional_id
 * - servico_id
 * - cliente_nome, cliente_email, cliente_telefone
 * 
 * RETORNO:
 * {
 *   "sucesso": true,
 *   "mensagem": "Agendamento atualizado com sucesso"
 * }
 * 
 * PERMISSÕES:
 * - Qualquer usuário autenticado do tenant pode editar
 * - RLS garante que só edita agendamentos do próprio tenant
 * 
 * STATUS HTTP:
 * - 200: Atualizado com sucesso
 * - 400: Dados inválidos
 * - 401: Tenant ID inválido ou agendamento não pertence ao tenant
 * - 404: Agendamento não encontrado
 * - 422: Validação falhou (motivo_cancelamento obrigatório)
 * - 500: Erro interno do servidor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const agendamentoId = params.id;

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { sucesso: false, mensagem: validation.error },
        { status: validation.status || 401 }
      );
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(agendamentoId)) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'ID do agendamento inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, motivo_cancelamento } = body;

    const supabase = createServerClient();

    // Verifica se agendamento existe e pertence ao tenant
    const { data: agendamentoExistente, error: fetchError } = await supabase
      .from('agendamentos')
      .select('id, tenant_id, status')
      .eq('id', agendamentoId)
      .single();

    if (fetchError || !agendamentoExistente) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se pertence ao tenant
    if (agendamentoExistente.tenant_id !== tenantId) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Agendamento não pertence a este tenant' },
        { status: 401 }
      );
    }

    // Prepara objeto de atualização
    const updates: Record<string, any> = {};

    // Valida e adiciona status se fornecido
    if (status !== undefined) {
      const statusPermitidos = ['confirmado', 'cancelado', 'finalizado', 'pendente'];
      if (!statusPermitidos.includes(status)) {
        return NextResponse.json(
          { sucesso: false, mensagem: `Status inválido. Valores permitidos: ${statusPermitidos.join(', ')}` },
          { status: 422 }
        );
      }

      updates.status = status;

      // Se status = cancelado, motivo_cancelamento é obrigatório
      if (status === 'cancelado' && !motivo_cancelamento) {
        return NextResponse.json(
          { sucesso: false, mensagem: 'motivo_cancelamento é obrigatório quando status = cancelado' },
          { status: 422 }
        );
      }
    }

    // Valida e adiciona motivo_cancelamento se fornecido
    if (motivo_cancelamento !== undefined) {
      if (typeof motivo_cancelamento !== 'string' || motivo_cancelamento.trim() === '') {
        return NextResponse.json(
          { sucesso: false, mensagem: 'motivo_cancelamento não pode ser vazio' },
          { status: 422 }
        );
      }
      updates.motivo_cancelamento = motivo_cancelamento.trim();
    }

    // Se não há campos para atualizar
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Nenhum campo fornecido para atualizar' },
        { status: 400 }
      );
    }

    // Adiciona updated_at
    updates.updated_at = new Date().toISOString();

    // Atualiza agendamento
    const { error: updateError } = await supabase
      .from('agendamentos')
      .update(updates)
      .eq('id', agendamentoId)
      .eq('tenant_id', tenantId);

    if (updateError) {
      console.error('Erro ao atualizar agendamento:', updateError);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao atualizar agendamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Agendamento atualizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no PUT /api/agendamentos/[id]:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * ROTA: DELETE /api/agendamentos/[id]
 * 
 * FLUXO:
 * 1. Recebe id do agendamento na URL
 * 2. Valida tenant_id do header
 * 3. Valida id do agendamento (UUID)
 * 4. Verifica permissões (role = admin)
 * 5. Verifica se agendamento existe e pertence ao tenant
 * 6. Verifica se agendamento está cancelado (só pode deletar cancelados)
 * 7. Soft delete: marca deletado = true
 * 8. Retorna sucesso
 * 
 * VALIDAÇÕES:
 * - Usuário deve ter role = 'admin'
 * - Agendamento deve estar com status = 'cancelado'
 * - Agendamento deve pertencer ao tenant
 * 
 * RETORNO:
 * {
 *   "sucesso": true,
 *   "mensagem": "Agendamento removido com sucesso"
 * }
 * 
 * PERMISSÕES:
 * - Apenas usuários com role = 'admin' podem deletar
 * - RLS garante que só deleta agendamentos do próprio tenant
 * 
 * STATUS HTTP:
 * - 200: Removido com sucesso
 * - 401: Tenant ID inválido ou não autorizado (não é admin)
 * - 403: Agendamento não está cancelado (não pode deletar)
 * - 404: Agendamento não encontrado
 * - 500: Erro interno do servidor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const agendamentoId = params.id;
    const authHeader = request.headers.get('authorization');

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { sucesso: false, mensagem: validation.error },
        { status: validation.status || 401 }
      );
    }

    // TODO: Verificar permissões (role = admin)
    // Por enquanto, permite se tiver token
    if (!authHeader) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }

    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(agendamentoId)) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'ID do agendamento inválido' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verifica se agendamento existe e pertence ao tenant
    const { data: agendamentoExistente, error: fetchError } = await supabase
      .from('agendamentos')
      .select('id, tenant_id, status')
      .eq('id', agendamentoId)
      .single();

    if (fetchError || !agendamentoExistente) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se pertence ao tenant
    if (agendamentoExistente.tenant_id !== tenantId) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Agendamento não pertence a este tenant' },
        { status: 401 }
      );
    }

    // Verifica se está cancelado (só pode deletar cancelados)
    if (agendamentoExistente.status !== 'cancelado') {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Apenas agendamentos cancelados podem ser removidos' },
        { status: 403 }
      );
    }

    // Soft delete: marca deletado = true
    const { error: deleteError } = await supabase
      .from('agendamentos')
      .update({
        deletado: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agendamentoId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Erro ao remover agendamento:', deleteError);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao remover agendamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Agendamento removido com sucesso',
    });

  } catch (error) {
    console.error('Erro no DELETE /api/agendamentos/[id]:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

