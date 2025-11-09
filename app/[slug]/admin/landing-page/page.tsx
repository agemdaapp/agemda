'use client';

import { useState } from 'react';
import { Eye, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    corPrimaria: '#000000',
    corSecundaria: '#FFFFFF',
    logo: null as string | null,
    descricao: 'Sua descrição aqui...',
    mostrarAgendamentoRapido: true,
    mostrarListaServicos: true,
  });

  const handleSave = () => {
    // TODO: Integrar com API
    alert('Configurações salvas!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sua Landing Page</h1>
        <Button variant="outline" href="/" target="_blank">
          <Eye className="w-4 h-4 mr-2" />
          Visualizar landing
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Personalização</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.corPrimaria}
                    onChange={(e) => setFormData({ ...formData, corPrimaria: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cor Secundária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.corSecundaria}
                    onChange={(e) => setFormData({ ...formData, corSecundaria: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.corSecundaria}
                    onChange={(e) => setFormData({ ...formData, corSecundaria: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-20 h-20 object-contain" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Logo</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={4}
                  placeholder="Descrição do seu negócio"
                />
              </div>
              <div className="space-y-3 pt-2">
                <Toggle
                  checked={formData.mostrarAgendamentoRapido}
                  onChange={(checked) => setFormData({ ...formData, mostrarAgendamentoRapido: checked })}
                  label="Mostrar agendamento rápido"
                />
                <Toggle
                  checked={formData.mostrarListaServicos}
                  onChange={(checked) => setFormData({ ...formData, mostrarListaServicos: checked })}
                  label="Mostrar lista de serviços"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Salvar
              </Button>
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
              <div className="space-y-4">
                <div className="text-center">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="h-16 mx-auto mb-4" />
                  ) : (
                    <div className="h-16 w-32 bg-gray-300 rounded mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Logo</span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">Leticia Nails</h3>
                  <p className="text-gray-600">{formData.descricao}</p>
                </div>
                {formData.mostrarAgendamentoRapido && (
                  <div className="mt-6">
                    <Button className="w-full" style={{ backgroundColor: formData.corPrimaria }}>
                      Agendar Agora
                    </Button>
                  </div>
                )}
                {formData.mostrarListaServicos && (
                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">Serviços:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Corte de Cabelo</li>
                      <li>• Barba</li>
                      <li>• Penteado</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

