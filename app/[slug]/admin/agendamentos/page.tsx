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
      telefone: a.cliente_telefone,
      email: a.cliente_email,
      servico: a.servico?.nome || '-',
      profissional: a.profissional?.nome || '-',
      status: a.status,
      preco: a.servico?.preco || 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Buscar"
            placeholder="Nome do cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Input
            label="Data"
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => {
              setSearch('');
              setStatusFilter('todos');
              setDataFiltro('');
            }}>
              Limpar
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : agendamentosFormatados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <>
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
                  {agendamentosFormatados.map((agendamento) => (
                    <tr key={agendamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{agendamento.data}</p>
                          <p className="text-sm text-gray-500">{agendamento.hora}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{agendamento.cliente}</p>
                          <p className="text-sm text-gray-500">{agendamento.telefone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{agendamento.servico}</td>
                      <td className="py-3 px-4">{agendamento.profissional}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            agendamento.status === 'confirmado'
                              ? 'success'
                              : agendamento.status === 'cancelado'
                              ? 'error'
                              : 'default'
                          }
                        >
                          {agendamento.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {total > limit && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

