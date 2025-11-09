import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ROTA: GET /api/companies
 * 
 * Lista todas as empresas cadastradas no banco de dados
 * 
 * RETORNO:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string,
 *       name: string,
 *       slug: string,
 *       subdomain: string,
 *       plan: string,
 *       owner_email: string,
 *       vertical: string,
 *       ativo: boolean,
 *       created_at: string
 *     }
 *   ],
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Busca todas as empresas
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, subdomain, plan, owner_email, vertical, ativo, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar empresas:', error);
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar empresas', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: companies || [],
      total: companies?.length || 0,
    });

  } catch (error: any) {
    console.error('Erro no GET /api/companies:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor', error: error.message },
      { status: 500 }
    );
  }
}

