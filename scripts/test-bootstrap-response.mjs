import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function main() {
  console.log("=== VERIFICANDO DADOS NO SUPABASE ===");
  const { data: rows, error } = await supabase
    .from("producao_trimestral")
    .select("id,estagiario_id,tri_ref,meta,producao,created_at");

  if (error) {
    console.error("Erro ao buscar producao_trimestral:", error);
    return;
  }

  console.log(`Total de linhas em producao_trimestral: ${rows.length}`);
  console.log("Primeiras 10 linhas:");
  console.log(rows.slice(0, 10));

  const nonZero = rows.filter(r => Number(r.producao) > 0 || Number(r.meta) > 0);
  console.log(`\nLinhas com producao > 0 ou meta > 0: ${nonZero.length}`);
  console.log(nonZero);
}

main().catch(console.error);
