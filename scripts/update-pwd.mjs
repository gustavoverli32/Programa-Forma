import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
const supabase = createClient('https://hbebkripmytkknqydjpt.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH');

async function run() {
  const password = '1234';
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password + 'itau_formacao_2025'));
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  await supabase.from('gestores').update({ senha_hash: hashHex }).eq('funcional', '004268363');
  console.log('Password updated to 123 for Andreia');
}
run().catch(console.error);
