-- Aceleram filtros de escopo regional usados por gestores e pela tutora.
CREATE INDEX IF NOT EXISTS estagiarios_regional_id_idx
  ON public.estagiarios (regional_id);

CREATE INDEX IF NOT EXISTS gestores_regional_id_idx
  ON public.gestores (regional_id);
