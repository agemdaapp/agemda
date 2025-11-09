'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Hook: useAuth
 * 
 * GERENCIA ESTADO DE AUTENTICAÇÃO:
 * - Sincroniza com Supabase Auth
 * - Persiste tenant_id no localStorage
 * - Fornece funções: login, signup, logout
 * - Valida token ao montar componente
 * - Atualiza estado quando sessão muda
 * 
 * RETORNA:
 * {
 *   user: User | null,
 *   tenantId: string | null,
 *   tenantSlug: string | null,
 *   isAuthenticated: boolean,
 *   isLoading: boolean,
 *   login: (email, password) => Promise<{success, error}>,
 *   signup: (data) => Promise<{success, error}>,
 *   logout: () => Promise<void>,
 * }
 * 
 * FLUXO:
 * 1. Ao montar: verifica sessão ativa no Supabase
 * 2. Se houver sessão: busca tenant_id do localStorage ou da API
 * 3. Sincroniza estado com Supabase Auth (onAuthStateChange)
 * 4. Fornece funções para login/signup/logout
 * 5. Atualiza localStorage quando tenant_id muda
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null as any; // Não executa no SSR
    }
    return createBrowserClient();
  }, []);

  // Carrega tenant_id do localStorage
  const loadTenantFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tenant_id');
      const storedSlug = localStorage.getItem('tenant_slug');
      if (stored) setTenantId(stored);
      if (storedSlug) setTenantSlug(storedSlug);
    }
  }, []);

  // Salva tenant_id no localStorage
  const saveTenantToStorage = useCallback((id: string | null, slug: string | null) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('tenant_id', id);
      } else {
        localStorage.removeItem('tenant_id');
      }
      if (slug) {
        localStorage.setItem('tenant_slug', slug);
      } else {
        localStorage.removeItem('tenant_slug');
      }
    }
  }, []);

  // Busca tenant da URL (rota [slug]) se disponível
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Extrai slug da URL (ex: /leticianails → leticianails)
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Se a primeira parte da URL não é uma rota conhecida, pode ser um slug
    const knownRoutes = ['signup', 'login', 'planos', 'dashboard', 'api', 'admin'];
    if (pathParts.length > 0 && !knownRoutes.includes(pathParts[0])) {
      const slug = pathParts[0];
      
      // Busca tenant_id da API usando o slug
      fetch(`/api/tenant/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.sucesso && data.empresa) {
            setTenantId(data.empresa.id);
            setTenantSlug(data.empresa.slug);
            saveTenantToStorage(data.empresa.id, data.empresa.slug);
          }
        })
        .catch(console.error);
    }
  }, [saveTenantToStorage]);

  // Verifica sessão ao montar
  useEffect(() => {
    if (!supabase) return;
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          loadTenantFromStorage();
          
          // Se não tem tenant_id no storage, busca da API
          if (!tenantId) {
            // TODO: Buscar tenant_id da API usando user.id
          }
        } else {
          setUser(null);
          setTenantId(null);
          setTenantSlug(null);
          saveTenantToStorage(null, null);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Escuta mudanças de autenticação
    if (!supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session?.user) {
          setUser(session.user);
          loadTenantFromStorage();
        } else {
          setUser(null);
          setTenantId(null);
          setTenantSlug(null);
          saveTenantToStorage(null, null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadTenantFromStorage, saveTenantToStorage, tenantId]);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Cliente não inicializado' };
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Autentica no Supabase com o token
        const { error: authError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: '',
        });

        if (authError) throw authError;

        // Salva tenant_id
        setTenantId(data.tenant_id);
        setTenantSlug(data.tenant_slug);
        saveTenantToStorage(data.tenant_id, data.tenant_slug);

        return { success: true, error: null };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  }, [supabase, saveTenantToStorage]);

  // Função de signup
  const signup = useCallback(async (signupData: {
    email: string;
    senha: string;
    nome_barbearia: string;
    vertical: string;
    plano: string;
  }) => {
    if (!supabase) {
      return { success: false, error: 'Cliente não inicializado' };
    }
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (data.success) {
        // Autentica no Supabase
        const { error: authError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: '',
        });

        if (authError) throw authError;

        // Salva tenant_id
        setTenantId(data.tenant_id);
        setTenantSlug(data.tenant_slug);
        saveTenantToStorage(data.tenant_id, data.tenant_slug);

        return { success: true, error: null };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao cadastrar' };
    }
  }, [supabase, saveTenantToStorage]);

  // Função de logout
  const logout = useCallback(async () => {
    if (!supabase) return;
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      await supabase.auth.signOut();
      
      setUser(null);
      setTenantId(null);
      setTenantSlug(null);
      saveTenantToStorage(null, null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [supabase, saveTenantToStorage]);

  return {
    user,
    tenantId,
    tenantSlug,
    isAuthenticated: !!user && !!tenantId,
    isLoading,
    login,
    signup,
    logout,
  };
}

