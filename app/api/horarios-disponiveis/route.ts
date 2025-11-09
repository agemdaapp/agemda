import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateTenant } from '@/lib/middleware-tenant';

/**
 * ROTA: POST /api/horarios-disponiveis
 * ROTA ALTERNATIVA: GET /api/horarios-disponiveis?profissional_id=xxx&data=2024-01-15&servico_id=yyy
 * 
 * FLUXO COMPLETO DE VERIFICAÇÃO DE DISPONIBILIDADE:
 * 
 * 1. VALIDAÇÃO INICIAL:
 *    - Recebe body (POST) ou query params (GET)
 *    - Valida tenant_id do header
 *    - Valida campos obrigatórios: profissional_id, data, servico_id
 *    - Valida formato da data (YYYY-MM-DD)
 *    - Valida se data não é no passado
 *    - Valida se data não é mais de 90 dias no futuro
 * 
 * 2. VALIDAÇÃO DE EXISTÊNCIA:
 *    - Verifica se tenant existe
 *    - Verifica se profissional existe e pertence ao tenant
 *    - Verifica se serviço existe e pertence ao tenant
 *    - Busca dados do serviço (duracao_minutos, buffer_antes, buffer_depois)
 * 
 * 3. CONSULTA HORÁRIO DE FUNCIONAMENTO:
 *    - Calcula dia_semana da data (0=domingo, 1=segunda, etc)
 *    - Busca horario_funcionamento para aquele dia_semana e tenant_id
 *    - Se barbearia fechada naquele dia → retorna array vazio
 *    - Extrai hora_abertura e hora_fechamento
 * 
 * 4. GERAÇÃO DE SLOTS:
 *    - Gera slots de 30 minutos desde hora_abertura até hora_fechamento
 *    - Exemplo: 09:00, 09:30, 10:00, 10:30, ...
 * 
 * 5. VALIDAÇÃO POR SLOT (para cada slot gerado):
 *    a) Verifica se tem agendamento confirmado que sobrepõe
 *       - Busca em agendamentos onde:
 *         * profissional_id = :profissional_id
 *         * data = :data
 *         * status = 'confirmado'
 *         * horario_inicio <= slot_fim AND horario_fim >= slot_inicio
 *    b) Verifica se tem bloqueio (almoço, limpeza, etc)
 *       - Busca em bloqueios_horario onde:
 *         * tenant_id = :tenant_id
 *         * data = :data (ou NULL para recorrente)
 *         * dia_semana = :dia_semana (se recorrente)
 *         * horario_inicio <= slot_fim AND horario_fim >= slot_inicio
 *    c) Verifica buffer_antes do serviço
 *       - Calcula slot_anterior = slot - buffer_antes minutos
 *       - Verifica se slot_anterior está disponível ou tem agendamento/bloqueio
 *       - Se slot_anterior ocupado → slot atual não disponível
 *    d) Verifica buffer_depois do serviço
 *       - Calcula slot_posterior = slot + duracao_minutos + buffer_depois
 *       - Verifica se slot_posterior não ultrapassa hora_fechamento
 *       - Se ultrapassa → slot não disponível
 *    e) Verifica se horário de FIM não ultrapassa fechamento
 *       - Calcula horario_fim = slot + duracao_minutos
 *       - Se horario_fim > hora_fechamento → slot não disponível
 * 
 * 6. CHAMADA DA FUNÇÃO RPC:
 *    - Chama buscar_horarios_disponiveis(tenant_id, profissional_id, data, duracao_minutos)
 *    - Função RPC faz toda a lógica acima em uma única query
 *    - Retorna array de { hora: TIME, disponivel: BOOLEAN, motivo: TEXT }
 * 
 * 7. FORMATAÇÃO DA RESPOSTA:
 *    - Processa resultado da RPC
 *    - Adiciona informações extras (data_formatada, dia_semana, totais)
 *    - Retorna JSON formatado
 * 
 * VALIDAÇÕES:
 * - x-tenant-id obrigatório no header
 * - profissional_id: obrigatório, UUID válido
 * - data: obrigatório, formato YYYY-MM-DD
 * - servico_id: obrigatório, UUID válido
 * - data não pode ser no passado
 * - data não pode ser mais de 90 dias no futuro
 * - Profissional deve existir e pertencer ao tenant
 * - Serviço deve existir e pertencer ao tenant
 * 
 * RETORNO:
 * {
 *   "sucesso": true,
 *   "horarios": [
 *     { "hora": "09:00", "disponivel": true },
 *     { "hora": "09:30", "disponivel": false, "motivo": "Agendado" },
 *     { "hora": "10:00", "disponivel": true }
 *   ],
 *   "data_formatada": "15/01/2024",
 *   "dia_semana": "Terça-feira",
 *   "total_slots": 16,
 *   "slots_disponiveis": 12
 * }
 * 
 * STATUS HTTP:
 * - 200: Sucesso
 * - 400: Campos obrigatórios faltando ou formato inválido
 * - 401: Tenant ID inválido
 * - 404: Profissional, serviço ou tenant não encontrado
 * - 422: Data inválida (passado ou mais de 90 dias)
 * - 500: Erro interno do servidor
 */

