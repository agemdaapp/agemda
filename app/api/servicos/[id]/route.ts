import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: PUT /api/servicos/[id]
 * 
 * FLUXO:
 * 1. Recebe id do serviço na URL
 * 2. Recebe body com campos opcionais para atualizar
 * 3. Valida tenant_id do header
 * 4. Verifica se serviço existe e pertence ao tenant
 * 5. Valida campos enviados (mesmas regras de POST)
 * 6. Atualiza apenas os campos fornecidos
 * 7. Retorna sucesso
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - id deve ser UUID válido
 * - Serviço deve existir
 * - Serviço deve pertencer ao tenant (tenant_id da linha = tenant_id do header)
 * - Se nome enviado: não vazio e único por tenant (exceto o próprio serviço)
 * - Se duracao_minutos: número > 0
 * - Se preco: número >= 0
 * - Se buffer_antes: número >= 0
 * - Se buffer_depois: número >= 0
 * 
 * RETORNO:
 * {
 *   success: true,
 *   message: "Serviço atualizado com sucesso"
 * }
 * 
 * STATUS HTTP:
 * - 200: Serviço atualizado com sucesso
 * - 400: Dados inválidos (validação falhou)
 * - 401: Tenant ID inválido ou não fornecido
 * - 404: Serviço não encontrado ou não pertence ao tenant
 * - 409: Nome já existe para este tenant (se nome foi alterado)
 * - 500: Erro interno do servidor
 * 
 * RLS (Row Level Security):
 * - Política: UPDATE permitido apenas se tenant_id da linha = tenant_id do usuário
 * - Cliente Supabase usa service role (bypass RLS)
 * - Validação manual garante que apenas serviços do tenant sejam atualizados
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = await params;
    const servicoId = id;

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
    if (!uuidRegex.test(servicoId)) {
      return NextResponse.json(
        { success: false, message: 'ID do serviço inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nome, descricao, duracao_minutos, preco, buffer_antes, buffer_depois } = body;
    // Mapeia buffer_antes/buffer_depois para os nomes corretos do schema
    const buffer_minutos_antes = buffer_antes;
    const buffer_minutos_depois = buffer_depois;

    const supabase = createServerClient();

    // Verifica se serviço existe e pertence ao tenant
    const { data: servicoExistente, error: fetchError } = await supabase
      .from('servicos')
      .select('id, tenant_id, nome')
      .eq('id', servicoId)
      .single();

    if (fetchError || !servicoExistente) {
      return NextResponse.json(
        { success: false, message: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se pertence ao tenant
    if (servicoExistente.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, message: 'Serviço não pertence a este tenant' },
        { status: 401 }
      );
    }

    // Prepara objeto de atualização
    const updates: Record<string, any> = {};

    // Valida e adiciona nome se fornecido
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim() === '') {
        return NextResponse.json(
          { success: false, message: 'Nome não pode ser vazio' },
          { status: 400 }
        );
      }

      // Verifica se nome já existe (exceto o próprio serviço)
      if (nome.trim() !== servicoExistente.nome) {
        const { data: existing } = await supabase
          .from('servicos')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('nome', nome.trim())
          .eq('ativo', true)
          .neq('id', servicoId)
          .single();

        if (existing) {
          return NextResponse.json(
            { success: false, message: 'Já existe um serviço com este nome para este tenant' },
            { status: 409 }
          );
        }
      }

      updates.nome = nome.trim();
    }

    // Valida e adiciona descricao se fornecido
    if (descricao !== undefined) {
      updates.descricao = descricao === null || descricao === '' ? null : descricao.trim();
    }

    // Valida e adiciona duracao_minutos se fornecido
    if (duracao_minutos !== undefined) {
      if (typeof duracao_minutos !== 'number' || duracao_minutos <= 0) {
        return NextResponse.json(
          { success: false, message: 'Duração em minutos deve ser um número maior que 0' },
          { status: 400 }
        );
      }
      updates.duracao_minutos = Math.floor(duracao_minutos);
    }

    // Valida e adiciona preco se fornecido
    if (preco !== undefined) {
      if (typeof preco !== 'number' || preco < 0) {
        return NextResponse.json(
          { success: false, message: 'Preço deve ser um número maior ou igual a 0' },
          { status: 400 }
        );
      }
      updates.preco = preco;
    }

    // Valida e adiciona buffer_antes se fornecido
    if (buffer_antes !== undefined) {
      if (typeof buffer_antes !== 'number' || buffer_antes < 0) {
        return NextResponse.json(
          { success: false, message: 'Buffer antes deve ser um número maior ou igual a 0' },
          { status: 400 }
        );
      }
      updates.buffer_minutos_antes = Math.floor(buffer_antes);
    }

    // Valida e adiciona buffer_depois se fornecido
    if (buffer_depois !== undefined) {
      if (typeof buffer_depois !== 'number' || buffer_depois < 0) {
        return NextResponse.json(
          { success: false, message: 'Buffer depois deve ser um número maior ou igual a 0' },
          { status: 400 }
        );
      }
      updates.buffer_minutos_depois = Math.floor(buffer_depois);
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

    // Atualiza serviço
    const { error: updateError } = await supabase
      .from('servicos')
      .update(updates)
      .eq('id', servicoId)
      .eq('tenant_id', tenantId); // Garante que só atualiza se pertencer ao tenant

    if (updateError) {
      console.error('Erro ao atualizar serviço:', updateError);
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar serviço' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no PUT /api/servicos/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * ROTA: DELETE /api/servicos/[id]
 * 
 * FLUXO:
 * 1. Recebe id do serviço na URL
 * 2. Valida tenant_id do header
 * 3. Verifica se serviço existe e pertence ao tenant
 * 4. Verifica se há agendamentos futuros para este serviço
 * 5. Se houver agendamentos: retorna erro
 * 6. Se não houver: faz soft delete (ativo = false)
 * 7. Retorna sucesso
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - id deve ser UUID válido
 * - Serviço deve existir
 * - Serviço deve pertencer ao tenant
 * - Não deve ter agendamentos futuros (data >= hoje)
 * 
 * RETORNO:
 * {
 *   success: true,
 *   message: "Serviço removido com sucesso"
 * }
 * 
 * STATUS HTTP:
 * - 200: Serviço removido com sucesso
 * - 400: ID do serviço inválido
 * - 401: Tenant ID inválido ou não fornecido
 * - 404: Serviço não encontrado ou não pertence ao tenant
 * - 409: Serviço possui agendamentos futuros e não pode ser removido
 * - 500: Erro interno do servidor
 * 
 * RLS (Row Level Security):
 * - Política: DELETE permitido apenas se tenant_id da linha = tenant_id do usuário
 * - Cliente Supabase usa service role (bypass RLS)
 * - Validação manual garante que apenas serviços do tenant sejam deletados
 * - Soft delete mantém dados para histórico
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = await params;
    const servicoId = id;

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
    if (!uuidRegex.test(servicoId)) {
      return NextResponse.json(
        { success: false, message: 'ID do serviço inválido' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verifica se serviço existe e pertence ao tenant
    const { data: servicoExistente, error: fetchError } = await supabase
      .from('servicos')
      .select('id, tenant_id')
      .eq('id', servicoId)
      .single();

    if (fetchError || !servicoExistente) {
      return NextResponse.json(
        { success: false, message: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se pertence ao tenant
    if (servicoExistente.tenant_id !== tenantId) {
      return NextResponse.json(
        { success: false, message: 'Serviço não pertence a este tenant' },
        { status: 401 }
      );
    }

    // Verifica se há agendamentos futuros
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('servico_id', servicoId)
      .eq('tenant_id', tenantId)
      .gte('data', hoje)
      .eq('status', 'confirmado') // Apenas agendamentos confirmados
      .limit(1);

    if (agendamentosError) {
      console.error('Erro ao verificar agendamentos:', agendamentosError);
      // Continua mesmo com erro (não bloqueia delete)
    }

    if (agendamentos && agendamentos.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Não é possível remover serviço com agendamentos futuros confirmados',
        },
        { status: 409 }
      );
    }

    // Soft delete: marca como inativo
    const { error: deleteError } = await supabase
      .from('servicos')
      .update({
        ativo: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', servicoId)
      .eq('tenant_id', tenantId); // Garante que só atualiza se pertencer ao tenant

    if (deleteError) {
      console.error('Erro ao remover serviço:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Erro ao remover serviço' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Serviço removido com sucesso',
    });

  } catch (error) {
    console.error('Erro no DELETE /api/servicos/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

