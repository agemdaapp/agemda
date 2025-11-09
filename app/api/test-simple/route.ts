import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * ROTA DE TESTE SIMPLES: GET /api/test-simple
 * 
 * Testa a conexão com o Supabase usando APENAS a ANON_KEY
 * (Não precisa da SERVICE_ROLE_KEY)
 * 
 * Use esta rota para testar se a conexão básica está funcionando
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Variáveis de ambiente não configuradas',
          mensagem: 'Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão no .env.local',
        },
        { status: 500 }
      );
    }

    // Cria cliente com anon key (para teste básico)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          detalhes: 'Verifique se a tabela "companies" existe no Supabase e se RLS está configurado',
          dica: 'Execute o SQL fornecido no SQL Editor do Supabase',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Conectado ao Supabase com sucesso! (usando ANON_KEY)',
      dados: data || [],
      total: data?.length || 0,
      aviso: 'Esta é uma conexão de teste. Para operações administrativas, você precisará da SERVICE_ROLE_KEY',
    });

  } catch (error: any) {
    console.error('Erro na conexão:', error);
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

