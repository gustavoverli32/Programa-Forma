import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function main() {
  const newTexts = {
    banner_over: 'PLATAFORMA NEXTUBER',
    banner_titulo: 'Nextuber — Programa de Desenvolvimento Comercial',
    banner_desc: 'Programa estruturado de 6 meses para formar estagiários comerciais com excelência técnica, comportamental e comprometimento com o cliente. Acompanhamento contínuo, trilhas adaptadas e desenvolvimento orientado por dados.',
    sec_objetivo: 'Formar estagiários comerciais alinhados à cultura Itaú, com base técnica sólida, postura profissional e capacidade de gerar resultado com consistência.',
    sec_estrutura: '6 meses de jornada divididos em 3 trilhas progressivas:\n• Iniciante (0-90 dias): Acolhimento, cultura e fundamentos.\n• Intermediária (91-180 dias): Protagonismo com apoio e ajustes de rota.\n• Avançada (+181 dias): PDI, autonomia e papel de referência.',
    sec_avaliacao: 'A nota final (0-10) é composta por:\n• 40% Comportamental: baseado no avanço da trilha de aprendizado.\n• 60% Resultados: percentual de alvo atingido no trimestre.',
    sec_participa: 'Tutora regional (Kamilla) — conduz o programa, valida trilhas e avalia. Gestores — acompanham o dia a dia operacional e registram feedbacks. Estagiários — protagonistas do próprio desenvolvimento.',
    sec_acomp: 'Feedbacks frequentes, checklist de aprendizado por etapa de 30 dias, métricas de produção trimestrais e snapshots históricos garantem visibilidade completa da evolução de cada estagiário.'
  };

  const { data, error } = await supabase
    .from('configuracoes')
    .upsert({ id: 'textos_projeto', valor: newTexts })
    .select();

  if (error) {
    console.error('Erro ao atualizar textos_projeto:', error);
  } else {
    console.log('✓ textos_projeto atualizado com sucesso no Supabase:', data);
  }
}

main().catch(console.error);
