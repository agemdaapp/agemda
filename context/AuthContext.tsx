'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@supabase/supabase-js';

/**
 * Context: AuthContext
 * 
 * FORNECE AUTENTICAÇÃO GLOBALMENTE:
 * - Envolve a aplicação com Provider
 * - Valida token ao montar
 * - Sincroniza com Supabase Auth
 * - Disponibiliza estado de auth em toda a app
 * 
 * ESTRUTURA:
 * - AuthContext: Contexto React
 * - AuthProvider: Componente que envolve a app
 * - useAuthContext: Hook para acessar auth
 * 
 * USO:
 * ```tsx
 * // No layout root:
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * 
 * // Em qualquer componente:
 * const { user, tenantId, isAuthenticated } = useAuthContext();
 * ```
 */

interface AuthContextType {
  user: User | null;
  tenantId: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signup: (data: {
    email: string;
    senha: string;
    nome_barbearia: string;
    vertical: string;
    plano: string;
  }) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

