import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ROTA DE TESTE: GET /api/test
 * 
 * Testa a conexão com o Supabase
 * - Tenta conectar com o Supabase
 * - Busca dados da tabela companies
 * - Retorna sucesso ou erro
 * 
 * USO:
 * 1. Configure o .env.local com suas chaves
 * 2. Rode: npm run dev
 * 3. Acesse: http://localhost:3000/api/test
 * 4. Verifique a resposta JSON
 */
export async function GET() {
  try {
    // Cria cliente do Supabase (servidor)
    const supabase = createServerClient();

    // Tenta buscar dados da tabela companies
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Erro ao buscar dados:', error);
      return NextResponse.json(
        {
          sucesso: false,
          erro: error.message,
          codigo: error.code,
          detalhes: 'Verifique se a tabela "companies" existe no Supabase',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Conectado ao Supabase com sucesso!',
      dados: data || [],
      total: data?.length || 0,
    });

  } catch (error: any) {
    console.error('Erro na conexão:', error);
    
    // Verifica se é erro de variáveis de ambiente
    if (error.message?.includes('Missing Supabase')) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Variáveis de ambiente não configuradas',
          mensagem: 'Verifique se o arquivo .env.local está configurado corretamente',
          detalhes: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        sucesso: false,
        erro: error.message || 'Erro desconhecido',
        detalhes: 'Verifique os logs do servidor para mais informações',
      },
      { status: 500 }
    );
  }
}

