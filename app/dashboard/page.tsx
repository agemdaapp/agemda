'use client';

export const dynamic = 'force-dynamic';

import { Calendar, CheckCircle, XCircle, DollarSign, Plus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthContext } from '@/context/AuthContext';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { format } from 'date-fns';

export default function DashboardHome() {
  const { tenantId } = useAuthContext();
  
  // Busca agendamentos de hoje
  const hoje = new Date().toISOString().split('T')[0];
  const { agendamentos, loading } = useAgendamentos(tenantId, {
    data_inicio: hoje,
    limit: 5,
  });

  // Calcula KPIs
  const hojeAgendamentos = agendamentos.filter(a => {
    const dataAgendamento = new Date(a.data_hora).toISOString().split('T')[0];
    return dataAgendamento === hoje;
  });

  const kpiData = {
    hoje: hojeAgendamentos.length,
    confirmados: hojeAgendamentos.filter(a => a.status === 'confirmado').length,
    cancelados: hojeAgendamentos.filter(a => a.status === 'cancelado').length,
    receita: hojeAgendamentos
      .filter(a => a.status === 'confirmado')
      .reduce((sum, a) => sum + (a.servico?.preco || 0), 0),
  };

  const proximosAgendamentos = agendamentos.slice(0, 5).map(a => {
    const dataHora = new Date(a.data_hora);
    return {
      id: a.id,
      hora: format(dataHora, 'HH:mm'),
      cliente: a.cliente_nome,
      servico: a.servico?.nome || 'Serviço',
      profissional: a.profissional?.nome || 'Profissional',
      status: a.status,
    };
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, Leticia!</h1>
          <p className="text-gray-600 mt-1">Aqui está um resumo do seu negócio hoje</p>
        </div>
        <Button href="/dashboard/agendamentos?novo=true">
          <Plus className="w-4 h-4 mr-2" />
          Novo agendamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-20" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Agendamentos hoje</p>
              <p className="text-3xl font-bold">{kpiData.hoje}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmados</p>
              <p className="text-3xl font-bold text-green-600">{kpiData.confirmados}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cancelados</p>
              <p className="text-3xl font-bold text-red-600">{kpiData.cancelados}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita mês</p>
              <p className="text-3xl font-bold">R$ {kpiData.receita}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
          </>
        )}
      </div>

      {/* Gráfico simples (mock) */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Agendamentos últimos 7 dias</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[5, 8, 6, 10, 7, 9, 8].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-black rounded-t transition-all hover:bg-gray-800"
                style={{ height: `${(value / 10) * 100}%` }}
              />
              <span className="text-xs text-gray-600 mt-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Próximos Agendamentos */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Próximos agendamentos</h2>
          <Button variant="ghost" size="sm" href="/dashboard/agendamentos">
            Ver todos
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : proximosAgendamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>Nenhum agendamento para hoje.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Serviço</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profissional</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {proximosAgendamentos.map((agendamento) => (
                <tr key={agendamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{agendamento.hora}</td>
                  <td className="py-3 px-4 text-sm">{agendamento.cliente}</td>
                  <td className="py-3 px-4 text-sm">{agendamento.servico}</td>
                  <td className="py-3 px-4 text-sm">{agendamento.profissional}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        agendamento.status === 'confirmado' ? 'success' : 'warning'
                      }
                    >
                      {agendamento.status}
                    </Badge>
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

