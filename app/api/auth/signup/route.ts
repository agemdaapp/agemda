import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { 
  isValidEmail, 
  isStrongPassword, 
  generateSlug, 
  isValidSlug,
  isValidVertical,
  isValidPlano 
} from '@/lib/validations';

/**
 * ROTA: POST /api/auth/signup
 * 
 * FLUXO DE SIGNUP:
 * 1. Recebe dados: { email, senha, nome_barbearia, vertical, plano }
 * 2. Valida email (formato e único)
 * 3. Valida senha (força)
 * 4. Gera slug a partir de nome_barbearia
 * 5. Valida slug único no banco
 * 6. Cria usuário no Supabase Auth
 * 7. Cria registro na tabela companies com slug
 * 8. Cria registro na tabela usuarios com tenant_id e role 'admin'
 * 9. Cria registro vazio na tabela landing_pages
 * 10. Retorna token e dados do tenant
 * 
 * VALIDAÇÕES:
 * - Email: formato válido + único no Supabase Auth
 * - Senha: mínimo 8 chars, letra + número
 * - Slug: gerado automaticamente, validado como único
 * - Vertical: deve ser 'barbearia' | 'unhas' | 'beleza'
 * - Plano: deve ser 'basico' | 'premium' | 'enterprise'
 * 
 * RETORNO:
 * {
 *   success: boolean,
 *   user_id: string,
 *   tenant_id: string,
 *   tenant_slug: string,
 *   token: string,
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, senha, nome_barbearia, vertical, plano } = body;

    // Validações de entrada
    if (!email || !senha || !nome_barbearia || !vertical || !plano) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(senha)) {
      return NextResponse.json(
        { success: false, message: 'Senha deve ter mínimo 8 caracteres, letra e número' },
        { status: 400 }
      );
    }

    if (!isValidVertical(vertical)) {
      return NextResponse.json(
        { success: false, message: 'Vertical inválida' },
        { status: 400 }
      );
    }

    if (!isValidPlano(plano)) {
      return NextResponse.json(
        { success: false, message: 'Plano inválido' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verifica se email já existe usando listUsers
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Gera slug e verifica se é único
    let slug = generateSlug(nome_barbearia);
    let slugExists = true;
    let attempts = 0;
    
    while (slugExists && attempts < 10) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existingCompany) {
        slugExists = false;
      } else {
        slug = `${generateSlug(nome_barbearia)}-${Date.now()}`;
        attempts++;
      }
    }

    if (slugExists) {
      return NextResponse.json(
        { success: false, message: 'Erro ao gerar slug único' },
        { status: 500 }
      );
    }

    // Cria usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Auto-confirma email
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { success: false, message: 'Erro ao criar usuário: ' + authError?.message },
        { status: 500 }
      );
    }

    const userId = authUser.user.id;

    // Cria registro na tabela companies
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        slug,
        name: nome_barbearia,
        subdomain: `${slug}.agemda.com.br`,
        vertical,
        plan: plano,
        owner_email: email,
        ativo: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (companyError || !company) {
      // Rollback: deleta usuário criado
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { success: false, message: 'Erro ao criar empresa: ' + companyError?.message },
        { status: 500 }
      );
    }

    const tenantId = company.id;

    // Cria registro na tabela usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        tenant_id: tenantId,
        role: 'admin',
        email,
        created_at: new Date().toISOString(),
      });

    if (userError) {
      // Rollback: deleta usuário e empresa
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('companies').delete().eq('id', tenantId);
      return NextResponse.json(
        { success: false, message: 'Erro ao criar usuário: ' + userError.message },
        { status: 500 }
      );
    }

    // Cria registro vazio na tabela landing_pages
    const { error: landingError } = await supabase
      .from('landing_pages')
      .insert({
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
      });

    if (landingError) {
      // Log do erro mas não falha o signup
      console.error('Erro ao criar landing page:', landingError);
    }

    // Gera token de sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      user_id: userId,
      tenant_id: tenantId,
      tenant_slug: slug,
      token: sessionData?.properties?.hashed_token || '',
      message: 'Cadastro realizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no signup:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

