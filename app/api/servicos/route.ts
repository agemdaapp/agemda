import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: GET /api/servicos
 * 
 * FLUXO:
 * 1. Recebe request com header x-tenant-id
 * 2. Valida tenant_id (formato UUID + existe no banco)
 * 3. Busca todos os serviços ativos do tenant
 * 4. Ordena por nome alfabético
 * 5. Retorna array de serviços
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - tenant_id deve ser UUID válido
 * - tenant_id deve existir na tabela companies
 * - Apenas serviços com ativo = true
 * 
 * RETORNO:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string,
 *       nome: string,
 *       descricao: string | null,
 *       duracao_minutos: number,
 *       preco: number,
 *       buffer_antes: number,
 *       buffer_depois: number
 *     }
 *   ]
 * }
 * 
 * STATUS HTTP:
 * - 200: Sucesso
 * - 401: Tenant ID inválido ou não fornecido
 * - 500: Erro interno do servidor
 * 
 * RLS (Row Level Security):
 * - Política: SELECT permitido apenas se tenant_id da linha = tenant_id do usuário
 * - Cliente Supabase usa service role (bypass RLS em API routes)
 * - Validação manual garante isolamento por tenant
 */
export async function GET(request: NextRequest) {
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

    const supabase = createServerClient();

    // Busca serviços ativos do tenant
    const { data: servicos, error } = await supabase
      .from('servicos')
      .select('id, nome, descricao, duracao_minutos, preco, buffer_minutos_antes, buffer_minutos_depois')
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar serviços' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: servicos || [],
    });

  } catch (error) {
    console.error('Erro no GET /api/servicos:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * ROTA: POST /api/servicos
 * 
 * FLUXO:
 * 1. Recebe body: { nome, descricao?, duracao_minutos, preco, buffer_antes, buffer_depois }
 * 2. Valida tenant_id do header
 * 3. Valida campos obrigatórios
 * 4. Valida regras de negócio:
 *    - nome não vazio e único por tenant
 *    - duracao_minutos > 0
 *    - preco >= 0
 *    - buffer_antes >= 0
 *    - buffer_depois >= 0
 * 5. Insere na tabela servicos com tenant_id
 * 6. Retorna serviço criado
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - nome: não vazio, string, único por tenant
 * - descricao: opcional, string ou null
 * - duracao_minutos: obrigatório, número inteiro > 0
 * - preco: obrigatório, número >= 0
 * - buffer_antes: obrigatório, número >= 0
 * - buffer_depois: obrigatório, número >= 0
 * 
 * RETORNO:
 * {
 *   success: true,
 *   servico_id: string,
 *   message: "Serviço criado com sucesso"
 * }
 * 
 * STATUS HTTP:
 * - 201: Serviço criado com sucesso
 * - 400: Dados inválidos (validação falhou)
 * - 401: Tenant ID inválido ou não fornecido
 * - 409: Nome já existe para este tenant
 * - 500: Erro interno do servidor
 * 
 * RLS (Row Level Security):
 * - Política: INSERT permitido apenas se tenant_id da linha = tenant_id do usuário
 * - Cliente Supabase usa service role (bypass RLS)
 * - Validação manual garante que tenant_id inserido = tenant_id do header
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
    const { nome, descricao, duracao_minutos, preco, buffer_antes, buffer_depois } = body;
    // Mapeia buffer_antes/buffer_depois para os nomes corretos do schema
    const buffer_minutos_antes = buffer_antes;
    const buffer_minutos_depois = buffer_depois;

    // Validações de campos obrigatórios
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nome é obrigatório e não pode ser vazio' },
        { status: 400 }
      );
    }

    if (!duracao_minutos || typeof duracao_minutos !== 'number' || duracao_minutos <= 0) {
      return NextResponse.json(
        { success: false, message: 'Duração em minutos deve ser um número maior que 0' },
        { status: 400 }
      );
    }

    if (typeof preco !== 'number' || preco < 0) {
      return NextResponse.json(
        { success: false, message: 'Preço deve ser um número maior ou igual a 0' },
        { status: 400 }
      );
    }

    if (typeof buffer_antes !== 'number' || buffer_antes < 0) {
      return NextResponse.json(
        { success: false, message: 'Buffer antes deve ser um número maior ou igual a 0' },
        { status: 400 }
      );
    }

    if (typeof buffer_depois !== 'number' || buffer_depois < 0) {
      return NextResponse.json(
        { success: false, message: 'Buffer depois deve ser um número maior ou igual a 0' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verifica se nome já existe para este tenant
    const { data: existing } = await supabase
      .from('servicos')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('nome', nome.trim())
      .eq('ativo', true)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Já existe um serviço com este nome para este tenant' },
        { status: 409 }
      );
    }

    // Insere serviço
    const { data: servico, error } = await supabase
      .from('servicos')
      .insert({
        tenant_id: tenantId,
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        duracao_minutos: Math.floor(duracao_minutos),
        preco: preco,
        buffer_minutos_antes: Math.floor(buffer_minutos_antes),
        buffer_minutos_depois: Math.floor(buffer_minutos_depois),
        ativo: true,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao criar serviço:', error);
      return NextResponse.json(
        { success: false, message: 'Erro ao criar serviço' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        servico_id: servico.id,
        message: 'Serviço criado com sucesso',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no POST /api/servicos:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

