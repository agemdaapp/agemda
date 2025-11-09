'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import { useTenantContext } from '@/context/TenantContext';
import Link from 'next/link';

export function FooterPublica() {
  const { empresa, customizacoes } = useTenantContext();

  if (!empresa) return null;

  const corPrimaria = customizacoes.cor_primaria || '#000000';

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações da Empresa */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: corPrimaria }}>
              {empresa.name}
            </h3>
            <p className="text-sm text-gray-600">
              {customizacoes.descricao || `Agende seu ${empresa.vertical}`}
            </p>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-800">Contato</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Telefone</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{empresa.owner_email}</span>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-800">Plataforma</h3>
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <Link
                href="https://agemda.vercel.app"
                className="hover:underline"
                style={{ color: corPrimaria }}
              >
                agemda
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {empresa.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

