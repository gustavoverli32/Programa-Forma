import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function main() {
  const { data: estagiarios } = await supabase.from('estagiarios').select('id, nome').eq('nome', 'Esther Santos').single();
  console.log('Esther Santos ID:', estagiarios?.id);

  if (!estagiarios?.id) return;

  const testRow = {
    estagiario_id: estagiarios.id,
    tri_ref: '3° Tri 2026-M1-S1-MOD0',
    meta: 0,
    producao: 50000
  };

  const { data, error } = await supabase.from('producao_trimestral').upsert([testRow], {
    onConflict: 'estagiario_id,tri_ref'
  }).select();

  if (error) {
    console.error('ERRO NO UPSERT DA PRODUCAO:', error);
  } else {
    console.log('✓ UPSERT FUNCIONOU PERFEITAMENTE:', data);
  }
}

main().catch(console.error);
