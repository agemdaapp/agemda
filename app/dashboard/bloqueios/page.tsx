'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';

// Mock data
const bloqueios = [
  { id: '1', dataInicio: '2024-01-15', horaInicio: '12:00', dataFim: '2024-01-15', horaFim: '13:00', motivo: 'Almoço', profissional: 'Todos' },
  { id: '2', dataInicio: '2024-01-20', horaInicio: '09:00', dataFim: '2024-01-20', horaFim: '10:00', motivo: 'Consulta', profissional: 'João Silva' },
];

const motivos = [
  { value: 'almoco', label: 'Almoço' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'outro', label: 'Outro' },
];

const profissionais = [
  { value: 'todos', label: 'Todos' },
  { value: '1', label: 'João Silva' },
  { value: '2', label: 'Maria Santos' },
];

export default function BloqueiosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    dataInicio: '',
    horaInicio: '',
    dataFim: '',
    horaFim: '',
    motivo: '',
    profissional: 'todos',
    recorrente: false,
  });

  const handleOpenModal = () => {
    setFormData({
      dataInicio: '',
      horaInicio: '',
      dataFim: '',
      horaFim: '',
      motivo: '',
      profissional: 'todos',
      recorrente: false,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    // TODO: Integrar com API
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bloqueios de Horário</h1>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Bloqueio
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora Início</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora Fim</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Motivo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profissional</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bloqueios.map((bloqueio) => (
                <tr key={bloqueio.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    {bloqueio.dataInicio} {bloqueio.horaInicio}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {bloqueio.dataFim} {bloqueio.horaFim}
                  </td>
                  <td className="py-3 px-4 text-sm">{bloqueio.motivo}</td>
                  <td className="py-3 px-4 text-sm">{bloqueio.profissional}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Adicionar Bloqueio"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Início"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
            />
            <Input
              label="Hora Início"
              type="time"
              value={formData.horaInicio}
              onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Fim"
              type="date"
              value={formData.dataFim}
              onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
            />
            <Input
              label="Hora Fim"
              type="time"
              value={formData.horaFim}
              onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
            />
          </div>
          <Select
            label="Motivo"
            options={motivos}
            value={formData.motivo}
            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
          />
          <Select
            label="Profissional"
            options={profissionais}
            value={formData.profissional}
            onChange={(e) => setFormData({ ...formData, profissional: e.target.value })}
          />
          <div className="pt-2">
            <Toggle
              checked={formData.recorrente}
              onChange={(checked) => setFormData({ ...formData, recorrente: checked })}
              label="Recorrente (todo dia)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Adicionar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

