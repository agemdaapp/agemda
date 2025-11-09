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
};

export default nextConfig;
