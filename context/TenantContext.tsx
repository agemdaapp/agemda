'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTenant } from '@/hooks/useTenant';

interface Empresa {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  owner_email: string;
}

interface Customizacoes {
  cor_primaria: string;
  cor_secundaria: string;
  logo_url: string | null;
  descricao: string | null;
  botao_agendamento_ativo: boolean;
}

interface Horario {
  dia_semana: number;
  hora_abertura: string;
  hora_fechamento: string;
  ativo: boolean;
}

interface Profissional {
  id: string;
  nome: string;
  foto_url: string | null;
  ativo: boolean;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  ativo: boolean;
}

interface TenantData {
  empresa: Empresa | null;
  customizacoes: Customizacoes;
  horarios: Horario[];
  profissionais: Profissional[];
  servicos: Servico[];
}

interface TenantContextType extends TenantData {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getCorPrimaria: () => string;
  getCorSecundaria: () => string;
  getLogoUrl: () => string | null;
  getDescricao: () => string;
  isAberto: () => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const defaultCustomizacoes: Customizacoes = {
  cor_primaria: '#000000',
  cor_secundaria: '#FFFFFF',
  logo_url: null,
  descricao: null,
  botao_agendamento_ativo: true,
};

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantSlug } = useTenant();
  const [data, setData] = useState<TenantData>({
    empresa: null,
    customizacoes: defaultCustomizacoes,
    horarios: [],
    profissionais: [],
    servicos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenantData = async () => {
    if (!tenantSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tenant/${tenantSlug}`);
      const result = await response.json();

      if (result.sucesso) {
        setData({
          empresa: result.empresa,
          customizacoes: result.customizacoes || defaultCustomizacoes,
          horarios: result.horarios || [],
          profissionais: result.profissionais || [],
          servicos: result.servicos || [],
        });
      } else {
        setError(result.mensagem || 'Erro ao carregar dados do tenant');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantData();
  }, [tenantSlug]);

  const refresh = async () => {
    await loadTenantData();
  };

  const getCorPrimaria = () => {
    return data.customizacoes.cor_primaria || '#000000';
  };

  const getCorSecundaria = () => {
    return data.customizacoes.cor_secundaria || '#FFFFFF';
  };

  const getLogoUrl = () => {
    return data.customizacoes.logo_url;
  };

  const getDescricao = () => {
    return data.customizacoes.descricao || `Agende seu ${data.empresa?.vertical || 'serviço'}`;
  };

  const isAberto = () => {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0 = domingo, 6 = sábado
    const horaAtual = agora.getHours() * 100 + agora.getMinutes(); // HHMM

    const horarioHoje = data.horarios.find(
      (h) => h.dia_semana === diaSemana && h.ativo
    );

    if (!horarioHoje) return false;

    const [horaAbertura, minutoAbertura] = horarioHoje.hora_abertura.split(':').map(Number);
    const [horaFechamento, minutoFechamento] = horarioHoje.hora_fechamento.split(':').map(Number);

    const abertura = horaAbertura * 100 + minutoAbertura;
    const fechamento = horaFechamento * 100 + minutoFechamento;

    return horaAtual >= abertura && horaAtual <= fechamento;
  };

  return (
    <TenantContext.Provider
      value={{
        ...data,
        loading,
        error,
        refresh,
        getCorPrimaria,
        getCorSecundaria,
        getLogoUrl,
        getDescricao,
        isAberto,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}

