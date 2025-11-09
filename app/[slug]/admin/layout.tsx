'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTenantContext } from '@/context/TenantContext';
import { useAuthContext } from '@/context/AuthContext';
import Image from 'next/image';

const menuItems = [
  { href: '', label: 'Dashboard', icon: '📊' },
  { href: 'agendamentos', label: 'Agendamentos', icon: '📅' },
  { href: 'profissionais', label: 'Profissionais', icon: '👥' },
  { href: 'servicos', label: 'Serviços', icon: '✂️' },
  { href: 'horarios', label: 'Horários', icon: '⏰' },
  { href: 'bloqueios', label: 'Bloqueios', icon: '🚫' },
  { href: 'landing-page', label: 'Landing Page', icon: '🎨' },
  { href: 'configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const slug = params.slug as string;
  const { empresa, customizacoes } = useTenantContext();
  const { user, logout } = useAuthContext();

  const corPrimaria = customizacoes.cor_primaria || '#000000';
  const logoUrl = customizacoes.logo_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
        style={{ borderBottomColor: `${corPrimaria}20` }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              {logoUrl ? (
                <div className="relative w-10 h-10">
                  <Image
                    src={logoUrl}
                    alt={empresa?.name || 'Logo'}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: corPrimaria }}
                >
                  {empresa?.name.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div>
                <h1 className="font-semibold" style={{ color: corPrimaria }}>
                  {empresa?.name || 'Admin'}
                </h1>
                <p className="text-xs text-gray-500">Painel Admin</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={() => logout()}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const itemPath = item.href === '' 
                ? `/${slug}/admin` 
                : `/${slug}/admin/${item.href}`;
              const isActive = pathname === itemPath || (item.href !== '' && pathname.startsWith(itemPath));
              return (
                <Link
                  key={item.href || 'dashboard'}
                  href={itemPath}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  style={isActive ? { backgroundColor: corPrimaria } : {}}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

