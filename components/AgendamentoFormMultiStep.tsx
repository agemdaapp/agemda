'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, DollarSign, User, Calendar, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTenant } from '@/hooks/useTenant';
import { useServicos } from '@/hooks/useServicos';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';
import { useAgendamento } from '@/hooks/useAgendamento';

interface AgendamentoFormData {
  servico: string | null;
  profissional: string | null;
  data: string | null;
  hora: string | null;
  nome: string;
  telefone: string;
  email: string;
  receberWhatsApp: boolean;
}

export function AgendamentoFormMultiStep() {
  const { tenantId } = useTenant();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AgendamentoFormData>({
    servico: null,
    profissional: null,
    data: null,
    hora: null,
    nome: '',
    telefone: '',
    email: '',
    receberWhatsApp: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Hooks para buscar dados
  const { servicos, loading: loadingServicos } = useServicos(tenantId);
  const { profissionais, loading: loadingProfissionais } = useProfissionais(tenantId, formData.servico);
  const { horarios, loading: loadingHorarios } = useHorariosDisponiveis(
    tenantId,
    formData.profissional,
    formData.data,
    formData.servico
  );
  const { criarAgendamento, loading: loadingAgendamento, error: errorAgendamento } = useAgendamento(tenantId);

  const servicoSelecionado = servicos.find(s => s.id === formData.servico);
  const profissionalSelecionado = profissionais.find(p => p.id === formData.profissional);

  // Mostra erro se não tiver tenantId
  useEffect(() => {
    if (!tenantId && step === 1) {
      setToast({ message: 'Erro: Tenant não identificado. Verifique a URL.', type: 'error' });
    }
  }, [tenantId, step]);

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !formData.servico) {
      newErrors.servico = 'Selecione um serviço';
    }
    if (step === 2 && !formData.profissional) {
      newErrors.profissional = 'Selecione um profissional';
    }
    if (step === 3) {
      if (!formData.data) newErrors.data = 'Selecione uma data';
      if (!formData.hora) newErrors.hora = 'Selecione um horário';
    }
    if (step === 4) {
      if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      if (formData.telefone && formData.telefone.replace(/\D/g, '').length < 10) {
        newErrors.telefone = 'Telefone inválido';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, part1, part2) => {
        if (part2) return `(${ddd}) ${part1}-${part2}`;
        if (part1) return `(${ddd}) ${part1}`;
        if (ddd) return `(${ddd}`;
        return numbers;
      });
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleSubmit = async () => {
    if (!validateStep() || !tenantId) return;

    if (!formData.servico || !formData.profissional || !formData.data || !formData.hora) {
      setToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    // Combina data e hora em ISO 8601
    const dataHoraISO = `${formData.data}T${formData.hora}:00`;

    try {
      const resultado = await criarAgendamento({
        cliente_nome: formData.nome,
        cliente_email: formData.email || undefined,
        cliente_telefone: formData.telefone.replace(/\D/g, ''),
        profissional_id: formData.profissional,
        servico_id: formData.servico,
        data_hora: dataHoraISO,
      });

      if (resultado.sucesso) {
        setStep(5);
        setToast({ message: 'Agendamento confirmado com sucesso!', type: 'success' });
      } else {
        setToast({ message: resultado.mensagem || 'Erro ao criar agendamento', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao criar agendamento', type: 'error' });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const diaSemana = diasSemana[date.getDay()];
      const dia = date.getDate();
      const mes = meses[date.getMonth()];
      return `${diaSemana}, ${dia} de ${mes}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-black' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Serviço</span>
            <span>Profissional</span>
            <span>Data/Hora</span>
            <span>Confirmar</span>
          </div>
        </div>

        {/* Step 1: Escolher Serviço */}
        {step === 1 && (
          <Card>
            <h2 className="text-2xl font-bold mb-6">Qual serviço você deseja?</h2>
            {loadingServicos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : servicos.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {servicos.map((servico) => (
                <button
                  key={servico.id}
                  onClick={() => {
                    setFormData({ ...formData, servico: servico.id });
                    setErrors({});
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.servico === servico.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                    <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{servico.nome}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {servico.duracao_minutos} min
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          R$ {servico.preco.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            )}
            {errors.servico && (
              <p className="text-red-500 text-sm mb-4">{errors.servico}</p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                Próximo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Escolher Profissional */}
        {step === 2 && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <h2 className="text-2xl font-bold">Com quem você quer agendar?</h2>
            </div>
            {loadingProfissionais ? (
              <div className="space-y-3 mb-6">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : profissionais.length === 0 ? (
              <div className="text-center py-8 text-gray-600 mb-6">
                <p>Nenhum profissional disponível para este serviço.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {profissionais.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setFormData({ ...formData, profissional: prof.id });
                    setErrors({});
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.profissional === prof.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {prof.foto_url ? (
                        <img src={prof.foto_url} alt={prof.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{prof.nome}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>{prof.servicos_count} serviço{prof.servicos_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            )}
            {errors.profissional && (
              <p className="text-red-500 text-sm mb-4">{errors.profissional}</p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                Próximo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Escolher Data e Hora */}
        {step === 3 && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <h2 className="text-2xl font-bold">Quando você quer agendar?</h2>
            </div>
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <Input
                  type="date"
                  value={formData.data || ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const today = new Date().toISOString().split('T')[0];
                    if (selectedDate >= today) {
                      setFormData({ ...formData, data: selectedDate });
                      setErrors({});
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  error={errors.data}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Horário</label>
                {loadingHorarios ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Skeleton key={i} className="h-10" />
                    ))}
                  </div>
                ) : horarios.length === 0 ? (
                  <p className="text-sm text-gray-600">Nenhum horário disponível para esta data.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {horarios.map((horario) => {
                      const selecionado = formData.hora === horario.hora;
                      return (
                        <button
                          key={horario.hora}
                          onClick={() => {
                            if (horario.disponivel) {
                              setFormData({ ...formData, hora: horario.hora });
                              setErrors({});
                            }
                          }}
                          disabled={!horario.disponivel}
                          className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selecionado
                              ? 'border-black bg-black text-white'
                              : !horario.disponivel
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                          title={horario.motivo || undefined}
                        >
                          {horario.hora}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.hora && (
                  <p className="text-red-500 text-sm mt-2">{errors.hora}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                Próximo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Confirmar Dados */}
        {step === 4 && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <h2 className="text-2xl font-bold">Confirme seus dados</h2>
            </div>
            <div className="mb-6">
              <Card className="bg-gray-50">
                <h3 className="font-semibold mb-3">Resumo do Agendamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serviço:</span>
                    <span className="font-medium">{servicoSelecionado?.nome} - R$ {servicoSelecionado?.preco.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profissional:</span>
                    <span className="font-medium">{profissionalSelecionado?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{formData.data ? formatDate(formData.data) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{formData.hora || '-'}</span>
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-4 mb-6">
              <Input
                label="Nome *"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  setErrors({ ...errors, nome: '' });
                }}
                error={errors.nome}
                placeholder="Seu nome completo"
              />
              <Input
                label="Telefone *"
                value={formData.telefone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData({ ...formData, telefone: formatted });
                  setErrors({ ...errors, telefone: '' });
                }}
                error={errors.telefone}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
                placeholder="seu@email.com"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.receberWhatsApp}
                  onChange={(e) => setFormData({ ...formData, receberWhatsApp: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Receber confirmação por WhatsApp</span>
              </label>
            </div>
            <Button onClick={handleSubmit} size="lg" className="w-full" disabled={loadingAgendamento}>
              {loadingAgendamento ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar Agendamento'
              )}
            </Button>
          </Card>
        )}

        {/* Step 5: Sucesso */}
        {step === 5 && (
          <Card className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Agendamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">
                Você receberá confirmação por email/WhatsApp
              </p>
            </div>
            <Card className="bg-gray-50 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviço:</span>
                  <span className="font-medium">{servicoSelecionado?.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profissional:</span>
                  <span className="font-medium">{profissionalSelecionado?.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">{formData.data ? formatDate(formData.data) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-medium">{formData.hora || '-'}</span>
                </div>
              </div>
            </Card>
            <Button href="/" size="lg" className="w-full">
              Voltar à página inicial
            </Button>
          </Card>
        )}
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

