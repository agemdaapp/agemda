import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TenantSlug } from './types/tenant';

/**
 * MIDDLEWARE DE MULTI-TENANCY
 * 
 * Fluxo de detecção de subdomínios:
 * 
 * 1. Extrai o host da requisição (req.headers.get('host'))
 * 2. Analisa o host para determinar o tipo de acesso:
 *    - Landing page: agemda.com.br, www.agemda.com.br
 *    - Tenant: {slug}.agemda.com.br
 *    - Localhost: localhost:3000 (landing) ou localhost:3000/app/* (tenant local-test)
 * 
 * 3. Casos especiais tratados:
 *    - /api/* → Sempre permite (não intercepta)
 *    - /_next/* → Sempre permite (assets do Next.js)
 *    - /favicon.ico, /robots.txt → Sempre permite
 * 
 * 4. Validação de tenant:
 *    - Se for subdomínio de tenant, verifica se existe no banco
 *    - Se não existir, retorna 404
 *    - Se existir, adiciona header x-tenant-id e x-tenant-slug
 * 
 * 5. Headers customizados adicionados:
 *    - x-tenant-id: ID do tenant no banco
 *    - x-tenant-slug: Slug do tenant (subdomínio)
 *    - x-is-landing-page: "true" ou "false"
 */

/**
 * Domínios principais da aplicação
 */
const MAIN_DOMAINS = ['agemda.com.br', 'www.agemda.com.br'];
const LOCALHOST = 'localhost:3000';

/**
 * Extrai o subdomínio do host
 * Exemplo: "leticianails.agemda.com.br" → "leticianails"
 */
function extractSubdomain(host: string): string | null {
  // Remove porta se existir
  const hostWithoutPort = host.split(':')[0];
  
  // Caso especial: localhost
  if (hostWithoutPort === 'localhost') {
    return null;
  }
  
  // Remove www. se existir
  const hostClean = hostWithoutPort.replace(/^www\./, '');
  
  // Verifica se é um dos domínios principais
  if (MAIN_DOMAINS.some(domain => hostClean === domain || hostClean.endsWith(`.${domain}`))) {
    // Se termina com o domínio principal, extrai o subdomínio
    const parts = hostClean.split('.');
    if (parts.length > 2) {
      // Exemplo: ["leticianails", "agemda", "com", "br"] → "leticianails"
      return parts[0];
    }
  }
  
  return null;
}

/**
 * Determina se é landing page baseado no host
 */
function isLandingPage(host: string, pathname: string): boolean {
  const hostWithoutPort = host.split(':')[0];
  
  // localhost sem /app/* é landing page
  if (hostWithoutPort === 'localhost' && !pathname.startsWith('/app')) {
    return true;
  }
  
  // Domínios principais são landing page
  if (MAIN_DOMAINS.some(domain => hostWithoutPort === domain || hostWithoutPort.endsWith(`.${domain}`))) {
    const subdomain = extractSubdomain(host);
    return subdomain === null;
  }
  
  return false;
}

/**
 * Verifica se o tenant existe no banco de dados
 * TODO: Implementar consulta ao Supabase
 * Por enquanto, retorna true para qualquer slug válido
 */
async function validateTenant(slug: TenantSlug): Promise<{ exists: boolean; tenantId?: string }> {
  // TODO: Consultar Supabase para verificar se tenant existe
  // const supabase = createServerClient();
  // const { data, error } = await supabase
  //   .from('tenants')
  //   .select('id, status')
  //   .eq('slug', slug)
  //   .single();
  
  // Por enquanto, aceita qualquer slug que não seja vazio
  if (!slug || slug.trim() === '') {
    return { exists: false };
  }
  
  // Em produção, aqui faria a consulta real
  return {
    exists: true,
    tenantId: `temp-${slug}`, // Placeholder
  };
}

/**
 * Middleware principal
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  
  // Permite sempre: API routes, assets do Next.js, arquivos estáticos
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }
  
  const hostWithoutPort = host.split(':')[0];
  const isLocalhost = hostWithoutPort === 'localhost';
  
  // Caso especial: localhost:3000/app/* → tenant "local-test"
  if (isLocalhost && pathname.startsWith('/app')) {
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', 'local-test-id');
    response.headers.set('x-tenant-slug', 'local-test');
    response.headers.set('x-is-landing-page', 'false');
    return response;
  }
  
  // Verifica se é landing page
  if (isLandingPage(host, pathname)) {
    const response = NextResponse.next();
    response.headers.set('x-is-landing-page', 'true');
    response.headers.set('x-tenant-id', '');
    response.headers.set('x-tenant-slug', '');
    return response;
  }
  
  // Extrai subdomínio (tenant slug)
  const subdomain = extractSubdomain(host);
  
  if (!subdomain) {
    // Sem subdomínio válido → redireciona para landing page
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  // Valida se o tenant existe no banco
  const validation = await validateTenant(subdomain);
  
  if (!validation.exists) {
    // Tenant não existe → retorna 404
    return new NextResponse('Tenant not found', { status: 404 });
  }
  
  // Tenant válido → adiciona headers e continua
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', validation.tenantId || '');
  response.headers.set('x-tenant-slug', subdomain);
  response.headers.set('x-is-landing-page', 'false');
  
  return response;
}

/**
 * Configuração do matcher do middleware
 * Aplica a todas as rotas exceto as já filtradas no código
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

