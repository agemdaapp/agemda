import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TenantSlug } from './types/tenant';
import { createServerClient } from './lib/supabase';

/**
 * PROXY (Next.js 16+)
 * 
 * Agora usamos rotas com slug em vez de subdomínios:
 * - agemda.vercel.app/leticianails → página pública
 * - agemda.vercel.app/leticianails/admin → painel admin
 * 
 * O proxy não precisa mais detectar subdomínios.
 * A validação do tenant é feita no layout da rota [slug].
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
 * Proxy principal (Next.js 16+)
 */
export async function proxy(request: NextRequest) {
  // Proxy simplificado - não precisa mais detectar subdomínios
  // A validação do tenant é feita no layout da rota [slug]
  return NextResponse.next();
}

/**
 * Configuração do matcher do proxy
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


