'use client';

import { Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useTenantContext } from '@/context/TenantContext';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthContext } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { empresa, loading: loadingTenant } = useTenantContext();
  const { tenantId } = useAuthContext();
  const hoje = new Date().toISOString().split('T')[0];
  const { agendamentos, loading: loadingAgendamentos } = useAgendamentos(tenantId, {
    data_inicio: hoje,
    limit: 100,
  });

  if (loadingTenant || !empresa) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hojeAgendamentos = agendamentos.filter(a => {
    const data = new Date(a.data_hora).toISOString().split('T')[0];
    return data === hoje;
  });

  const confirmados = hojeAgendamentos.filter(a => a.status === 'confirmado').length;
  const cancelados = hojeAgendamentos.filter(a => a.status === 'cancelado').length;
  const receitaMes = agendamentos
    .filter(a => a.status === 'confirmado' && a.servico?.preco)
    .reduce((acc, a) => acc + (a.servico?.preco || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agendamentos Hoje</p>
              <p className="text-2xl font-bold mt-1">{hojeAgendamentos.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{confirmados}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{cancelados}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita do Mês</p>
              <p className="text-2xl font-bold mt-1">R$ {receitaMes.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
        {loadingAgendamentos ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : agendamentos.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Serviço</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profissional</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.slice(0, 10).map((agendamento) => (
                  <tr key={agendamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{agendamento.cliente_nome}</p>
                        <p className="text-sm text-gray-500">{agendamento.cliente_telefone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{agendamento.servico?.nome || '-'}</td>
                    <td className="py-3 px-4">{agendamento.profissional?.nome || '-'}</td>
                    <td className="py-3 px-4">
                      {new Date(agendamento.data_hora).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agendamento.status === 'confirmado'
                            ? 'bg-green-100 text-green-800'
                            : agendamento.status === 'cancelado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {agendamento.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

