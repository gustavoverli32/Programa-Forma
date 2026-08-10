import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://hbebkripmytkknqydjpt.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH');
async function run() {
  const { data: estagiarios } = await supabase.from('estagiarios').select('*').ilike('nome', '%Esther%');
  const esther = estagiarios[0];
  console.log('Esther UUID:', esther.id);
  console.log('Esther funcional:', esther.perfil.funcional);
  
  const { data: prod } = await supabase.from('producao_trimestral').select('*').or(`estagiario_id.eq.${esther.id},estagiario_id.eq.${esther.perfil.funcional}`);
  console.log('Production count:', prod.length);
  console.log(prod.slice(0, 3));
}
run().catch(console.error);
