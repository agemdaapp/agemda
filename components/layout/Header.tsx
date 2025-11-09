'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black">
            agemda
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/planos" className="text-gray-700 hover:text-black transition-colors">
              Planos
            </Link>
            <Link href="/sobre" className="text-gray-700 hover:text-black transition-colors">
              Sobre
            </Link>
            {showAuth && (
              <>
                <Link href="/login" className="text-gray-700 hover:text-black transition-colors">
                  Login
                </Link>
                <Button href="/signup">Começar Agora</Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link
                href="/planos"
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </Link>
              <Link
                href="/sobre"
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>
              {showAuth && (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Button href="/signup" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Começar Agora
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

