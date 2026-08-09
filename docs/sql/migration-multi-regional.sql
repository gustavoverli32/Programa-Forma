-- Migration Script: Estrutura Multi-Regional Piloto (Região dos Lagos + Campos / Macaé)

-- 1. Criar a tabela de regionais
CREATE TABLE IF NOT EXISTS public.regionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela de regionais
ALTER TABLE public.regionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura publica de regionais ativas"
  ON public.regionais FOR SELECT
  USING (ativa = true);

-- 2. Inserir as Regionais Iniciais (Região dos Lagos e Campos / Macaé)
INSERT INTO public.regionais (slug, nome)
VALUES 
  ('regiao-dos-lagos', 'Região dos Lagos'),
  ('campos-macae', 'Campos / Macaé')
ON CONFLICT (slug) DO UPDATE
SET nome = EXCLUDED.nome;

-- 3. Adicionar a coluna regional_id na tabela gestores
ALTER TABLE public.gestores
  ADD COLUMN IF NOT EXISTS regional_id UUID REFERENCES public.regionais(id);

-- 4. Adicionar a coluna regional_id na tabela estagiarios
ALTER TABLE public.estagiarios
  ADD COLUMN IF NOT EXISTS regional_id UUID REFERENCES public.regionais(id);

-- 5. Vincular a base atual de gestores e estagiarios à Região dos Lagos
DO $$
DECLARE
  v_lagos_id UUID;
BEGIN
  SELECT id INTO v_lagos_id FROM public.regionais WHERE slug = 'regiao-dos-lagos' LIMIT 1;
  
  IF v_lagos_id IS NOT NULL THEN
    UPDATE public.gestores
    SET regional_id = v_lagos_id
    WHERE regional_id IS NULL;

    UPDATE public.estagiarios
    SET regional_id = v_lagos_id
    WHERE regional_id IS NULL;
  END IF;
END $$;
