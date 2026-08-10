import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function main() {
  console.log("Busca estagiária Esther Santos...");
  const { data: estagiarios, error: estError } = await supabase
    .from('estagiarios')
    .select('*');

  if (estError) {
    console.error("Erro ao buscar estagiarios:", estError);
    return;
  }

  const esther = estagiarios.find(e => e.nome.includes('Esther') || (e.perfil && e.perfil.funcional === '987402979'));

  if (!esther) {
    console.error("Esther nao encontrada! Lista de estagiarios:", estagiarios);
    return;
  }

  console.log("✓ Esther encontrada:", esther.id, esther.nome, "Regional:", esther.regional_id);

  const { data: producoes, error: prodError } = await supabase
    .from('producao_trimestral')
    .select('*')
    .eq('estagiario_id', esther.id);

  console.log("Producao atual no DB para Esther:", producoes);

  // Testar upsert de producao para Esther
  const testRef = '2026-Q3-M2-S1-MOD0';
  const { data: upsertData, error: upsertError } = await supabase
    .from('producao_trimestral')
    .upsert({
      estagiario_id: esther.id,
      tri_ref: testRef,
      meta: 0,
      producao: 5000
    }, { onConflict: 'estagiario_id,tri_ref' })
    .select();

  if (upsertError) {
    console.error("❌ ERRO no upsert em producao_trimestral:", upsertError);
  } else {
    console.log("✓ Upsert bem-sucedido:", upsertData);
  }
}

main().catch(console.error);
