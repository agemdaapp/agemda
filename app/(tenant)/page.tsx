'use client';

import { Calendar, Clock, Sparkles, Users } from 'lucide-react';
import { HeaderPublica } from '@/components/whitelabel/HeaderPublica';
import { FooterPublica } from '@/components/whitelabel/FooterPublica';
import { BotaoPrimario } from '@/components/whitelabel/BotaoPrimario';
import { AgendamentoFormMultiStep } from '@/components/AgendamentoFormMultiStep';
import { useTenantContext } from '@/context/TenantContext';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

export default function TenantPublicPage() {
  const { empresa, customizacoes, profissionais, servicos, loading, getCorPrimaria, getDescricao } = useTenantContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderPublica />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </main>
        <FooterPublica />
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Empresa não encontrada</h1>
          <p className="text-gray-600">Esta empresa não está disponível.</p>
        </div>
      </div>
    );
  }

  const corPrimaria = getCorPrimaria();
  const descricao = getDescricao();
  const verticalLabel = empresa.vertical === 'unhas' ? 'manicure' : empresa.vertical === 'barbearia' ? 'corte' : 'serviço';

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPublica />

      <main>
        {/* Hero Section */}
        <section
          className="py-16 px-4 sm:px-6 lg:px-8"
          style={{
            background: `linear-gradient(135deg, ${corPrimaria}15 0%, ${corPrimaria}05 100%)`,
          }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: corPrimaria }}>
              Agende sua {verticalLabel}
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
              {descricao}
            </p>
            {customizacoes.botao_agendamento_ativo && (
              <div className="flex justify-center">
                <a href="#agendar">
                  <BotaoPrimario size="lg">
                    <Calendar className="w-5 h-5 mr-2 inline" />
                    Agendar agora
                  </BotaoPrimario>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Formulário de Agendamento */}
        <section id="agendar" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: corPrimaria }}>
                Faça seu agendamento
              </h2>
              <p className="text-gray-600">Preencha os dados abaixo para agendar</p>
            </div>
            <Card>
              <AgendamentoFormMultiStep />
            </Card>
          </div>
        </section>

        {/* Seção Profissionais */}
        {profissionais.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: corPrimaria }}>
                  Nossos Profissionais
                </h2>
                <p className="text-gray-600">Conheça nossa equipe</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {profissionais.map((prof) => (
                  <Card key={prof.id} className="text-center">
                    {prof.foto_url ? (
                      <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                        <Image
                          src={prof.foto_url}
                          alt={prof.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: corPrimaria }}
                      >
                        {prof.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-1">{prof.nome}</h3>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Seção Serviços */}
        {servicos.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: corPrimaria }}>
                  Nossos Serviços
                </h2>
                <p className="text-gray-600">Confira nossos serviços e preços</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicos.map((servico) => (
                  <Card key={servico.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{servico.nome}</h3>
                      <span className="font-bold" style={{ color: corPrimaria }}>
                        R$ {servico.preco.toFixed(2)}
                      </span>
                    </div>
                    {servico.descricao && (
                      <p className="text-sm text-gray-600 mb-3">{servico.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{servico.duracao_minutos} min</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <FooterPublica />
    </div>
  );
}

