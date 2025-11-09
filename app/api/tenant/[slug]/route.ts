import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ROTA: GET /api/tenant/[slug]
 * 
 * Retorna todos os dados de um tenant (empresa) incluindo customizações
 * 
 * RETORNO:
 * {
 *   empresa: { id, name, slug, vertical, plan },
 *   customizacoes: { cor_primaria, cor_secundaria, logo_url, descricao, botao_agendamento_ativo },
 *   horarios: Array,
 *   profissionais: Array,
 *   servicos: Array
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createServerClient();

    // Busca empresa pelo slug
    const { data: empresa, error: empresaError } = await supabase
      .from('companies')
      .select('id, name, slug, vertical, plan, owner_email, ativo')
      .eq('slug', slug)
      .eq('ativo', true)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Busca customizações (landing_pages)
    const { data: customizacoes, error: customError } = await supabase
      .from('landing_pages')
      .select('cor_primaria, cor_secundaria, logo_url, descricao, botao_agendamento_ativo')
      .eq('tenant_id', empresa.id)
      .single();

    // Se não tem customizações, cria com valores padrão
    let customizacoesData = customizacoes || {
      cor_primaria: '#000000',
      cor_secundaria: '#FFFFFF',
      logo_url: null,
      descricao: null,
      botao_agendamento_ativo: true,
    };

    // Se não existe registro, cria um
    if (customError && customError.code === 'PGRST116') {
      const { data: novaCustomizacao } = await supabase
        .from('landing_pages')
        .insert({
          tenant_id: empresa.id,
          cor_primaria: '#000000',
          cor_secundaria: '#FFFFFF',
          botao_agendamento_ativo: true,
        })
        .select()
        .single();

      if (novaCustomizacao) {
        customizacoesData = novaCustomizacao;
      }
    }

    // Busca horários de funcionamento
    const { data: horarios } = await supabase
      .from('horario_funcionamento')
      .select('dia_semana, hora_abertura, hora_fechamento, ativo')
      .eq('tenant_id', empresa.id)
      .order('dia_semana', { ascending: true });

    // Busca profissionais ativos
    const { data: profissionais } = await supabase
      .from('profissionais')
      .select('id, nome, foto_url, ativo')
      .eq('tenant_id', empresa.id)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    // Busca serviços ativos
    const { data: servicos } = await supabase
      .from('servicos')
      .select('id, nome, descricao, duracao_minutos, preco, ativo')
      .eq('tenant_id', empresa.id)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    return NextResponse.json({
      sucesso: true,
      empresa: {
        id: empresa.id,
        name: empresa.name,
        slug: empresa.slug,
        vertical: empresa.vertical,
        plan: empresa.plan,
        owner_email: empresa.owner_email,
      },
      customizacoes: customizacoesData,
      horarios: horarios || [],
      profissionais: profissionais || [],
      servicos: servicos || [],
    });

  } catch (error: any) {
    console.error('Erro no GET /api/tenant/[slug]:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor', error: error.message },
      { status: 500 }
    );
  }
}

