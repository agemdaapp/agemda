'use client';

import { ReactNode } from 'react';
import { useTenantContext } from '@/context/TenantContext';
import { cn } from '@/lib/utils';

interface BotaoPrimarioProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function BotaoPrimario({
  children,
  onClick,
  type = 'button',
  size = 'md',
  className,
  disabled,
  fullWidth = false,
}: BotaoPrimarioProps) {
  const { getCorPrimaria, getCorSecundaria } = useTenantContext();

  const corPrimaria = getCorPrimaria();
  const corSecundaria = getCorSecundaria();

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-medium rounded-lg transition-all',
        'hover:opacity-90 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      style={{
        backgroundColor: corPrimaria,
        color: corSecundaria,
      }}
    >
      {children}
    </button>
  );
}

