-- Criar tabela companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  vertical TEXT NOT NULL CHECK (vertical IN ('barbearia', 'unhas', 'beleza')),
  plano TEXT NOT NULL CHECK (plano IN ('basico', 'intermediario', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Inserir dados de teste
INSERT INTO companies (slug, nome, vertical, plano)
VALUES 
  ('leticianails', 'Leticia Nails', 'unhas', 'premium'),
  ('barbearia-exemplo', 'Barbearia Exemplo', 'barbearia', 'basico')
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para teste)
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT
  USING (true);

