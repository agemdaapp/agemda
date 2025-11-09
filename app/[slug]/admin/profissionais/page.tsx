'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, User, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

// Mock data
const profissionais = [
  { id: '1', nome: 'João Silva', foto: null, servicos: ['Corte de Cabelo', 'Barba', 'Corte + Barba'], ativo: true },
  { id: '2', nome: 'Maria Santos', foto: null, servicos: ['Corte de Cabelo', 'Penteado'], ativo: true },
];

const servicosDisponiveis = [
  { id: '1', nome: 'Corte de Cabelo' },
  { id: '2', nome: 'Barba' },
  { id: '3', nome: 'Corte + Barba' },
  { id: '4', nome: 'Penteado' },
];

export default function ProfissionaisPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    servicos: [] as string[],
  });

  const handleOpenModal = (id?: string) => {
    if (id) {
      const prof = profissionais.find(p => p.id === id);
      if (prof) {
        setFormData({ nome: prof.nome, servicos: prof.servicos });
        setEditing(id);
      }
    } else {
      setFormData({ nome: '', servicos: [] });
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
        <div>
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-gray-600 mt-1">2/2 profissionais (Plano Básico)</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Profissional
        </Button>
      </div>

      {profissionais.length >= 2 && (
        <Card className="bg-orange-50 border-orange-200">
          <p className="text-sm text-orange-800">
            Você atingiu o limite do seu plano. <Button variant="ghost" size="sm" href="/planos" className="underline">Upgrade</Button> para adicionar mais profissionais.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profissionais.map((prof) => (
          <Card key={prof.id}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {prof.foto ? (
                  <img src={prof.foto} alt={prof.nome} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{prof.nome}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {prof.servicos.map((servico) => (
                    <Badge key={servico} variant="default" className="text-xs">
                      {servico}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Toggle checked={prof.ativo} label="Ativo" />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(prof.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Editar Profissional' : 'Adicionar Profissional'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Foto</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome do profissional"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Serviços</label>
            <div className="space-y-2">
              {servicosDisponiveis.map((servico) => (
                <label key={servico.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.servicos.includes(servico.nome)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          servicos: [...formData.servicos, servico.nome],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          servicos: formData.servicos.filter(s => s !== servico.nome),
                        });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{servico.nome}</span>
                </label>
              ))}
            </div>
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

