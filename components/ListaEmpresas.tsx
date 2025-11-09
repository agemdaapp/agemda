'use client';

import { Building2, Sparkles, Scissors, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface Company {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  subdomain_url: string;
}

interface ListaEmpresasProps {
  empresas: Company[];
  isLoading: boolean;
  onSelecionar: (slug: string, url: string) => void;
}

const verticalIcons: Record<string, any> = {
  unhas: Sparkles,
  barbearia: Scissors,
  beleza: Building2,
};

const verticalLabels: Record<string, string> = {
  unhas: 'Salão de Unhas',
  barbearia: 'Barbearia',
  beleza: 'Beleza',
};

const planLabels: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  premium: 'Premium',
};

export function ListaEmpresas({ empresas, isLoading, onSelecionar }: ListaEmpresasProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Nenhuma empresa cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {empresas.map((empresa) => {
        const Icon = verticalIcons[empresa.vertical] || Building2;
        const verticalLabel = verticalLabels[empresa.vertical] || empresa.vertical;
        const planLabel = planLabels[empresa.plan] || empresa.plan;

        return (
          <Card key={empresa.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{empresa.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{verticalLabel}</p>
                  </div>
                  <Badge variant={empresa.plan === 'premium' ? 'info' : 'default'}>
                    {planLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <ExternalLink className="w-3 h-3" />
                  <span className="font-mono">{empresa.subdomain_url}</span>
                </div>
                <Button
                  onClick={() => onSelecionar(empresa.slug, empresa.subdomain_url)}
                  className="w-full"
                >
                  Acessar
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

