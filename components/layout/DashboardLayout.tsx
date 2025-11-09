'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Clock,
  Ban,
  Globe,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Agendamentos', href: '/dashboard/agendamentos' },
  { icon: Users, label: 'Profissionais', href: '/dashboard/profissionais' },
  { icon: Scissors, label: 'Serviços', href: '/dashboard/servicos' },
  { icon: Clock, label: 'Horários', href: '/dashboard/horarios' },
  { icon: Ban, label: 'Bloqueios', href: '/dashboard/bloqueios' },
  { icon: Globe, label: 'Landing Page', href: '/dashboard/landing' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard" className="text-xl font-bold text-black">
              agemda
            </Link>
            <span className="hidden sm:block text-gray-600">|</span>
            <span className="hidden sm:block text-sm text-gray-700">Leticia Nails</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                  LN
                </div>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/dashboard/configuracoes"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </Link>
                  <button
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full text-left text-red-600"
                    onClick={() => {
                      setUserMenuOpen(false);
                      // TODO: Implementar logout
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="p-4 space-y-1 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
