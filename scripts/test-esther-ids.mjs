import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function main() {
  console.log("=== COMPARING ESTAGIARIO ID VS PRODUCAO ESTAGIARIO_ID ===");
  const { data: estagiarios } = await supabase.from('estagiarios').select('*');
  const { data: producoes } = await supabase.from('producao_trimestral').select('*');

  estagiarios.forEach(est => {
    console.log(`\nEstagiário: ${est.nome}`);
    console.log(`  ID (UUID em estagiarios table): "${est.id}"`);
    console.log(`  Perfil funcional: "${est.perfil?.funcional}"`);

    const matchesById = producoes.filter(p => p.estagiario_id === est.id);
    const matchesByFuncional = producoes.filter(p => p.estagiario_id === est.perfil?.funcional);

    console.log(`  Linhas de produção combinando com est.id ("${est.id}"): ${matchesById.length}`);
    console.log(`  Linhas de produção combinando com est.perfil.funcional ("${est.perfil?.funcional}"): ${matchesByFuncional.length}`);
    if (matchesByFuncional.length > 0) {
      console.log("  ⚠️ ATENÇÃO: Existem linhas salvas com o FUNCIONAL em vez do UUID!");
      console.log("  Exemplo de linhas salvas com funcional:", matchesByFuncional.slice(0, 3));
    }
  });
}

main().catch(console.error);
