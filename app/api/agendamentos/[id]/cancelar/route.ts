import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: POST /api/agendamentos/[id]/cancelar
 * 
 * FLUXO:
 * 1. Recebe id do agendamento na URL
 * 2. Recebe body com motivo (opcional)
 * 3. Valida tenant_id do header
 * 4. Valida id do agendamento (UUID)
 * 5. Verifica se agendamento existe e pertence ao tenant
 * 6. Valida que agendamento não foi "finalizado" ou já "cancelado"
 * 7. Chama função RPC cancelar_agendamento
 * 8. Função RPC:
 *    - Marca status = 'cancelado'
 *    - Marca cancelado_em = NOW()
 *    - Salva motivo_cancelamento (se fornecido)
 *    - Retorna sucesso
 * 9. Retorna resposta
 * 
 * VALIDAÇÕES:
 * - Agendamento não pode estar com status = 'finalizado'
 * - Agendamento não pode estar com status = 'cancelado' (já cancelado)
 * - Agendamento deve pertencer ao tenant
 * 
 * RETORNO:
 * {
 *   "sucesso": true,
 *   "mensagem": "Agendamento cancelado com sucesso"
 * }
 * 
 * PERMISSÕES:
 * - Qualquer usuário autenticado do tenant pode cancelar
 * - RLS garante que só cancela agendamentos do próprio tenant
 * 
 * STATUS HTTP:
 * - 200: Cancelado com sucesso
 * - 400: Agendamento já cancelado ou finalizado
 * - 401: Tenant ID inválido ou agendamento não pertence ao tenant
 * - 404: Agendamento não encontrado
 * - 500: Erro interno do servidor
 */
export async function POST(
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
    const { motivo } = body;

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

    // Valida que não está finalizado ou já cancelado
    if (agendamentoExistente.status === 'finalizado') {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Não é possível cancelar agendamento já finalizado' },
        { status: 400 }
      );
    }

    if (agendamentoExistente.status === 'cancelado') {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Agendamento já está cancelado' },
        { status: 400 }
      );
    }

    // Chama função RPC cancelar_agendamento
    const { data: resultado, error: rpcError } = await supabase.rpc(
      'cancelar_agendamento',
      {
        p_agendamento_id: agendamentoId,
        p_tenant_id: tenantId,
        p_motivo: motivo?.trim() || null,
      }
    );

    if (rpcError) {
      console.error('Erro na função RPC:', rpcError);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao cancelar agendamento' },
        { status: 500 }
      );
    }

    if (!resultado || !resultado.sucesso) {
      return NextResponse.json(
        { sucesso: false, mensagem: resultado?.mensagem || 'Erro ao cancelar agendamento' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: resultado.mensagem || 'Agendamento cancelado com sucesso',
    });

  } catch (error) {
    console.error('Erro no POST /api/agendamentos/[id]/cancelar:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

