/**
 * Script para listar empresas cadastradas no banco
 * Execute: npx tsx scripts/listar-empresas.ts
 */

import { createServerClient } from '../lib/supabase';

async function listarEmpresas() {
  try {
    const supabase = createServerClient();

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, subdomain, plan, owner_email, vertical, ativo, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar empresas:', error.message);
      return;
    }

    if (!companies || companies.length === 0) {
      console.log('📭 Nenhuma empresa cadastrada no banco de dados.');
      return;
    }

    console.log('\n📋 EMPRESAS CADASTRADAS NO BANCO DE DADOS:\n');
    console.log('═'.repeat(80));
    
    companies.forEach((empresa, index) => {
      console.log(`\n${index + 1}. ${empresa.name}`);
      console.log(`   ID: ${empresa.id}`);
      console.log(`   Slug: ${empresa.slug}`);
      console.log(`   Subdomínio: ${empresa.subdomain}`);
      console.log(`   Plano: ${empresa.plan}`);
      console.log(`   Email: ${empresa.owner_email}`);
      console.log(`   Vertical: ${empresa.vertical}`);
      console.log(`   Status: ${empresa.ativo ? '✅ Ativo' : '❌ Inativo'}`);
      console.log(`   Criado em: ${new Date(empresa.created_at).toLocaleString('pt-BR')}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📊 Total: ${companies.length} empresa(s) cadastrada(s)\n`);

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

listarEmpresas();

