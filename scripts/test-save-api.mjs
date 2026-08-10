import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function test() {
  console.log("=== INICIANDO TESTE DO API /api/production/save PARA ESTHER ===");
  const { data: estagiarios } = await supabase.from('estagiarios').select('*');
  const esther = estagiarios.find(e => e.nome.includes('Esther'));

  if (!esther) {
    console.error("Esther não encontrada");
    return;
  }
  console.log("Esther ID:", esther.id);

  // Vamos simular salvar a produção do mês 2 semana 1 modalidade 0 (INSS) com valor 50000
  const entries = [
    { ref: '2026-Q3-M2-S1-MOD0', value: 50000 }
  ];

  console.log("Enviando upsert para producao_trimestral...");
  const { data: upsertData, error: upsertErr } = await supabase
    .from('producao_trimestral')
    .upsert(
      entries.map(e => ({
        estagiario_id: esther.id,
        tri_ref: e.ref,
        meta: 0,
        producao: e.value
      })),
      { onConflict: 'estagiario_id,tri_ref' }
    )
    .select();

  if (upsertErr) {
    console.error("❌ ERRO NO UPSERT:", upsertErr);
    return;
  }
  console.log("✓ UPSERT SUCESSO:", upsertData);

  // Agora vamos reler todas as linhas de producao do banco para Esther
  const { data: checkRows, error: checkErr } = await supabase
    .from('producao_trimestral')
    .select('*')
    .eq('estagiario_id', esther.id);

  console.log("Linhas no DB após salvar:", checkRows);
}

test().catch(console.error);
