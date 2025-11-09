'use client';

import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  plan: string;
  subdomain_url: string;
}

interface UseCompaniesResponse {
  sucesso: boolean;
  empresas: Company[];
  total: number;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/companies');
        const data: UseCompaniesResponse = await response.json();

        if (data.sucesso) {
          setCompanies(data.empresas || []);
        } else {
          setError('Erro ao buscar empresas');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, loading, error };
}

