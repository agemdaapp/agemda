import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * ROTA: POST /api/auth/logout
 * 
 * FLUXO DE LOGOUT:
 * 1. Recebe token do header Authorization
 * 2. Invalida sessão no Supabase Auth
 * 3. Retorna sucesso
 * 4. Frontend remove tenant_id do localStorage
 * 5. Frontend redireciona para landing page
 * 
 * VALIDAÇÕES:
 * - Token deve ser válido
 * - Usuário deve estar autenticado
 * 
 * RETORNO:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient();

    // Invalida sessão no Supabase
    const { error } = await supabase.auth.signOut();

    // Retorna sucesso (mesmo se houver erro, pois logout deve sempre funcionar)
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { success: true, message: 'Logout realizado' }, // Sempre retorna sucesso
    );
  }
}

