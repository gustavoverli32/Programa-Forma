import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hbebkripmytkknqydjpt.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH');

async function run() {
  const { data: estagiarios } = await supabase.from('estagiarios').select('*').ilike('nome', '%Esther%');
  const esther = estagiarios[0];
  console.log('Esther ID:', esther.id);
  
  const { data: gestores } = await supabase.from('gestores').select('*').eq('funcional', '004268363');
  const gestor = gestores[0];
  console.log('Gestor ID:', gestor.id);
  
  // Directly simulate the POST request logic to isolate the error
  
  // 1. Authorize logic exactly as it is in the code
  const studentId = esther.id;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
  
  let studentQuery = supabase
    .from("estagiarios")
    .select("id,perfil,gestor_funcional,regional_id");

  if (isUuid) {
    studentQuery = studentQuery.eq("id", studentId);
  } else {
    studentQuery = studentQuery.or(`id.eq.${studentId},perfil->>funcional.eq.${studentId}`);
  }

  const { data: student, error: studentError } = await studentQuery.maybeSingle();
  if (studentError) throw studentError;
  if (!student) throw new Error("Estagiario nao encontrado. 404");

  const permissions = (gestor.permissoes ?? {});
  const profile = (student.perfil ?? {});
  const managerCode = String(gestor.funcional ?? "");
  const canWrite =
    gestor.tipo_gestor === "gga" ||
    permissions.todos_estagiarios === true ||
    String(profile.ga_funcional ?? "") === managerCode ||
    String(profile.gga_funcional ?? "") === managerCode ||
    String(student.gestor_funcional ?? "") === managerCode ||
    (Boolean(gestor.regional_id) && String(student.regional_id ?? "") === String(gestor.regional_id));

  if (!canWrite) {
    throw new Error("Sem permissao para este estagiario. 403");
  }
  
  console.log("Auth passed!");
  
  // Simulate saveBatch logic
  const quarterRef = '2026-Q3';
  const target = 0;
  const entries = [ { ref: '2026-Q3-M2-S1-MOD0', value: 77777 } ];
  
  const rowsToSave = entries.map((entry) => ({
    estagiario_id: student.id,
    tri_ref: entry.ref,
    meta: 0,
    producao: entry.value,
  }));
  
  console.log("Upserting:", rowsToSave);
  const { error: upsertError } = await supabase.from("producao_trimestral").upsert(rowsToSave, {
    onConflict: "estagiario_id,tri_ref",
  });
  if (upsertError) throw upsertError;
  
  console.log("Fetching rows back...");
  const { data: productionRows, error: rowsError } = await supabase
    .from("producao_trimestral")
    .select("*")
    .eq("estagiario_id", student.id)
    .like("tri_ref", `${quarterRef}%`);
  if (rowsError) throw rowsError;
  
  const estherProd = productionRows.filter(p => p.producao === 77777);
  console.log('Found 77777 in fetched rows?', estherProd.length > 0);
  
}
run().catch(console.error);
