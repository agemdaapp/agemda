'use client';

import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useAuthContext } from '@/context/AuthContext';
import { useTenant } from '@/hooks/useTenant';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  const { login } = useAuthContext();
  const { tenantSlug } = useTenant();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setToast({ message: 'Preencha email e senha', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        setToast({ message: 'Login realizado com sucesso!', type: 'success' });
        // Redireciona para o dashboard do tenant
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setToast({ message: result.error || 'Erro ao fazer login', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao fazer login', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Entrar em sua conta</h1>
          {tenantSlug && (
            <p className="text-gray-600">
              Acessando: <span className="font-semibold">{tenantSlug}</span>
            </p>
          )}
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              icon={<Mail className="w-5 h-5" />}
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              icon={<Lock className="w-5 h-5" />}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Manter conectado</span>
              </label>
              <a href="#" className="text-sm text-gray-600 hover:text-black">
                Esqueceu a senha?
              </a>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <a href="https://agemda.vercel.app/signup" className="text-sm text-gray-600 hover:text-black">
            Voltar para página inicial
          </a>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

