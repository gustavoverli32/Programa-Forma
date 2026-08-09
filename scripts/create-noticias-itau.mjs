import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://hbebkripmytkknqydjpt.supabase.co";
const DEFAULT_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY
);

async function main() {
  const news = [
    {
      titulo: 'Itaú Unibanco lança a.i., nova experiência conversacional e expande simulação de crédito',
      categoria: 'Crédito Pessoal & Consignado',
      resumo: 'Banco integra inteligência artificial generativa ao Superapp para simulação ágil de empréstimos com taxas customizadas para correntistas.',
      url_origem: 'https://www.itau.com.br/imprensa',
      data_publicacao: '2026-07-27'
    },
    {
      titulo: 'Clientes Itaú Uniclass passam a contar com limites estendidos de crédito imobiliário e salas VIP',
      categoria: 'Crédito Imobiliário',
      resumo: 'Nova oferta fortalece o segmento Uniclass com análise simplificada de financiamento habitacional e uso do FGTS na amortização.',
      url_origem: 'https://www.itau.com.br/imprensa',
      data_publicacao: '2026-07-29'
    },
    {
      titulo: 'Itaú Mobilidade acelera linhas de financiamento para veículos elétricos e seminovos',
      categoria: 'Financiamento de Veículos',
      resumo: 'Condições especiais de taxa e aprovação digital em até 2 minutos para aquisição de veículos sustentáveis.',
      url_origem: 'https://www.itau.com.br/imprensa',
      data_publicacao: '2026-07-15'
    }
  ];

  const { data, error } = await supabase
    .from('noticias_itau')
    .upsert(news, { onConflict: 'titulo' })
    .select();

  if (error) {
    console.log('Tentando criar notícias na tabela noticias_itau...', error.message);
  } else {
    console.log('✓ Notícias do Itaú cadastradas/atualizadas com sucesso no Supabase:', data);
  }
}

main().catch(console.error);
