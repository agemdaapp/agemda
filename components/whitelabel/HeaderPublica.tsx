'use client';

import { Clock, Phone, Mail } from 'lucide-react';
import { useTenantContext } from '@/context/TenantContext';
import Image from 'next/image';

export function HeaderPublica() {
  const { empresa, customizacoes, isAberto, loading } = useTenantContext();

  if (loading || !empresa) {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </header>
    );
  }

  const corPrimaria = customizacoes.cor_primaria || '#000000';
  const logoUrl = customizacoes.logo_url;

  return (
    <header 
      className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      style={{ borderBottomColor: `${corPrimaria}20` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="relative w-12 h-12">
                <Image
                  src={logoUrl}
                  alt={empresa.name}
                  fill
                  className="object-contain rounded"
                />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: corPrimaria }}
              >
                {empresa.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: corPrimaria }}>
                {empresa.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className={isAberto() ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {isAberto() ? 'Aberto agora' : 'Fechado'}
                </span>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Contato</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{empresa.owner_email}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

