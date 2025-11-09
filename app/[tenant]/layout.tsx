'use client';

import { TenantProvider } from '@/context/TenantContext';
import { AuthProvider } from '@/context/AuthContext';

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  return (
    <AuthProvider>
      <TenantProvider>
        {children}
      </TenantProvider>
    </AuthProvider>
  );
}

