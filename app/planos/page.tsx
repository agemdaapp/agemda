import Link from 'next/link';
import { Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PlanosPage() {
  const planos = [
    {
      nome: 'Básico',
      preco: 'R$ 49',
      badge: 'Começar',
      badgeVariant: 'default' as const,
      destacado: false,
      itens: [
        'Agendamentos ilimitados',
        'Até 2 profissionais',
        'Relatórios básicos',
        'Agendamento por link',
      ],
    },
    {
      nome: 'Intermediário',
      preco: 'R$ 99',
      badge: 'Mais Popular',
      badgeVariant: 'success' as const,
      destacado: true,
      itens: [
        'Tudo do básico +',
        'Até 5 profissionais',
        'Relatórios avançados',
        'Landing page simples',
        'Domínio personalizado',
      ],
    },
    {
      nome: 'Premium',
      preco: 'R$ 199',
      badge: 'Exclusivo',
      badgeVariant: 'info' as const,
      destacado: false,
      itens: [
        'Tudo do intermediário +',
        'Profissionais ilimitados',
        'Landing customizável',
        'Domínio exclusivo',
        'Integração Stripe/Pix',
        'Suporte prioritário',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Escolha seu plano</h1>
            <p className="text-xl text-gray-600">
              Planos flexíveis para empresas de todos os tamanhos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planos.map((plano) => (
              <Card
                key={plano.nome}
                className={`relative ${plano.destacado ? 'ring-2 ring-black scale-105' : ''}`}
              >
                {plano.destacado && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant={plano.badgeVariant}>{plano.badge}</Badge>
                  </div>
                )}
                {!plano.destacado && (
                  <div className="mb-4">
                    <Badge variant={plano.badgeVariant}>{plano.badge}</Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plano.preco}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plano.itens.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plano.destacado ? 'primary' : 'outline'}
                  className="w-full"
                  size="lg"
                  href={`/signup?plano=${plano.nome.toLowerCase()}`}
                >
                  Escolher Plano
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

