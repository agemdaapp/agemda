'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Plus, Search, Download, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthContext } from '@/context/AuthContext';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { format } from 'date-fns';

export default function AgendamentosPage() {
  const { tenantId } = useAuthContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataFiltro, setDataFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { agendamentos, loading, total } = useAgendamentos(tenantId, {
    status: statusFilter !== 'todos' ? statusFilter : undefined,
    data_inicio: dataFiltro || undefined,
    limit,
    offset,
  });

  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'confirmado', label: 'Confirmados' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'cancelado', label: 'Cancelados' },
  ];

  const filteredAgendamentos = agendamentos.filter((a) => {
    const matchSearch = a.cliente_nome.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const agendamentosFormatados = filteredAgendamentos.map((a) => {
    const dataHora = new Date(a.data_hora);
    return {
      id: a.id,
      data: format(dataHora, 'dd/MM/yyyy'),
      hora: format(dataHora, 'HH:mm'),
      cliente: a.cliente_nome,
      servico: a.servico?.nome || 'Serviço',
      profissional: a.profissional?.nome || 'Profissional',
      status: a.status,
    };
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      confirmado: 'success',
      pendente: 'warning',
      cancelado: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo agendamento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Input
            type="date"
            label="Data"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Serviço</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profissional</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosFormatados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-600">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : (
                  agendamentosFormatados.map((agendamento) => (
                <tr key={agendamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    <div>
                      <div className="font-medium">{agendamento.data}</div>
                      <div className="text-gray-600">{agendamento.hora}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{agendamento.cliente}</td>
                  <td className="py-3 px-4 text-sm">{agendamento.servico}</td>
                  <td className="py-3 px-4 text-sm">{agendamento.profissional}</td>
                  <td className="py-3 px-4">{getStatusBadge(agendamento.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {agendamentosFormatados.length} de {total} agendamentos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Agendamento"
        size="lg"
      >
        <p className="text-gray-600">TODO: Integrar formulário de agendamento</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setModalOpen(false)}>Salvar</Button>
        </div>
      </Modal>
    </div>
  );
}

