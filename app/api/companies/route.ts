import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ROTA: GET /api/companies
 * 
 * Lista todas as empresas cadastradas no banco de dados
 * 
 * RETORNO:
 * {
 *   sucesso: true,
 *   empresas: [
 *     {
 *       id: string,
 *       name: string,
 *       slug: string,
 *       subdomain: string,
 *       plan: string,
 *       owner_email: string,
 *       vertical: string,
 *       subdomain_url: string
 *     }
 *   ],
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Busca todas as empresas ativas
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, subdomain, plan, owner_email, vertical')
      .eq('ativo', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao buscar empresas', error: error.message },
        { status: 500 }
      );
    }

    // Formata resposta com URL do subdomínio
    const empresasFormatadas = (companies || []).map(empresa => ({
      id: empresa.id,
      name: empresa.name,
      slug: empresa.slug,
      vertical: empresa.vertical,
      plan: empresa.plan,
      subdomain_url: `https://${empresa.slug}.agemda.vercel.app`,
    }));

    return NextResponse.json({
      sucesso: true,
      empresas: empresasFormatadas,
      total: empresasFormatadas.length,
    });

  } catch (error: any) {
    console.error('Erro no GET /api/companies:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor', error: error.message },
      { status: 500 }
    );
  }
}

