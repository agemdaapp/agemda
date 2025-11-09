'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ConfiguracoesPage() {
  const [dadosNegocio, setDadosNegocio] = useState({
    nome: 'Leticia Nails',
    vertical: 'beleza',
    email: 'contato@leticianails.com',
    telefone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
  });

  const [conta, setConta] = useState({
    email: 'leticia@email.com',
  });

  const verticals = [
    { value: 'beleza', label: 'Beleza' },
    { value: 'barbearia', label: 'Barbearia' },
    { value: 'unhas', label: 'Unhas' },
    { value: 'outro', label: 'Outro' },
  ];

  const handleSaveNegocio = () => {
    // TODO: Integrar com API
    alert('Dados do negócio salvos!');
  };

  const handleMudarSenha = () => {
    // TODO: Implementar mudança de senha
    alert('Funcionalidade em desenvolvimento');
  };

  const handleDeletarConta = () => {
    if (confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
      // TODO: Implementar deleção de conta
      alert('Conta deletada');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>

      {/* Dados do Negócio */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Dados do Negócio</h2>
        <div className="space-y-4">
          <Input
            label="Nome"
            value={dadosNegocio.nome}
            onChange={(e) => setDadosNegocio({ ...dadosNegocio, nome: e.target.value })}
          />
          <Select
            label="Vertical"
            options={verticals}
            value={dadosNegocio.vertical}
            onChange={(e) => setDadosNegocio({ ...dadosNegocio, vertical: e.target.value })}
          />
          <Input
            label="Email de contato"
            type="email"
            value={dadosNegocio.email}
            onChange={(e) => setDadosNegocio({ ...dadosNegocio, email: e.target.value })}
          />
          <Input
            label="Telefone"
            value={dadosNegocio.telefone}
            onChange={(e) => setDadosNegocio({ ...dadosNegocio, telefone: e.target.value })}
          />
          <Input
            label="WhatsApp (para confirmações)"
            value={dadosNegocio.whatsapp}
            onChange={(e) => setDadosNegocio({ ...dadosNegocio, whatsapp: e.target.value })}
          />
          <Button onClick={handleSaveNegocio}>Salvar</Button>
        </div>
      </Card>

      {/* Plano Atual */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Plano Atual</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">Básico</span>
                <Badge variant="default">Ativo</Badge>
              </div>
              <p className="text-sm text-gray-600">R$ 49/mês</p>
            </div>
            <Button variant="outline" href="/planos">
              Upgrade de plano
            </Button>
          </div>
        </div>
      </Card>

      {/* Conta */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Conta</h2>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={conta.email}
            onChange={(e) => setConta({ ...conta, email: e.target.value })}
            disabled
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMudarSenha}>
              Mudar senha
            </Button>
          </div>
        </div>
      </Card>

      {/* Integrações */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Integrações</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Integrações com pagamento e outras ferramentas estarão disponíveis em breve.
          </p>
        </div>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-red-200">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Zona de Perigo</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ao deletar sua conta, todos os dados serão permanentemente removidos. Esta ação não pode ser desfeita.
          </p>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" onClick={handleDeletarConta}>
            Deletar conta
          </Button>
        </div>
      </Card>
    </div>
  );
}

