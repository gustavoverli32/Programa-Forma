import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

function normalizeTrilhaKey(key) {
  if (!key) return null;
  const k = String(key).toLowerCase();
  if (k.includes('decolar') || k.includes('iniciante')) return 'iniciante';
  if (k.includes('evoluir') || k.includes('intermediario')) return 'intermediario';
  if (k.includes('impactar') || k.includes('avancado')) return 'avancado';
  return 'iniciante';
}

async function main() {
  const { data: estagiarios, error } = await supabase
    .from('estagiarios')
    .select('id, nome, perfil');

  if (error) {
    console.error('Erro ao buscar estagiarios:', error);
    return;
  }

  for (const est of (estagiarios || [])) {
    if (est.perfil && est.perfil.trilha_manual) {
      const oldVal = est.perfil.trilha_manual;
      const normalized = normalizeTrilhaKey(oldVal);
      if (normalized && normalized !== oldVal) {
        const newPerfil = { ...est.perfil, trilha_manual: normalized };
        await supabase
          .from('estagiarios')
          .update({ perfil: newPerfil })
          .eq('id', est.id);
        console.log(`✓ ${est.nome}: trilha_manual corrigida de "${oldVal}" para "${normalized}"`);
      }
    }
  }
}

main().catch(console.error);
