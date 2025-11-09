-- ============================================
-- SCHEMA COMPLETO DO BANCO DE DADOS
-- ============================================
-- Este é o schema real criado no Supabase
-- Use este arquivo como referência

-- ============================================
-- 1. TABELA COMPANIES (Barbearias/Clientes)
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,  -- leticianails
  subdomain VARCHAR(50) UNIQUE NOT NULL,  -- leticianails.agemda.com.br
  plan VARCHAR(50) NOT NULL DEFAULT 'basico',  -- 'basico', 'intermediario', 'premium'
  owner_email VARCHAR(255) NOT NULL,
  owner_id UUID,
  vertical VARCHAR(50) NOT NULL,  -- 'barbearia', 'unhas', 'beleza'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT plan_valido CHECK (plan IN ('basico', 'intermediario', 'premium'))
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_subdomain ON companies(subdomain);

-- ============================================
-- 2. USUARIOS (Por tenant)
-- ============================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  auth_id UUID NOT NULL,  -- ID do Supabase Auth
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',  -- 'admin', 'user'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_usuarios_tenant_id ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);

-- ============================================
-- 3. PROFISSIONAIS (Barbeiros, manicures, etc)
-- ============================================

CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  foto_url VARCHAR(500),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profissionais_tenant ON profissionais(tenant_id);

-- ============================================
-- 4. HORARIO_FUNCIONAMENTO
-- ============================================

CREATE TABLE horario_funcionamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL,  -- 0 (domingo) a 6 (sábado)
  hora_abertura TIME NOT NULL,
  hora_fechamento TIME NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, dia_semana),
  CONSTRAINT dia_valido CHECK (dia_semana BETWEEN 0 AND 6)
);

CREATE INDEX idx_horario_tenant ON horario_funcionamento(tenant_id);

-- ============================================
-- 5. SERVICOS (Corte, barba, manicure, etc)
-- ============================================

CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  duracao_minutos INT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  buffer_minutos_antes INT DEFAULT 5,  -- tempo pra limpeza antes
  buffer_minutos_depois INT DEFAULT 5,  -- tempo pra limpeza depois
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT duracao_valida CHECK (duracao_minutos > 0),
  CONSTRAINT preco_valido CHECK (preco >= 0)
);

CREATE INDEX idx_servicos_tenant ON servicos(tenant_id);

-- ============================================
-- 6. PROFISSIONAL_SERVICO (Quem faz o quê)
-- ============================================

CREATE TABLE profissional_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, profissional_id, servico_id)
);

CREATE INDEX idx_prof_serv_tenant ON profissional_servico(tenant_id);
CREATE INDEX idx_prof_serv_prof ON profissional_servico(profissional_id);

-- ============================================
-- 7. BLOQUEIOS_HORARIO (Almoço, limpeza, etc)
-- ============================================

CREATE TABLE bloqueios_horario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  motivo VARCHAR(255),  -- 'almoço', 'limpeza', etc
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT bloqueio_valido CHECK (data_hora_fim > data_hora_inicio)
);

CREATE INDEX idx_bloqueios_tenant ON bloqueios_horario(tenant_id);
CREATE INDEX idx_bloqueios_prof ON bloqueios_horario(profissional_id);

-- ============================================
-- 8. AGENDAMENTOS (Coração do sistema)
-- ============================================

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Cliente
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_telefone VARCHAR(20) NOT NULL,
  
  -- Agendamento
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE RESTRICT,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
  data_hora TIMESTAMP NOT NULL,
  duracao_minutos INT NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'confirmado',
  
  -- Controle
  confirmado_em TIMESTAMP DEFAULT NOW(),
  cancelado_em TIMESTAMP,
  motivo_cancelamento VARCHAR(255),
  enviado_confirmacao_whatsapp BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT horario_futuro CHECK (data_hora > NOW()),
  CONSTRAINT duracao_valida CHECK (duracao_minutos > 0)
);

CREATE INDEX idx_agendamentos_tenant_data ON agendamentos(tenant_id, data_hora);
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id, data_hora);
CREATE INDEX idx_agendamentos_telefone ON agendamentos(tenant_id, cliente_telefone);

-- ============================================
-- 9. LANDING_PAGES (Customização por tenant)
-- ============================================

CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  cor_primaria VARCHAR(7) DEFAULT '#000000',
  cor_secundaria VARCHAR(7) DEFAULT '#FFFFFF',
  logo_url VARCHAR(500),
  descricao TEXT,
  botao_agendamento_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_landing_tenant ON landing_pages(tenant_id);

