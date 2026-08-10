import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hbebkripmytkknqydjpt.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH');

async function run() {
  // Login as gestor Andreia Vieira to get cookie
  console.log('Logging in...');
  const loginRes = await fetch('http://localhost:3000/api/auth/gestor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '004268363', password: '1234' })
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status);
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Cookies:', cookies ? 'Present' : 'Missing');
  
  if (!cookies) throw new Error('No cookie');

  // extract the session token cookie correctly for subsequent requests
  const sessionCookie = cookies.split(';')[0]; // simple extraction for fetch

  // get Esther's ID
  const { data: estagiarios } = await supabase.from('estagiarios').select('*').ilike('nome', '%Esther%');
  const esther = estagiarios[0];
  console.log('Esther ID:', esther.id);
  
  // Save production
  console.log('\nSaving production...');
  const saveRes = await fetch('http://localhost:3000/api/production/save', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({
      studentId: esther.id,
      quarterRef: '2026-Q3',
      target: 2000000,
      entries: [
        { ref: '2026-Q3-M2-S1-MOD0', value: 77777 }
      ]
    })
  });
  
  const saveData = await saveRes.json();
  console.log('Save status:', saveRes.status);
  if (saveRes.status !== 200) {
    console.error('Save failed:', saveData);
    return;
  }
  console.log('Saved row count:', saveData.productionRows?.length);
  
  // Fetch bootstrap
  console.log('\nFetching bootstrap...');
  const bootRes = await fetch('http://localhost:3000/api/data/bootstrap', {
    headers: { 'Cookie': sessionCookie }
  });
  const bootData = await bootRes.json();
  console.log('Bootstrap status:', bootRes.status);
  
  const estherProd = bootData.production?.filter(p => p.estagiario_id === esther.id && p.producao === 77777) || [];
  console.log('Found 77777 in bootstrap?', estherProd.length > 0);
  console.log('Esther prod matching records:', estherProd);

  // Check the DB directly to see if the record exists
  const { data: dbProd } = await supabase.from('producao_trimestral')
    .select('*')
    .eq('estagiario_id', esther.id)
    .eq('producao', 77777);
  console.log('\nDirect DB check for 77777:', dbProd.length > 0 ? 'Found' : 'Not Found');
}
run().catch(console.error);
