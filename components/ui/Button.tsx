import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  asChild?: boolean;
  href?: string;
  target?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  asChild = false,
  href,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
    ghost: 'text-black hover:bg-gray-100 active:bg-gray-200',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const classes = cn(baseStyles, variants[variant], sizes[size], className);
  
  if (asChild || href) {
    const { target, ...linkProps } = props as any;
    return (
      <Link href={href || '#'} className={classes} target={target} {...linkProps}>
        {children}
      </Link>
    );
  }
  
  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

