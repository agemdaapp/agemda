/**
 * Utilitários de validação para autenticação e multi-tenancy
 */

/**
 * Valida formato de email
 * Regex: deve ter formato válido de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra
 * - Pelo menos um número
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Gera slug a partir de nome
 * Regras:
 * - Apenas letras, números e hífens
 * - Sem espaços
 * - Sem caracteres especiais
 * - Tudo em minúsculas
 * - Remove acentos
 * 
 * Exemplo: "Leticia Nails" → "leticia-nails"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
    .replace(/^-+|-+$/g, '') // Remove hífens no início/fim
    .substring(0, 50); // Limita tamanho
}

/**
 * Valida se slug é válido
 * Regras:
 * - Apenas letras minúsculas, números e hífens
 * - Sem espaços
 * - Mínimo 3 caracteres
 * - Máximo 50 caracteres
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]{3,50}$/;
  return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
}

/**
 * Valida vertical permitida
 */
export type Vertical = 'barbearia' | 'unhas' | 'beleza';

export function isValidVertical(vertical: string): vertical is Vertical {
  return ['barbearia', 'unhas', 'beleza'].includes(vertical);
}

/**
 * Valida plano permitido
 */
export type Plano = 'basico' | 'premium' | 'enterprise';

export function isValidPlano(plano: string): plano is Plano {
  return ['basico', 'premium', 'enterprise'].includes(plano);
}

