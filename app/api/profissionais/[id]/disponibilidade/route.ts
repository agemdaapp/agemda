import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: GET /api/profissionais/[id]/disponibilidade?data=2024-01-15
 * 
 * FLUXO:
 * 1. Recebe id do profissional na URL
 * 2. Recebe parâmetro obrigatório ?data=YYYY-MM-DD na query string
 * 3. Valida tenant_id do header
 * 4. Valida id do profissional (UUID)
 * 5. Valida formato da data (YYYY-MM-DD)
 * 6. Verifica se profissional existe e pertence ao tenant
 * 7. Chama função RPC do Supabase: buscar_horarios_disponiveis
 * 8. Passa parâmetros: profissional_id, tenant_id, data
 * 9. Retorna array de horários disponíveis
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - id do profissional deve ser UUID válido
 * - data deve ser fornecida na query string
 * - data deve estar no formato YYYY-MM-DD
 * - data não pode ser no passado
 * - Profissional deve existir e pertencer ao tenant
 * 
 * RETORNO:
 * {
 *   success: true,
 *   data: "2024-01-15",
 *   profissional_id: string,
 *   horarios: [
 *     { hora: "09:00", disponivel: true },
 *     { hora: "09:30", disponivel: false },
 *     { hora: "10:00", disponivel: true },
 *     ...
 *   ]
 * }
 * 
 * STATUS HTTP:
 * - 200: Sucesso
 * - 400: Dados inválidos (data inválida, formato incorreto)
 * - 401: Tenant ID inválido ou profissional não pertence ao tenant
 * - 404: Profissional não encontrado
 * - 500: Erro interno do servidor
 * 
 * FUNÇÃO RPC: buscar_horarios_disponiveis
 * 
 * Esta função deve ser criada no Supabase com a seguinte assinatura:
 * 
 * CREATE OR REPLACE FUNCTION buscar_horarios_disponiveis(
 *   p_profissional_id UUID,
 *   p_tenant_id UUID,
 *   p_data DATE
 * )
 * RETURNS TABLE (
 *   hora TIME,
 *   disponivel BOOLEAN
 * ) AS $$
 * BEGIN
 *   -- Lógica:
 *   -- 1. Busca horários de funcionamento do tenant
 *   -- 2. Busca agendamentos confirmados do profissional na data
 *   -- 3. Calcula slots disponíveis considerando:
 *   --    - Horário de funcionamento
 *   --    - Agendamentos existentes
 *   --    - Duração dos serviços do profissional
 *   --    - Buffers (antes e depois)
 *   -- 4. Retorna array de horários com disponibilidade
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * PARÂMETROS DA FUNÇÃO RPC:
 * - p_profissional_id: UUID do profissional
 * - p_tenant_id: UUID do tenant
 * - p_data: Data no formato DATE (YYYY-MM-DD)
 * 
 * RETORNO DA FUNÇÃO RPC:
 * - Array de objetos { hora: TIME, disponivel: BOOLEAN }
 * - Horários de 00:00 até 23:30 (intervalo de 30 minutos)
 * - disponivel: true se slot está livre, false se ocupado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const profissionalId = params.id;
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status || 401 }
      );
    }

    // Valida se id é UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profissionalId)) {
      return NextResponse.json(
        { success: false, message: 'ID do profissional inválido' },
        { status: 400 }
      );
    }

    // Valida parâmetro data
    if (!dataParam) {
      return NextResponse.json(
        { success: false, message: 'Parâmetro data é obrigatório' },
        { status: 400 }
      );
    }

    // Valida formato da data (YYYY-MM-DD)
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(dataParam)) {
      return NextResponse.json(
        { success: false, message: 'Data deve estar no formato YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Valida se data não é no passado
    const data = new Date(dataParam);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (isNaN(data.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Data inválida' },
        { status: 400 }
      );
    }

    if (data < hoje) {
      return NextResponse.json(
        { success: false, message: 'Data não pode ser no passado' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verifica se profissional existe e pertence ao tenant
    const { data: profissionalExistente, error: fetchError } = await supabase
      .from('profissionais')
      .select('id, tenant_id')
      .eq('id', profissionalId)
      .single();

    if (fetchError || !profissionalExistente) {
      return NextResponse.json(
        { success: false, message: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se pertence ao tenant
    if (profissionalExistente.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, message: 'Profissional não pertence a este tenant' },
        { status: 401 }
      );
    }

    // Chama função RPC do Supabase
    const { data: horarios, error: rpcError } = await supabase.rpc(
      'buscar_horarios_disponiveis',
      {
        p_profissional_id: profissionalId,
        p_tenant_id: tenantId,
        p_data: dataParam,
      }
    );

    if (rpcError) {
      console.error('Erro ao buscar horários disponíveis:', rpcError);
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar horários disponíveis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dataParam,
      profissional_id: profissionalId,
      horarios: horarios || [],
    });

  } catch (error) {
    console.error('Erro no GET /api/profissionais/[id]/disponibilidade:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

