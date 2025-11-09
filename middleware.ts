import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TenantSlug } from './types/tenant';
import { createServerClient } from './lib/supabase';

/**
 * MIDDLEWARE DE MULTI-TENANCY
 * 
 * Fluxo de detecção de subdomínios:
 * 
 * 1. Extrai o host da requisição (req.headers.get('host'))
 * 2. Analisa o host para determinar o tipo de acesso:
 *    - Landing page: agemda.com.br, www.agemda.com.br, agemda.vercel.app
 *    - Tenant: {slug}.agemda.com.br (quando configurado)
 *    - Localhost: localhost (apenas para desenvolvimento, sempre landing page)
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
const MAIN_DOMAINS = [
  'agemda.com.br', 
  'www.agemda.com.br',
  'agemda.vercel.app', // Domínio temporário da Vercel
];

/**
 * Extrai o subdomínio do host
 * Exemplos:
 * - "leticianails.agemda.com.br" → "leticianails"
 * - "leticianails.agemda.vercel.app" → "leticianails"
 * - "localhost:3000/app" → null (landing)
 */
function extractSubdomain(host: string): string | null {
  // Remove porta se existir
  const hostWithoutPort = host.split(':')[0];
  
  // Caso especial: localhost (apenas para desenvolvimento)
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
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
      // Exemplo: ["leticianails", "agemda", "vercel", "app"] → "leticianails"
      const subdomain = parts[0];
      
      // Bloqueia subdomínios reservados
      const reserved = ['api', 'www', 'admin', 'app'];
      if (reserved.includes(subdomain.toLowerCase())) {
        return null;
      }
      
      return subdomain;
    }
  }
  
  return null;
}

/**
 * Determina se é landing page baseado no host
 */
function isLandingPage(host: string, pathname: string): boolean {
  const hostWithoutPort = host.split(':')[0];
  
  // localhost é sempre landing page (desenvolvimento)
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return true;
  }
  
  // Domínios principais são landing page
  for (const domain of MAIN_DOMAINS) {
    if (hostWithoutPort === domain) {
      // É exatamente o domínio principal → landing page
      return true;
    }
    if (hostWithoutPort.endsWith(`.${domain}`)) {
      // Tem subdomínio → não é landing page
      const subdomain = extractSubdomain(host);
      return subdomain === null;
    }
  }
  
  return false;
}

/**
 * Verifica se o tenant existe no banco de dados
 * Consulta a tabela companies no Supabase
 */
async function validateTenant(slug: TenantSlug): Promise<{ exists: boolean; tenantId?: string }> {
  if (!slug || slug.trim() === '') {
    return { exists: false };
  }

  try {
    const supabase = createServerClient();
    
    // Busca empresa pelo slug
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, ativo')
      .eq('slug', slug)
      .eq('ativo', true)
      .single();

    if (error || !company) {
      return { exists: false };
    }

    return {
      exists: true,
      tenantId: company.id,
    };
  } catch (error) {
    console.error('Erro ao validar tenant:', error);
    return { exists: false };
  }
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
  
  // Caso especial: localhost:3000/app → simular tenant de teste
  if (hostWithoutPort === 'localhost' && pathname.startsWith('/app')) {
    const response = NextResponse.next();
    response.headers.set('x-is-landing-page', 'false');
    response.headers.set('x-tenant-id', 'test-tenant-id');
    response.headers.set('x-tenant-slug', 'test');
    return response;
  }

  // Verifica se é landing page PRIMEIRO
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
    // Sem subdomínio válido mas não é landing page → pode ser erro
    // Deixa passar e deixa o Next.js lidar com 404
    const response = NextResponse.next();
    response.headers.set('x-is-landing-page', 'true');
    response.headers.set('x-tenant-id', '');
    response.headers.set('x-tenant-slug', '');
    return response;
  }
  
  // Valida se o tenant existe no banco
  const validation = await validateTenant(subdomain);
  
  if (!validation.exists) {
    // Tenant não existe → retorna 404
    return new NextResponse('Tenant not found', { status: 404 });
  }
  
  // Tenant válido → redireciona para a rota [tenant] se necessário
  // Se já está na rota [tenant], apenas adiciona headers
  if (pathname === '/' || pathname === '') {
    // Redireciona para /[tenant] onde [tenant] é o slug
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    const response = NextResponse.redirect(url);
    response.headers.set('x-tenant-id', validation.tenantId || '');
    response.headers.set('x-tenant-slug', subdomain);
    response.headers.set('x-is-landing-page', 'false');
    return response;
  }
  
  // Se já está em uma rota de tenant, apenas adiciona headers
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


