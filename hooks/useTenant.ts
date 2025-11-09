'use client';

import { useEffect, useState } from 'react';
import { TenantContext, TenantSlug } from '@/types/tenant';

/**
 * Hook customizado para acessar informações do tenant
 * 
 * Funcionalidades:
 * 1. Detecta o tenant_id do header x-tenant-id (setado pelo middleware)
 * 2. Detecta o tenant_slug do header x-tenant-slug
 * 3. Detecta se está na landing page via x-is-landing-page
 * 4. Armazena no localStorage para persistência
 * 5. Retorna objeto TenantContext com todas as informações
 * 
 * Uso:
 * ```tsx
 * const { tenantId, tenantSlug, isLandingPage } = useTenant();
 * ```
 */

/**
 * Lê os headers do middleware (disponíveis apenas no servidor)
 * No cliente, tenta ler do localStorage ou do window.location
 */
function getTenantFromHeaders(): Partial<TenantContext> {
  // No cliente, não temos acesso direto aos headers do middleware
  // Vamos usar localStorage ou window.location
  if (typeof window === 'undefined') {
    return {};
  }
  
  // Tenta ler do localStorage primeiro
  const stored = localStorage.getItem('tenant-context');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Ignora erro de parsing
    }
  }
  
  // Fallback: tenta extrair do hostname
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost';
  const pathname = window.location.pathname;
  
  // Caso especial: localhost:3000/app/* → tenant local-test
  if (isLocalhost && pathname.startsWith('/app')) {
    return {
      tenantId: 'local-test-id',
      tenantSlug: 'local-test',
      isLandingPage: false,
      isDevelopment: true,
    };
  }
  
  // Tenta extrair subdomínio
  const parts = hostname.split('.');
  if (parts.length > 2 && !isLocalhost) {
    const subdomain = parts[0];
    if (subdomain !== 'www') {
      return {
        tenantSlug: subdomain,
        isLandingPage: false,
        isDevelopment: false,
      };
    }
  }
  
  // Default: landing page
  return {
    tenantId: null,
    tenantSlug: null,
    isLandingPage: true,
    isDevelopment: isLocalhost,
  };
}

/**
 * Hook principal
 */
export function useTenant(): TenantContext {
  const [context, setContext] = useState<TenantContext>(() => {
    const initial = getTenantFromHeaders();
    return {
      tenantId: initial.tenantId || null,
      tenantSlug: initial.tenantSlug || null,
      isLandingPage: initial.isLandingPage ?? true,
      isDevelopment: initial.isDevelopment ?? false,
      host: typeof window !== 'undefined' ? window.location.host : '',
      subdomain: initial.tenantSlug || null,
    };
  });
  
  useEffect(() => {
    // Atualiza o contexto quando a rota muda
    const updateContext = () => {
      const newContext = getTenantFromHeaders();
      const fullContext: TenantContext = {
        tenantId: newContext.tenantId || null,
        tenantSlug: newContext.tenantSlug || null,
        isLandingPage: newContext.isLandingPage ?? true,
        isDevelopment: newContext.isDevelopment ?? false,
        host: window.location.host,
        subdomain: newContext.tenantSlug || null,
      };
      
      // Salva no localStorage
      localStorage.setItem('tenant-context', JSON.stringify(fullContext));
      setContext(fullContext);
    };
    
    updateContext();
    
    // Escuta mudanças de rota (Next.js)
    window.addEventListener('popstate', updateContext);
    
    return () => {
      window.removeEventListener('popstate', updateContext);
    };
  }, []);
  
  return context;
}

/**
 * Hook auxiliar para verificar se está em um tenant específico
 */
export function useIsTenant(slug: TenantSlug): boolean {
  const { tenantSlug } = useTenant();
  return tenantSlug === slug;
}

/**
 * Hook auxiliar para verificar se está na landing page
 */
export function useIsLandingPage(): boolean {
  const { isLandingPage } = useTenant();
  return isLandingPage;
}

