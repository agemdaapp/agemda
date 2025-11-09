import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: GET /api/agendamentos
 * 
 * FLUXO:
 * 1. Recebe tenant_id do header
 * 2. Recebe parâmetros opcionais na query string
 * 3. Valida tenant_id
 * 4. Aplica filtros (status, profissional_id, data_inicio, data_fim)
 * 5. Aplica paginação (limit, offset)
 * 6. Busca agendamentos com JOIN em serviços, profissionais e clientes
 * 7. Ordena por data_hora DESC
 * 8. Retorna array de agendamentos
 * 
 * PARÂMETROS OPCIONAIS:
 * - ?status=confirmado (filtrar por status)
 * - ?profissional_id=xxx (filtrar por profissional)
 * - ?data_inicio=2024-01-15 (filtrar a partir desta data)
 * - ?data_fim=2024-01-20 (filtrar até esta data)
 * - ?limit=50 (quantidade de resultados, padrão: 50)
 * - ?offset=0 (página, padrão: 0)
 * 
 * RETORNO:
 * {
 *   "sucesso": true,
 *   "data": [
 *     {
 *       "id": "uuid",
 *       "cliente_nome": "João Silva",
 *       "cliente_email": "joao@email.com",
 *       "cliente_telefone": "11999999999",
 *       "data_hora": "2024-01-15T10:00:00Z",
 *       "status": "confirmado",
 *       "servico": {
 *         "id": "uuid",
 *         "nome": "Corte Masculino",
 *         "duracao_minutos": 30
 *       },
 *       "profissional": {
 *         "id": "uuid",
 *         "nome": "Carlos Barbeiro"
 *       }
 *     }
 *   ],
 *   "total": 100,
 *   "limit": 50,
 *   "offset": 0
 * }
 * 
 * PERMISSÕES:
 * - Qualquer usuário autenticado do tenant pode listar
 * - RLS garante que só vê agendamentos do próprio tenant
 * 
 * STATUS HTTP:
 * - 200: Sucesso
 * - 401: Tenant ID inválido
 * - 500: Erro interno do servidor
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const profissionalId = searchParams.get('profissional_id');
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerClient();

    // Monta query base
    let query = supabase
      .from('agendamentos')
      .select(`
        id,
        cliente_nome,
        cliente_email,
        cliente_telefone,
        data_hora,
        status,
        servico:servicos(id, nome, duracao_minutos, preco),
        profissional:profissionais(id, nome)
      `)
      .eq('tenant_id', tenantId)
      .order('data_hora', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplica filtros
    if (status) {
      query = query.eq('status', status);
    }

    if (profissionalId) {
      query = query.eq('profissional_id', profissionalId);
    }

    if (dataInicio) {
      query = query.gte('data_hora', dataInicio);
    }

    if (dataFim) {
      query = query.lte('data_hora', dataFim);
    }

    const { data: agendamentos, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao buscar agendamentos' },
        { status: 500 }
      );
    }

    // Busca total para paginação
    const { count: total } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    return NextResponse.json({
      sucesso: true,
      data: agendamentos || [],
      total: total || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Erro no GET /api/agendamentos:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

