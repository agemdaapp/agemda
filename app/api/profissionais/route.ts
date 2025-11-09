import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: GET /api/profissionais
 * 
 * FLUXO:
 * 1. Recebe request com header x-tenant-id
 * 2. Recebe parâmetro opcional ?servico_id=xxx na query string
 * 3. Valida tenant_id (formato UUID + existe no banco)
 * 4. Se servico_id fornecido:
 *    - Valida se servico_id é UUID válido
 *    - Valida se serviço pertence ao tenant
 *    - Busca profissionais que têm esse serviço associado
 * 5. Se servico_id não fornecido:
 *    - Busca todos os profissionais ativos do tenant
 * 6. Para cada profissional, conta quantos serviços tem associados
 * 7. Ordena por nome alfabético
 * 8. Retorna array de profissionais
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - tenant_id deve ser UUID válido
 * - tenant_id deve existir na tabela companies
 * - Se servico_id fornecido: deve ser UUID válido e pertencer ao tenant
 * - Apenas profissionais com ativo = true
 * 
 * RETORNO:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string,
 *       nome: string,
 *       foto_url: string | null,
 *       ativo: boolean,
 *       servicos_count: number
 *     }
 *   ]
 * }
 * 
 * STATUS HTTP:
 * - 200: Sucesso
 * - 400: servico_id inválido (se fornecido)
 * - 401: Tenant ID inválido ou não fornecido
 * - 404: Serviço não encontrado (se servico_id fornecido)
 * - 500: Erro interno do servidor
 * 
 * QUERY PARAMETERS:
 * - servico_id (opcional): UUID do serviço para filtrar profissionais
 * 
 * EXEMPLO DE QUERY:
 * GET /api/profissionais?servico_id=abc-123
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const servicoId = searchParams.get('servico_id');

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status || 401 }
      );
    }

    const supabase = createServerClient();

    // Se servico_id fornecido, valida e busca profissionais do serviço
    if (servicoId) {
      // Valida formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(servicoId)) {
        return NextResponse.json(
          { success: false, message: 'ID do serviço inválido' },
          { status: 400 }
        );
      }

      // Valida se serviço existe e pertence ao tenant
      const { data: servico, error: servicoError } = await supabase
        .from('servicos')
        .select('id')
        .eq('id', servicoId)
        .eq('tenant_id', tenantId)
        .single();

      if (servicoError || !servico) {
        return NextResponse.json(
          { success: false, message: 'Serviço não encontrado' },
          { status: 404 }
        );
      }

      // Busca profissionais que têm esse serviço associado
      // JOIN com tabela profissional_servico
      const { data: profissionais, error } = await supabase
        .from('profissionais')
        .select(`
          id,
          nome,
          foto_url,
          ativo,
          profissional_servico!inner(servico_id)
        `)
        .eq('tenant_id', tenantId)
        .eq('ativo', true)
        .eq('profissional_servico.servico_id', servicoId)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar profissionais:', error);
        return NextResponse.json(
          { success: false, message: 'Erro ao buscar profissionais' },
          { status: 500 }
        );
      }

      // Processa dados: conta serviços por profissional
      const profissionaisProcessados = profissionais?.map(prof => ({
        id: prof.id,
        nome: prof.nome,
        foto_url: prof.foto_url,
        ativo: prof.ativo,
        servicos_count: Array.isArray(prof.profissional_servico) 
          ? prof.profissional_servico.length 
          : 0,
      })) || [];

      return NextResponse.json({
        success: true,
        data: profissionaisProcessados,
      });
    }

    // Se não há filtro por serviço, busca todos os profissionais
    const { data: profissionais, error } = await supabase
      .from('profissionais')
      .select(`
        id,
        nome,
        foto_url,
        ativo,
        profissional_servico(servico_id)
      `)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar profissionais:', error);
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar profissionais' },
        { status: 500 }
      );
    }

    // Processa dados: conta serviços por profissional
    const profissionaisProcessados = profissionais?.map(prof => ({
      id: prof.id,
      nome: prof.nome,
      foto_url: prof.foto_url,
      ativo: prof.ativo,
      servicos_count: Array.isArray(prof.profissional_servico) 
        ? prof.profissional_servico.length 
        : 0,
    })) || [];

    return NextResponse.json({
      success: true,
      data: profissionaisProcessados,
    });

  } catch (error) {
    console.error('Erro no GET /api/profissionais:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * ROTA: POST /api/profissionais
 * 
 * FLUXO:
 * 1. Recebe body: { nome, foto_url? }
 * 2. Valida tenant_id do header
 * 3. Valida campos obrigatórios:
 *    - nome: mínimo 2 caracteres, máximo 100
 *    - foto_url: opcional, se fornecido deve ser URL válida
 * 4. Busca plano do tenant na tabela companies
 * 5. Conta profissionais ativos do tenant
 * 6. Verifica limite do plano:
 *    - Plano 'basico': máximo 2 profissionais
 *    - Plano 'intermediario': máximo 5 profissionais
 *    - Plano 'premium': sem limite
 * 7. Se exceder limite: retorna erro 403 com mensagem clara
 * 8. Se dentro do limite: insere profissional
 * 9. Retorna profissional criado
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - nome: obrigatório, string, mínimo 2 caracteres, máximo 100
 * - foto_url: opcional, se fornecido deve ser URL válida
 * - Plano do tenant deve existir
 * - Contagem de profissionais ativos deve respeitar limite do plano
 * 
 * RETORNO:
 * {
 *   success: true,
 *   profissional_id: string,
 *   message: "Profissional criado com sucesso"
 * }
 * 
 * STATUS HTTP:
 * - 201: Profissional criado com sucesso
 * - 400: Dados inválidos (validação falhou)
 * - 401: Tenant ID inválido ou não fornecido
 * - 403: Limite de profissionais excedido para o plano
 * - 500: Erro interno do servidor
 * 
 * MENSAGENS DE ERRO 403:
 * - Plano básico: "Plano básico permite apenas 2 profissionais. Upgrade para intermediário para ter até 5 profissionais."
 * - Plano intermediário: "Plano intermediário permite apenas 5 profissionais. Upgrade para premium para ter profissionais ilimitados."
 * 
 * COMO CONTAR PROFISSIONAIS:
 * SELECT COUNT(*) FROM profissionais 
 * WHERE tenant_id = :tenant_id AND ativo = true
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status || 401 }
      );
    }

    const body = await request.json();
    const { nome, foto_url } = body;

    // Validações de campos
    if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
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

    // Valida foto_url se fornecido
    if (foto_url !== undefined && foto_url !== null) {
      if (typeof foto_url !== 'string' || foto_url.trim() === '') {
        return NextResponse.json(
          { success: false, message: 'Foto URL inválida' },
          { status: 400 }
        );
      }

      // Valida formato de URL
      try {
        new URL(foto_url);
      } catch {
        return NextResponse.json(
          { success: false, message: 'Foto URL deve ser uma URL válida' },
          { status: 400 }
        );
      }
    }

    const supabase = createServerClient();

    // Busca plano do tenant
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', tenantId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, message: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    const plano = company.plan;

    // Conta profissionais ativos do tenant
    const { count, error: countError } = await supabase
      .from('profissionais')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('ativo', true);

    if (countError) {
      console.error('Erro ao contar profissionais:', countError);
      return NextResponse.json(
        { success: false, message: 'Erro ao verificar limite de profissionais' },
        { status: 500 }
      );
    }

    const profissionaisAtivos = count || 0;

    // Verifica limite do plano
    let limite: number | null = null;
    let mensagemUpgrade = '';

    if (plano === 'basico') {
      limite = 2;
      mensagemUpgrade = 'Upgrade para intermediário para ter até 5 profissionais.';
    } else if (plano === 'intermediario') {
      limite = 5;
      mensagemUpgrade = 'Upgrade para premium para ter profissionais ilimitados.';
    } else if (plano === 'premium') {
      limite = null; // Sem limite
    } else {
      return NextResponse.json(
        { success: false, message: 'Plano do tenant inválido' },
        { status: 500 }
      );
    }

    // Se tem limite e excedeu
    if (limite !== null && profissionaisAtivos >= limite) {
      const planoNome = plano === 'basico' ? 'básico' : 'intermediário';
      return NextResponse.json(
        {
          success: false,
          message: `Plano ${planoNome} permite apenas ${limite} profissionais. ${mensagemUpgrade}`,
        },
        { status: 403 }
      );
    }

    // Insere profissional
    const { data: profissional, error: insertError } = await supabase
      .from('profissionais')
      .insert({
        tenant_id: tenantId,
        nome: nome.trim(),
        foto_url: foto_url?.trim() || null,
        ativo: true,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Erro ao criar profissional:', insertError);
      return NextResponse.json(
        { success: false, message: 'Erro ao criar profissional' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profissional_id: profissional.id,
        message: 'Profissional criado com sucesso',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no POST /api/profissionais:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

