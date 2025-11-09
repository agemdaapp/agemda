import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: POST /api/profissionais/[id]/servicos
 * 
 * FLUXO:
 * 1. Recebe id do profissional na URL
 * 2. Recebe body: { servico_id: [array de UUIDs] }
 * 3. Valida tenant_id do header
 * 4. Valida id do profissional (UUID)
 * 5. Verifica se profissional existe e pertence ao tenant
 * 6. Valida array de servico_id:
 *    - Deve ser array
 *    - Cada ID deve ser UUID válido
 *    - Cada serviço deve existir e pertencer ao mesmo tenant
 * 7. Remove todas as associações antigas do profissional (DELETE)
 * 8. Insere novas associações (INSERT em lote)
 * 9. Retorna sucesso com lista de serviços associados
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - id do profissional deve ser UUID válido
 * - Profissional deve existir e pertencer ao tenant
 * - servico_id deve ser array
 * - Cada servico_id deve ser UUID válido
 * - Cada serviço deve existir na tabela servicos
 * - Cada serviço deve pertencer ao mesmo tenant
 * - Serviços devem estar ativos (ativo = true)
 * 
 * RETORNO:
 * {
 *   success: true,
 *   message: "Serviços associados com sucesso",
 *   servicos_associados: [array de IDs dos serviços]
 * }
 * 
 * STATUS HTTP:
 * - 200: Serviços associados com sucesso
 * - 400: Dados inválidos (IDs inválidos, array vazio, etc)
 * - 401: Tenant ID inválido ou profissional não pertence ao tenant
 * - 404: Profissional não encontrado ou serviço não encontrado
 * - 500: Erro interno do servidor
 * 
 * FLUXO DE ASSOCIAÇÃO SERVIÇO-PROFISSIONAL:
 * 
 * 1. VALIDAÇÃO INICIAL:
 *    - Verifica se profissional existe e pertence ao tenant
 * 
 * 2. VALIDAÇÃO DE SERVIÇOS:
 *    - Para cada servico_id no array:
 *      a. Valida formato UUID
 *      b. Verifica se serviço existe
 *      c. Verifica se serviço pertence ao tenant
 *      d. Verifica se serviço está ativo
 *    - Se algum serviço inválido: retorna erro 400/404
 * 
 * 3. LIMPEZA DE ASSOCIAÇÕES ANTIGAS:
 *    DELETE FROM profissional_servico
 *    WHERE profissional_id = :profissional_id
 * 
 * 4. INSERÇÃO DE NOVAS ASSOCIAÇÕES:
 *    INSERT INTO profissional_servico (profissional_id, servico_id, tenant_id)
 *    VALUES
 *      (:profissional_id, :servico_id_1, :tenant_id),
 *      (:profissional_id, :servico_id_2, :tenant_id),
 *      ...
 * 
 * 5. RETORNO:
 *    - Lista de IDs dos serviços associados
 *    - Confirmação de sucesso
 * 
 * ESTRUTURA DA TABELA profissional_servico:
 * - id: UUID (PK)
 * - profissional_id: UUID (FK -> profissionais.id)
 * - servico_id: UUID (FK -> servicos.id)
 * - tenant_id: UUID (FK -> companies.id) - para garantir isolamento
 * - created_at: TIMESTAMP
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const profissionalId = params.id;

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

    const body = await request.json();
    const { servico_id } = body;

    // Valida array de servico_id
    if (!Array.isArray(servico_id)) {
      return NextResponse.json(
        { success: false, message: 'servico_id deve ser um array' },
        { status: 400 }
      );
    }

    // Remove duplicatas
    const servicosUnicos = [...new Set(servico_id)];

    // Valida cada ID
    for (const servicoId of servicosUnicos) {
      if (!uuidRegex.test(servicoId)) {
        return NextResponse.json(
          { success: false, message: `ID do serviço inválido: ${servicoId}` },
          { status: 400 }
        );
      }
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

    // Se array vazio, apenas remove associações antigas
    if (servicosUnicos.length === 0) {
      const { error: deleteError } = await supabase
        .from('profissional_servico')
        .delete()
        .eq('profissional_id', profissionalId)
        .eq('tenant_id', tenantId);

      if (deleteError) {
        console.error('Erro ao remover associações:', deleteError);
        return NextResponse.json(
          { success: false, message: 'Erro ao remover associações' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Associações removidas com sucesso',
        servicos_associados: [],
      });
    }

    // Valida se todos os serviços existem e pertencem ao tenant
    const { data: servicos, error: servicosError } = await supabase
      .from('servicos')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .in('id', servicosUnicos);

    if (servicosError) {
      console.error('Erro ao validar serviços:', servicosError);
      return NextResponse.json(
        { success: false, message: 'Erro ao validar serviços' },
        { status: 500 }
      );
    }

    // Verifica se todos os serviços foram encontrados
    if (!servicos || servicos.length !== servicosUnicos.length) {
      const servicosEncontrados = servicos?.map(s => s.id) || [];
      const servicosNaoEncontrados = servicosUnicos.filter(
        id => !servicosEncontrados.includes(id)
      );
      return NextResponse.json(
        {
          success: false,
          message: `Serviços não encontrados ou inativos: ${servicosNaoEncontrados.join(', ')}`,
        },
        { status: 404 }
      );
    }

    // Remove associações antigas
    const { error: deleteError } = await supabase
      .from('profissional_servico')
      .delete()
      .eq('profissional_id', profissionalId)
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Erro ao remover associações antigas:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Erro ao remover associações antigas' },
        { status: 500 }
      );
    }

    // Insere novas associações
    const associacoes = servicosUnicos.map(servicoId => ({
      profissional_id: profissionalId,
      servico_id: servicoId,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('profissional_servico')
      .insert(associacoes);

    if (insertError) {
      console.error('Erro ao associar serviços:', insertError);
      return NextResponse.json(
        { success: false, message: 'Erro ao associar serviços' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Serviços associados com sucesso',
      servicos_associados: servicosUnicos,
    });

  } catch (error) {
    console.error('Erro no POST /api/profissionais/[id]/servicos:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