/**
 * Valida formato de data e se está dentro do range permitido
 */
function validarData(dataStr: string): { valida: boolean; erro?: string } {
  const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dataRegex.test(dataStr)) {
    return { valida: false, erro: 'Data deve estar no formato YYYY-MM-DD' };
  }

  const data = new Date(dataStr);
  if (isNaN(data.getTime())) {
    return { valida: false, erro: 'Data inválida' };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (data < hoje) {
    return { valida: false, erro: 'Data não pode ser no passado' };
  }

  const limiteFuturo = new Date();
  limiteFuturo.setDate(limiteFuturo.getDate() + 90);

  if (data > limiteFuturo) {
    return { valida: false, erro: 'Data não pode ser mais de 90 dias no futuro' };
  }

  return { valida: true };
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
function formatarData(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Retorna nome do dia da semana em português
 */
function obterDiaSemana(dataStr: string): string {
  const data = new Date(dataStr);
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[data.getDay()];
}

/**
 * Handler POST
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    // Valida tenant_id
    const validation = await validateTenant(tenantId, null);
    if (!validation.valid) {
      return NextResponse.json(
        { sucesso: false, mensagem: validation.error },
        { status: validation.status || 401 }
      );
    }

    const body = await request.json();
    const { profissional_id, data, servico_id } = body;

    // Valida campos obrigatórios
    if (!profissional_id || !data || !servico_id) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Campos obrigatórios: profissional_id, data, servico_id' },
        { status: 400 }
      );
    }

    // Valida formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profissional_id) || !uuidRegex.test(servico_id)) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'IDs inválidos (formato UUID)' },
        { status: 400 }
      );
    }

    // Valida data
    const validacaoData = validarData(data);
    if (!validacaoData.valida) {
      return NextResponse.json(
        { sucesso: false, mensagem: validacaoData.erro },
        { status: 422 }
      );
    }

    const supabase = createServerClient();

    // Verifica se profissional existe e pertence ao tenant
    const { data: profissional, error: profError } = await supabase
      .from('profissionais')
      .select('id, tenant_id')
      .eq('id', profissional_id)
      .eq('tenant_id', tenantId)
      .single();

    if (profError || !profissional) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Profissional não encontrado' },
        { status: 404 }
      );
    }

    // Verifica se serviço existe e pertence ao tenant, e busca dados
    const { data: servico, error: servicoError } = await supabase
      .from('servicos')
      .select('id, tenant_id, duracao_minutos, buffer_minutos_antes, buffer_minutos_depois')
      .eq('id', servico_id)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .single();

    if (servicoError || !servico) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Serviço não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // Chama função RPC do Supabase
    const { data: horarios, error: rpcError } = await supabase.rpc(
      'buscar_horarios_disponiveis',
      {
        p_tenant_id: tenantId,
        p_profissional_id: profissional_id,
        p_data: data,
        p_duracao_minutos: servico.duracao_minutos,
        // Nota: A função RPC não recebe buffers, eles são calculados internamente
      }
    );

    if (rpcError) {
      console.error('Erro ao buscar horários disponíveis:', rpcError);
      return NextResponse.json(
        { sucesso: false, mensagem: 'Erro ao buscar horários disponíveis' },
        { status: 500 }
      );
    }

    // Processa resultado
    const horariosFormatados = horarios || [];
    const totalSlots = horariosFormatados.length;
    const slotsDisponiveis = horariosFormatados.filter((h: any) => h.disponivel === true).length;

    return NextResponse.json({
      sucesso: true,
      horarios: horariosFormatados,
      data_formatada: formatarData(data),
      dia_semana: obterDiaSemana(data),
      total_slots: totalSlots,
      slots_disponiveis: slotsDisponiveis,
    });

  } catch (error) {
    console.error('Erro no POST /api/horarios-disponiveis:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Handler GET (alternativa com query string)
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    
    const profissional_id = searchParams.get('profissional_id');
    const data = searchParams.get('data');
    const servico_id = searchParams.get('servico_id');

    // Converte para formato de body e chama POST handler
    const body = {
      profissional_id,
      data,
      servico_id,
    };

    // Cria request fake para reutilizar lógica do POST
    const fakeRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body),
    });

    return POST(fakeRequest);

  } catch (error) {
    console.error('Erro no GET /api/horarios-disponiveis:', error);
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

