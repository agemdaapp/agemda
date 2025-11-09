/**
 * Tipos relacionados a multi-tenancy
 */

/**
 * Slug do tenant (identificador único do subdomínio)
 * Exemplos: "leticianails", "local-test"
 */
export type TenantSlug = string;

/**
 * Status do tenant no sistema
 */
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * Contexto do tenant extraído do subdomínio
 */
export interface TenantContext {
  /** ID único do tenant no banco de dados */
  tenantId: string | null;
  /** Slug do tenant (subdomínio) */
  tenantSlug: TenantSlug | null;
  /** Se está na landing page principal */
  isLandingPage: boolean;
  /** Se é um ambiente de desenvolvimento/teste */
  isDevelopment: boolean;
  /** Domínio completo acessado */
  host: string;
  /** Subdomínio extraído */
  subdomain: string | null;
}

/**
 * Resposta da verificação de tenant no banco
 */
export interface TenantValidation {
  exists: boolean;
  tenantId?: string;
  status?: TenantStatus;
  slug?: TenantSlug;
}

