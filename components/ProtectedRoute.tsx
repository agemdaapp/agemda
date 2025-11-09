'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Componente: ProtectedRoute
 * 
 * PROTEGE ROTAS PRIVADAS:
 * - Verifica se usuário está autenticado
 * - Se não autenticado: redireciona para /login
 * - Se autenticado: renderiza children
 * - Passa tenant_id como prop para children
 * 
 * VALIDAÇÕES:
 * - isAuthenticated deve ser true
 * - tenantId deve existir
 * - Se não atender: redireciona para login
 * 
 * USO:
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard tenantId={tenantId} />
 * </ProtectedRoute>
 * ```
 * 
 * OU:
 * ```tsx
 * <ProtectedRoute>
 *   {(tenantId) => <Dashboard tenantId={tenantId} />}
 * </ProtectedRoute>
 * ```
 */

interface ProtectedRouteProps {
  children: React.ReactNode | ((tenantId: string) => React.ReactNode);
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, tenantId, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !tenantId)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, tenantId, isLoading, router, redirectTo]);

  // Mostra loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não autenticado, não renderiza (já redirecionou)
  if (!isAuthenticated || !tenantId) {
    return null;
  }

  // Renderiza children com tenantId
  if (typeof children === 'function') {
    return <>{children(tenantId)}</>;
  }

  return <>{children}</>;
}

