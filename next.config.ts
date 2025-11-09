import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configurações para produção na Vercel
  // output: 'standalone', // Comentado para evitar problemas com SSR
  // Garante que o middleware funcione corretamente
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Desabilita cache para garantir atualizações
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
