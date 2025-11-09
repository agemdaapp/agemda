import Link from 'next/link';
import { Calendar, Users, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-black text-white py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Agendamentos Inteligentes para Seu Negócio
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Barbearias, salões de unhas, beleza e muito mais
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="primary" className="bg-white text-black hover:bg-gray-100" href="/signup">
                    Comece Teste Grátis
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" href="/planos">
                    Ver Planos
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <Calendar className="w-32 h-32 mx-auto text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que escolher o agemda?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Agendamentos 24/7</h3>
                <p className="text-gray-600">
                  Seus clientes podem agendar a qualquer hora, de qualquer lugar.
                </p>
              </Card>

              <Card className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Múltiplos Profissionais</h3>
                <p className="text-gray-600">
                  Gerencie vários profissionais e seus horários em um só lugar.
                </p>
              </Card>

              <Card className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Confirmação Automática</h3>
                <p className="text-gray-600">
                  Enviamos confirmações automáticas por email e WhatsApp.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para crescer seu negócio?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Comece hoje mesmo e veja a diferença no seu atendimento.
            </p>
            <Button size="lg" variant="primary" className="bg-white text-black hover:bg-gray-100" href="/signup">
              Criar Conta Gratuita
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
