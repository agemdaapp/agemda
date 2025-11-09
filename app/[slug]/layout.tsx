import { notFound } from 'next/navigation';
import { TenantProvider } from '@/context/TenantContext';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface TenantData {
  empresa: any;
  customizacoes: any;
  horarios: any[];
  profissionais: any[];
  servicos: any[];
}

async function getTenantData(slug: string): Promise<TenantData | null> {
  try {
    const supabase = createServerClient();

    // Busca empresa pelo slug
    const { data: empresa, error: empresaError } = await supabase
      .from('companies')
      .select('id, name, slug, vertical, plan, owner_email, ativo')
      .eq('slug', slug)
      .eq('ativo', true)
      .single();

    if (empresaError) {
      console.error('Erro ao buscar empresa:', empresaError);
      return null;
    }

    if (!empresa) {
      console.log('Empresa não encontrada para slug:', slug);
      return null;
    }

    // Busca customizações
    const { data: customizacoes } = await supabase
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
    if (!customizacoes) {
      await supabase
        .from('landing_pages')
        .insert({
          tenant_id: empresa.id,
          cor_primaria: '#000000',
          cor_secundaria: '#FFFFFF',
          botao_agendamento_ativo: true,
        });
    }

    // Busca horários
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

    return {
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
    };
  } catch (error) {
    console.error('Erro ao buscar dados do tenant:', error);
    return null;
  }
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;

    // Busca dados do tenant
    const tenantData = await getTenantData(slug);

    if (!tenantData || !tenantData.empresa) {
      console.log('Tenant não encontrado ou timeout, retornando 404 para slug:', slug);
      notFound();
    }

    return (
      <TenantProvider initialData={tenantData}>
        {children}
      </TenantProvider>
    );
  } catch (error) {
    console.error('Erro no SlugLayout:', error);
    notFound();
  }
}

