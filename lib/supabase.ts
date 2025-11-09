import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cliente do Supabase para o servidor (usa service role key)
 * Use este cliente em Server Components, API Routes e Server Actions
 * ATENÇÃO: Este cliente tem privilégios administrativos, use com cuidado!
 */
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for server client');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Cliente do Supabase para o frontend (usa anon key)
 * Use este cliente em Client Components
 * Para usar em componentes, crie uma instância com useMemo:
 * 
 * const supabase = useMemo(() => createBrowserClient(), []);
 */
export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient can only be used in client components');
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables for client');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

