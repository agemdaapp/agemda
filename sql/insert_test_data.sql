-- ============================================
-- DADOS DE TESTE PARA A TABELA COMPANIES
-- ============================================
-- Execute este SQL no Supabase SQL Editor para inserir dados de teste

-- Inserir empresas de teste
INSERT INTO companies (name, slug, subdomain, plan, owner_email, vertical, ativo)
VALUES 
  (
    'Leticia Nails',
    'leticianails',
    'leticianails.agemda.com.br',
    'premium',
    'leticia@nails.com',
    'unhas',
    true
  ),
  (
    'Barbearia do João',
    'barbearia-joao',
    'barbearia-joao.agemda.com.br',
    'basico',
    'joao@barbearia.com',
    'barbearia',
    true
  ),
  (
    'Salão Beleza Total',
    'beleza-total',
    'beleza-total.agemda.com.br',
    'intermediario',
    'contato@belezatotal.com',
    'beleza',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT id, name, slug, subdomain, plan, vertical, ativo, created_at 
FROM companies 
ORDER BY created_at DESC;

