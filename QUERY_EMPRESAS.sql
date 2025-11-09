-- ============================================
-- QUERY PARA LISTAR TODAS AS EMPRESAS
-- ============================================
-- Execute este SQL no Supabase SQL Editor para ver todas as empresas cadastradas

SELECT 
  id,
  name AS "Nome",
  slug AS "Slug",
  subdomain AS "Subdomínio",
  plan AS "Plano",
  owner_email AS "Email",
  vertical AS "Vertical",
  ativo AS "Ativo",
  created_at AS "Data de Criação"
FROM companies
ORDER BY created_at DESC;

-- Para contar total de empresas:
-- SELECT COUNT(*) as total FROM companies;

-- Para ver apenas empresas ativas:
-- SELECT * FROM companies WHERE ativo = true;

