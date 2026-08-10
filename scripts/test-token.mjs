import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabase = createClient('https://hbebkripmytkknqydjpt.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH');

async function run() {
  const { data: estagiarios } = await supabase.from('estagiarios').select('*').ilike('nome', '%Esther%');
  const esther = estagiarios[0];
  
  const { data: gestores } = await supabase.from('gestores').select('*').eq('funcional', '004268363');
  const gestor = gestores[0];
  
  console.log('Esther ID:', esther.id);
  console.log('Gestor ID:', gestor.id);
  
  // Create valid session token
  const payload = {
    role: "gestor",
    subject: gestor.id,
    expiresAt: Math.floor(Date.now() / 1000) + 3600
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = process.env.NEXTUBER_SESSION_SECRET || 'NEXTUBER_LOCAL_SECRET_KEY'; // Let's check what it is in .env or hardcoded?
  // Actually, wait, NEXTUBER_SESSION_SECRET is in process.env when Next runs!
  // I can just read it from .env.local... wait, there is no .env.local.
  // Next.js might be using a default or Vercel env.
}
run().catch(console.error);
