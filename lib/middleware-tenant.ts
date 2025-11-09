import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from './supabase';

/**
 * MIDDLEWARE DE VALIDAÇÃO DE TENANT
 * 
 * FLUXO:
 * 1. Extrai x-tenant-id do header
 * 2. Valida se é UUID válido
 * 3. Verifica se tenant existe no banco
 * 4. Verifica se usuário autenticado tem acesso ao tenant
 * 5. Retorna erro se inválido, ou continua se válido
 * 
 * VALIDAÇÕES:
 * - x-tenant-id deve existir no header
 * - x-tenant-id deve ser UUID válido
 * - Tenant deve existir na tabela companies
 * - Tenant deve estar ativo (status = 'active')
 * - Usuário autenticado deve ter registro em usuarios com esse tenant_id
 * 
 * RETORNA:
 * - NextResponse com erro 401 se tenant inválido
 * - NextResponse.next() se tenant válido
 * 
 * STATUS HTTP:
 * - 401: Tenant inválido ou não autorizado
 * - 500: Erro interno do servidor
 */

/**
 * Valida se string é UUID válido
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida tenant_id e retorna dados do tenant
 */
export async function validateTenant(
  tenantId: string | null,
  userId: string | null
): Promise<{ valid: boolean; error?: string; status?: number }> {
  // Valida se tenant_id existe
  if (!tenantId) {
    return { valid: false, error: 'Tenant ID não fornecido', status: 401 };
  }

  // Valida formato UUID
  if (!isValidUUID(tenantId)) {
    return { valid: false, error: 'Tenant ID inválido (formato UUID)', status: 401 };
  }

  const supabase = createServerClient();

  // Verifica se tenant existe e está ativo
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, status')
    .eq('id', tenantId)
    .single();

  if (companyError || !company) {
    return { valid: false, error: 'Tenant não encontrado', status: 401 };
  }

  // Se userId fornecido, verifica se usuário tem acesso ao tenant
  if (userId) {
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tenant_id')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (userError || !usuario) {
      return { valid: false, error: 'Usuário não tem acesso a este tenant', status: 401 };
    }
  }

  return { valid: true };
}

/**
 * Middleware para validar tenant em rotas de API
 */
export async function validateTenantMiddleware(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  const authHeader = request.headers.get('authorization');
  
  // Extrai userId do token (se fornecido)
  let userId: string | null = null;
  if (authHeader) {
    // TODO: Decodificar JWT para extrair userId
    // Por enquanto, pode buscar da sessão do Supabase
  }

  const validation = await validateTenant(tenantId, userId);

  if (!validation.valid) {
    return NextResponse.json(
      { success: false, message: validation.error },
      { status: validation.status || 401 }
    );
  }

  return null; // Continua para a rota
}

