import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: PUT /api/profissionais/[id]
 * 
 * FLUXO:
 * 1. Recebe id do profissional na URL
 * 2. Recebe body com campos opcionais: { nome?, foto_url? }
 * 3. Valida tenant_id do header
 * 4. Valida id do profissional (UUID)
 * 5. Verifica se profissional existe
 * 6. Verifica se profissional pertence ao tenant
 * 7. Valida campos enviados:
 *    - nome: mínimo 2 caracteres, máximo 100 (se fornecido)
 *    - foto_url: URL válida (se fornecido)
 * 8. Atualiza apenas os campos fornecidos
 * 9. Retorna sucesso
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - id deve ser UUID válido
 * - Profissional deve existir
 * - Profissional deve pertencer ao tenant
 * - Se nome enviado: mínimo 2 caracteres, máximo 100
 * - Se foto_url enviado: deve ser URL válida
 * 
 * RETORNO:
 * {
 *   success: true,
 *   message: "Profissional atualizado com sucesso"
 * }
 * 
 * STATUS HTTP:
 * - 200: Profissional atualizado com sucesso
 * - 400: Dados inválidos ou ID inválido
 * - 401: Tenant ID inválido ou profissional não pertence ao tenant
 * - 404: Profissional não encontrado
 * - 500: Erro interno do servidor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = await params;
    const profissionalId = id;

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
    const { nome, foto_url } = body;

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

    // Prepara objeto de atualização
    const updates: Record<string, any> = {};

    // Valida e adiciona nome se fornecido
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim().length < 2) {
        return NextResponse.json(
          { success: false, message: 'Nome deve ter no mínimo 2 caracteres' },
          { status: 400 }
        );
      }

      if (nome.trim().length > 100) {
        return NextResponse.json(
          { success: false, message: 'Nome deve ter no máximo 100 caracteres' },
          { status: 400 }
        );
      }

      updates.nome = nome.trim();
    }

    // Valida e adiciona foto_url se fornecido
    if (foto_url !== undefined) {
      if (foto_url === null || foto_url === '') {
        updates.foto_url = null;
      } else {
        if (typeof foto_url !== 'string') {
          return NextResponse.json(
            { success: false, message: 'Foto URL inválida' },
            { status: 400 }
          );
        }

        // Valida formato de URL
        try {
          new URL(foto_url);
          updates.foto_url = foto_url.trim();
        } catch {
          return NextResponse.json(
            { success: false, message: 'Foto URL deve ser uma URL válida' },
            { status: 400 }
          );
        }
      }
    }

    // Se não há campos para atualizar
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nenhum campo fornecido para atualizar' },
        { status: 400 }
      );
    }

    // Adiciona updated_at
    updates.updated_at = new Date().toISOString();

    // Atualiza profissional
    const { error: updateError } = await supabase
      .from('profissionais')
      .update(updates)
      .eq('id', profissionalId)
      .eq('tenant_id', tenantId); // Garante que só atualiza se pertencer ao tenant

    if (updateError) {
      console.error('Erro ao atualizar profissional:', updateError);
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar profissional' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profissional atualizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no PUT /api/profissionais/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * ROTA: DELETE /api/profissionais/[id]
 * 
 * FLUXO:
 * 1. Recebe id do profissional na URL
 * 2. Valida tenant_id do header
 * 3. Valida id do profissional (UUID)
 * 4. Verifica se profissional existe
 * 5. Verifica se profissional pertence ao tenant
 * 6. Verifica se há agendamentos futuros confirmados para este profissional
 * 7. Se houver agendamentos: retorna erro 409
 * 8. Se não houver: faz soft delete (ativo = false)
 * 9. Retorna sucesso
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - id deve ser UUID válido
 * - Profissional deve existir
 * - Profissional deve pertencer ao tenant
 * - Não deve ter agendamentos futuros confirmados (data >= hoje e status = 'confirmado')
 * 
 * RETORNO:
 * {
 *   success: true,
 *   message: "Profissional removido com sucesso"
 * }
 * 
 * STATUS HTTP:
 * - 200: Profissional removido com sucesso
 * - 400: ID do profissional inválido
 * - 401: Tenant ID inválido ou profissional não pertence ao tenant
 * - 404: Profissional não encontrado
 * - 409: Profissional possui agendamentos futuros confirmados
 * - 500: Erro interno do servidor
 * 
 * VERIFICAÇÃO DE AGENDAMENTOS:
 * SELECT COUNT(*) FROM agendamentos
 * WHERE profissional_id = :profissional_id
 *   AND tenant_id = :tenant_id
 *   AND data >= CURRENT_DATE
 *   AND status = 'confirmado'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = await params;
    const profissionalId = id;

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

    // Verifica se há agendamentos futuros confirmados
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('profissional_id', profissionalId)
      .eq('tenant_id', tenantId)
      .gte('data', hoje)
      .eq('status', 'confirmado')
      .limit(1);

    if (agendamentosError) {
      console.error('Erro ao verificar agendamentos:', agendamentosError);
      // Continua mesmo com erro (não bloqueia delete)
    }

    if (agendamentos && agendamentos.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Não é possível remover profissional com agendamentos futuros confirmados',
        },
        { status: 409 }
      );
    }

    // Soft delete: marca como inativo
    const { error: deleteError } = await supabase
      .from('profissionais')
      .update({
        ativo: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profissionalId)
      .eq('tenant_id', tenantId); // Garante que só atualiza se pertencer ao tenant

    if (deleteError) {
      console.error('Erro ao remover profissional:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Erro ao remover profissional' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profissional removido com sucesso',
    });

  } catch (error) {
    console.error('Erro no DELETE /api/profissionais/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

