import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

function hashPass(p) {
  return crypto.createHash('sha256').update(p.slice(0, 4) + 'itau_formacao_2025').digest('hex');
}

async function main() {
  const pilotTeam = [
    { funcional: '004268363', name: 'Andreia Vieira' },
    { funcional: '005400858', name: 'Dionathan Cunha' },
    { funcional: '987367720', name: 'Juliana Dutra' }
  ];

  for (const p of pilotTeam) {
    const pass = p.funcional.slice(0, 4);
    const hash = hashPass(pass);
    const { data, error } = await supabase
      .from('gestores')
      .update({ senha_hash: hash })
      .eq('funcional', p.funcional)
      .select();
    
    if (error) {
      console.error(`Erro ao atualizar ${p.name}:`, error);
    } else {
      console.log(`✓ ${p.name} (Funcional ${p.funcional}): senha_hash atualizado para os 4 primeiros dígitos ("${pass}")`);
    }
  }

  // Atualizar qualquer outro gestor que esteja sem senha_hash
  const { data: allGestores } = await supabase.from('gestores').select('id, funcional, senha_hash');
  for (const g of (allGestores || [])) {
    if (!g.senha_hash && g.funcional) {
      const defaultHash = hashPass(g.funcional);
      await supabase.from('gestores').update({ senha_hash: defaultHash }).eq('id', g.id);
      console.log(`✓ Gestor ${g.funcional} sem senha atualizado com a senha padrão.`);
    }
  }
}

main().catch(console.error);