-- ============================================
-- 10. RLS POLICIES (SEGURANÇA MULTI-TENANT)
-- ============================================

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissional_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario_funcionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueios_horario ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- ✅ POLICY: USUARIOS
CREATE POLICY "usuarios_select"
  ON usuarios FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "usuarios_insert"
  ON usuarios FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- ✅ POLICY: PROFISSIONAIS
CREATE POLICY "profissionais_select"
  ON profissionais FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "profissionais_insert"
  ON profissionais FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "profissionais_update"
  ON profissionais FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "profissionais_delete"
  ON profissionais FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ✅ POLICY: SERVICOS
CREATE POLICY "servicos_select"
  ON servicos FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "servicos_insert"
  ON servicos FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "servicos_update"
  ON servicos FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "servicos_delete"
  ON servicos FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ✅ POLICY: PROFISSIONAL_SERVICO
CREATE POLICY "prof_servico_select"
  ON profissional_servico FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "prof_servico_insert"
  ON profissional_servico FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "prof_servico_delete"
  ON profissional_servico FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ✅ POLICY: HORARIO_FUNCIONAMENTO
CREATE POLICY "horario_select"
  ON horario_funcionamento FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "horario_insert"
  ON horario_funcionamento FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "horario_update"
  ON horario_funcionamento FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ✅ POLICY: BLOQUEIOS_HORARIO
CREATE POLICY "bloqueios_select"
  ON bloqueios_horario FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "bloqueios_insert"
  ON bloqueios_horario FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "bloqueios_update"
  ON bloqueios_horario FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "bloqueios_delete"
  ON bloqueios_horario FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ✅ POLICY: AGENDAMENTOS
CREATE POLICY "agendamentos_select"
  ON agendamentos FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "agendamentos_insert"
  ON agendamentos FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "agendamentos_update"
  ON agendamentos FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "agendamentos_delete"
  ON agendamentos FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ✅ POLICY: LANDING_PAGES
CREATE POLICY "landing_pages_select"
  ON landing_pages FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "landing_pages_update"
  ON landing_pages FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM usuarios WHERE auth_id = auth.uid()
    )
  );

-- ============================================
-- 11. FUNÇÕES RPC
-- ============================================

-- Função: Validar disponibilidade
CREATE OR REPLACE FUNCTION validar_disponibilidade_agendamento(
  p_tenant_id UUID,
  p_profissional_id UUID,
  p_data_hora TIMESTAMP,
  p_duracao_minutos INT
)
RETURNS TABLE (disponivel BOOLEAN, motivo TEXT) AS $$
DECLARE
  v_dia_semana INT;
  v_horario RECORD;
  v_conflito INT;
  v_bloqueio INT;
  v_hora_slot TIME;
BEGIN
  -- 1. Validar hora futura
  IF p_data_hora <= NOW() THEN
    RETURN QUERY SELECT FALSE, 'Horário no passado'::TEXT;
    RETURN;
  END IF;

  -- 2. Validar profissional existe e ativo
  IF NOT EXISTS (SELECT 1 FROM profissionais WHERE id = p_profissional_id AND tenant_id = p_tenant_id AND ativo = true) THEN
    RETURN QUERY SELECT FALSE, 'Profissional inativo'::TEXT;
    RETURN;
  END IF;

  -- 3. Validar horário funcionamento
  v_dia_semana := EXTRACT(DOW FROM p_data_hora)::INT;
  SELECT * INTO v_horario FROM horario_funcionamento 
  WHERE tenant_id = p_tenant_id AND dia_semana = v_dia_semana AND ativo = true;

  IF v_horario IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Fechado neste dia'::TEXT;
    RETURN;
  END IF;

  -- 4. Validar dentro do horário
  v_hora_slot := p_data_hora::TIME;
  IF NOT (v_hora_slot >= v_horario.hora_abertura AND v_hora_slot + (p_duracao_minutos || ' minutes')::INTERVAL <= v_horario.hora_fechamento) THEN
    RETURN QUERY SELECT FALSE, 'Fora do horário'::TEXT;
    RETURN;
  END IF;

  -- 5. Validar conflito agendamentos
  SELECT COUNT(*) INTO v_conflito FROM agendamentos 
  WHERE tenant_id = p_tenant_id 
  AND profissional_id = p_profissional_id 
  AND status IN ('confirmado', 'em_andamento')
  AND (p_data_hora, p_data_hora + (p_duracao_minutos || ' minutes')::INTERVAL) 
      OVERLAPS (data_hora, data_hora + (duracao_minutos || ' minutes')::INTERVAL);

  IF v_conflito > 0 THEN
    RETURN QUERY SELECT FALSE, 'Ocupado neste horário'::TEXT;
    RETURN;
  END IF;

  -- 6. Validar bloqueios
  SELECT COUNT(*) INTO v_bloqueio FROM bloqueios_horario 
  WHERE tenant_id = p_tenant_id 
  AND (profissional_id = p_profissional_id OR profissional_id IS NULL)
  AND (p_data_hora, p_data_hora + (p_duracao_minutos || ' minutes')::INTERVAL) 
      OVERLAPS (data_hora_inicio, data_hora_fim);

  IF v_bloqueio > 0 THEN
    RETURN QUERY SELECT FALSE, 'Período bloqueado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Disponível'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Função: Criar agendamento seguro
