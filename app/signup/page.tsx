'use client';

import { useState } from 'react';
import { Mail, Lock, Building2, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { ListaEmpresas } from '@/components/ListaEmpresas';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuthContext } from '@/context/AuthContext';

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  const { companies, loading: loadingCompanies } = useCompanies();
  const { login } = useAuthContext();

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
        // Redirecionar será feito pelo AuthContext
        window.location.href = '/dashboard';
      } else {
        setToast({ message: result.error || 'Erro ao fazer login', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao fazer login', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarEmpresa = (slug: string, url: string) => {
    // Redireciona para o subdomínio da empresa
    window.location.href = url + '/login';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showAuth={false} />
      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seção Esquerda - Login/Signup */}
            <div>
              <Card>
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      activeTab === 'login'
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                      activeTab === 'signup'
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Criar Conta
                    <Badge variant="warning" className="absolute -top-1 -right-1 text-xs">
                      Em breve
                    </Badge>
                  </button>
                </div>

                {/* Aba Login */}
                {activeTab === 'login' && (
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
                    <p className="text-center text-sm text-gray-600">
                      Não tem conta?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('signup')}
                        className="text-black font-medium hover:underline"
                      >
                        Crie uma
                      </button>
                    </p>
                  </form>
                )}

                {/* Aba Signup (Desabilitada) */}
                {activeTab === 'signup' && (
                  <div className="space-y-4 opacity-50">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-orange-800">
                        Esta funcionalidade estará disponível em breve.
                      </p>
                    </div>
                    <Input
                      label="Nome do negócio"
                      disabled
                      placeholder="Ex: Leticia Nails"
                    />
                    <Input
                      label="Email"
                      type="email"
                      disabled
                      placeholder="seu@email.com"
                    />
                    <Input
                      label="Senha"
                      type="password"
                      disabled
                      placeholder="••••••••"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2">Vertical</label>
                      <select
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      >
                        <option>Selecione...</option>
                        <option>Barbearia</option>
                        <option>Salão de Unhas</option>
                        <option>Beleza</option>
                      </select>
                    </div>
                    <Button size="lg" className="w-full" disabled>
                      Criar Conta
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Seção Direita - Lista de Empresas */}
            <div>
              <Card>
                <h2 className="text-2xl font-bold mb-2">Selecione sua empresa</h2>
                <p className="text-gray-600 mb-6">
                  Escolha uma das empresas cadastradas para acessar o dashboard
                </p>
                <ListaEmpresas
                  empresas={companies}
                  isLoading={loadingCompanies}
                  onSelecionar={handleSelecionarEmpresa}
                />
                <p className="text-sm text-gray-500 mt-6 text-center">
                  Clique no botão "Acessar" para entrar direto no subdomínio da empresa
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

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

