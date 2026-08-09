-- Tabela para armazenar notícias do Itaú filtradas pelo Agente de IA
CREATE TABLE IF NOT EXISTS public.noticias_itau (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Crédito',
    resumo TEXT NOT NULL,
    url_origem TEXT,
    data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
    relevancia_score INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Permissão de leitura pública
ALTER TABLE public.noticias_itau ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura publica de noticias_itau"
ON public.noticias_itau FOR SELECT
TO anon, authenticated
USING (true);

-- Inserir notícias iniciais filtradas sobre empréstimos e crédito
INSERT INTO public.noticias_itau (titulo, categoria, resumo, url_origem, data_publicacao) VALUES
(
  'Itaú Unibanco lança a.i., nova experiência conversacional e expande simulação de crédito',
  'Crédito Pessoal & Consignado',
  'Banco integra inteligência artificial generativa ao Superapp para simulação ágil de empréstimos com taxas customizadas para correntistas.',
  'https://www.itau.com.br/imprensa',
  '2026-07-27'
),
(
  'Clientes Itaú Uniclass passam a contar com limites estendidos de crédito imobiliário e salas VIP',
  'Crédito Imobiliário',
  'Nova oferta fortalece o segmento Uniclass com análise simplificada de financiamento habitacional e uso do FGTS na amortização.',
  'https://www.itau.com.br/imprensa',
  '2026-07-29'
),
(
  'Itaú Mobilidade acelera linhas de financiamento para veículos elétricos e seminovos',
  'Financiamento de Veículos',
  'Condições especiais de taxa e aprovação digital em até 2 minutos para aquisição de veículos sustentáveis.',
  'https://www.itau.com.br/imprensa',
  '2026-07-15'
)
ON CONFLICT DO NOTHING;