CREATE OR REPLACE FUNCTION criar_agendamento_seguro(
  p_tenant_id UUID,
  p_cliente_nome TEXT,
  p_cliente_email TEXT,
  p_cliente_telefone TEXT,
  p_profissional_id UUID,
  p_servico_id UUID,
  p_data_hora TIMESTAMP
)
RETURNS TABLE (sucesso BOOLEAN, agendamento_id UUID, mensagem TEXT) AS $$
DECLARE
  v_duracao INT;
  v_validacao RECORD;
  v_novo_id UUID;
BEGIN
  SELECT duracao_minutos INTO v_duracao FROM servicos 
  WHERE id = p_servico_id AND tenant_id = p_tenant_id;

  IF v_duracao IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Serviço não encontrado'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO v_validacao FROM validar_disponibilidade_agendamento(p_tenant_id, p_profissional_id, p_data_hora, v_duracao);

  IF NOT v_validacao.disponivel THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_validacao.motivo;
    RETURN;
  END IF;

  INSERT INTO agendamentos (tenant_id, cliente_nome, cliente_email, cliente_telefone, profissional_id, servico_id, data_hora, duracao_minutos, status)
  VALUES (p_tenant_id, p_cliente_nome, p_cliente_email, p_cliente_telefone, p_profissional_id, p_servico_id, p_data_hora, v_duracao, 'confirmado')
  RETURNING id INTO v_novo_id;

  RETURN QUERY SELECT TRUE, v_novo_id, 'Agendamento confirmado'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Função: Buscar horários disponíveis
CREATE OR REPLACE FUNCTION buscar_horarios_disponiveis(
  p_tenant_id UUID,
  p_profissional_id UUID,
  p_data DATE,
  p_duracao_minutos INT
)
RETURNS TABLE (hora TEXT, disponivel BOOLEAN) AS $$
DECLARE
  v_dia_semana INT;
  v_horario RECORD;
  v_data_inicio TIMESTAMP;
  v_data_fim TIMESTAMP;
  v_hora_slot TIMESTAMP;
BEGIN
  IF p_data < CURRENT_DATE THEN RETURN; END IF;

  v_dia_semana := EXTRACT(DOW FROM p_data)::INT;
  
  SELECT * INTO v_horario FROM horario_funcionamento 
  WHERE tenant_id = p_tenant_id AND dia_semana = v_dia_semana AND ativo = true;

  IF v_horario IS NULL THEN RETURN; END IF;

  v_data_inicio := (p_data || ' ' || v_horario.hora_abertura)::TIMESTAMP;
  v_data_fim := (p_data || ' ' || v_horario.hora_fechamento)::TIMESTAMP;

  v_hora_slot := v_data_inicio;

  WHILE v_hora_slot + (p_duracao_minutos || ' minutes')::INTERVAL <= v_data_fim LOOP
    RETURN QUERY SELECT 
      TO_CHAR(v_hora_slot, 'HH24:MI')::TEXT,
      NOT EXISTS (
        SELECT 1 FROM agendamentos 
        WHERE tenant_id = p_tenant_id 
        AND profissional_id = p_profissional_id 
        AND status IN ('confirmado', 'em_andamento')
        AND (v_hora_slot, v_hora_slot + (p_duracao_minutos || ' minutes')::INTERVAL)
            OVERLAPS (data_hora, data_hora + (duracao_minutos || ' minutes')::INTERVAL)
      ) AND NOT EXISTS (
        SELECT 1 FROM bloqueios_horario 
        WHERE tenant_id = p_tenant_id 
        AND (profissional_id = p_profissional_id OR profissional_id IS NULL)
        AND (v_hora_slot, v_hora_slot + (p_duracao_minutos || ' minutes')::INTERVAL)
            OVERLAPS (data_hora_inicio, data_hora_fim)
      );

    v_hora_slot := v_hora_slot + INTERVAL '30 minutes';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. TRIGGERS (Auto-update timestamp)
-- ============================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER profissionais_updated BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER servicos_updated BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER agendamentos_updated BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER landing_pages_updated BEFORE UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION update_timestamp();

