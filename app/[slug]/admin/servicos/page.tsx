'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

// Mock data
const servicos = [
  { id: '1', nome: 'Corte de Cabelo', duracao: 30, preco: 50, ativo: true },
  { id: '2', nome: 'Barba', duracao: 20, preco: 30, ativo: true },
  { id: '3', nome: 'Corte + Barba', duracao: 45, preco: 70, ativo: true },
  { id: '4', nome: 'Penteado', duracao: 40, preco: 60, ativo: false },
];

export default function ServicosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    preco: '',
    bufferAntes: '',
    bufferDepois: '',
  });

  const handleOpenModal = (id?: string) => {
    if (id) {
      const servico = servicos.find(s => s.id === id);
      if (servico) {
        setFormData({
          nome: servico.nome,
          descricao: '',
          duracao: servico.duracao.toString(),
          preco: servico.preco.toString(),
          bufferAntes: '0',
          bufferDepois: '0',
        });
        setEditing(id);
      }
    } else {
      setFormData({
        nome: '',
        descricao: '',
        duracao: '',
        preco: '',
        bufferAntes: '0',
        bufferDepois: '0',
      });
      setEditing(null);
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    // TODO: Integrar com API
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duração</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Preço</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ativo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{servico.nome}</td>
                  <td className="py-3 px-4 text-sm">{servico.duracao} min</td>
                  <td className="py-3 px-4 text-sm">R$ {servico.preco}</td>
                  <td className="py-3 px-4">
                    <Toggle checked={servico.ativo} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(servico.id)}>
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
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Editar Serviço' : 'Adicionar Serviço'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome do serviço"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              rows={3}
              placeholder="Descrição do serviço"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duração (minutos)"
              type="number"
              value={formData.duracao}
              onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
              placeholder="30"
            />
            <Input
              label="Preço (R$)"
              type="number"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              placeholder="50.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Buffer antes (min)"
              type="number"
              value={formData.bufferAntes}
              onChange={(e) => setFormData({ ...formData, bufferAntes: e.target.value })}
              placeholder="0"
            />
            <Input
              label="Buffer depois (min)"
              type="number"
              value={formData.bufferDepois}
              onChange={(e) => setFormData({ ...formData, bufferDepois: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

