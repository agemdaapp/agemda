import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { isValidEmail } from '@/lib/validations';

/**
 * ROTA: POST /api/auth/login
 * 
 * FLUXO DE LOGIN:
 * 1. Recebe: { email, password }
 * 2. Valida email (formato)
 * 3. Autentica com Supabase Auth
 * 4. Busca tenant_id do usuário na tabela usuarios
 * 5. Busca tenant_slug na tabela companies
 * 6. Retorna token, user_id, tenant_id, tenant_slug
 * 7. Frontend armazena tenant_id no localStorage
 * 8. Frontend redireciona para /dashboard
 * 
 * VALIDAÇÕES:
 * - Email: formato válido
 * - Password: não vazio
 * - Usuário deve existir no Supabase Auth
 * - Usuário deve ter registro na tabela usuarios
 * - Tenant deve estar ativo
 * 
 * RETORNO:
 * {
 *   success: boolean,
 *   user_id: string,
 *   tenant_id: string,
 *   tenant_slug: string,
 *   token: string (session token)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Autentica com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, message: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const sessionToken = authData.session?.access_token || '';

    // Busca tenant_id do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tenant_id')
      .eq('id', userId)
      .single();

    if (userError || !usuario) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado no sistema' },
        { status: 404 }
      );
    }

    const tenantId = usuario.tenant_id;

    // Busca tenant_slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('slug')
      .eq('id', tenantId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, message: 'Tenant não encontrado' },
        { status: 404 }
      );
    }

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      user_id: userId,
      tenant_id: tenantId,
      tenant_slug: company.slug,
      token: sessionToken,
      message: 'Login realizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

