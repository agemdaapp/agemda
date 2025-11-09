'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';

const diasSemana = [
  { id: 'seg', nome: 'Segunda-feira' },
  { id: 'ter', nome: 'Terça-feira' },
  { id: 'qua', nome: 'Quarta-feira' },
  { id: 'qui', nome: 'Quinta-feira' },
  { id: 'sex', nome: 'Sexta-feira' },
  { id: 'sab', nome: 'Sábado' },
  { id: 'dom', nome: 'Domingo' },
];

export default function HorariosPage() {
  const [horarios, setHorarios] = useState(
    diasSemana.map((dia) => ({
      ...dia,
      abertura: '09:00',
      fechamento: '18:00',
      ativo: dia.id !== 'dom',
    }))
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const handleCopyToAll = () => {
    const seg = horarios.find(h => h.id === 'seg');
    if (seg) {
      setHorarios(horarios.map(h => ({
        ...h,
        abertura: seg.abertura,
        fechamento: seg.fechamento,
      })));
      setToast({ message: 'Horários copiados para todos os dias!', type: 'success' });
    }
  };

  const handleSave = () => {
    // TODO: Integrar com API
    setToast({ message: 'Horários salvos com sucesso!', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Horários de Funcionamento</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyToAll}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar para todos
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dia</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Abertura</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fechamento</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((dia) => (
                <tr key={dia.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{dia.nome}</td>
                  <td className="py-3 px-4">
                    <input
                      type="time"
                      value={dia.abertura}
                      onChange={(e) => {
                        setHorarios(horarios.map(h =>
                          h.id === dia.id ? { ...h, abertura: e.target.value } : h
                        ));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="time"
                      value={dia.fechamento}
                      onChange={(e) => {
                        setHorarios(horarios.map(h =>
                          h.id === dia.id ? { ...h, fechamento: e.target.value } : h
                        ));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Toggle
                      checked={dia.ativo}
                      onChange={(checked) => {
                        setHorarios(horarios.map(h =>
                          h.id === dia.id ? { ...h, ativo: checked } : h
                        ));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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

