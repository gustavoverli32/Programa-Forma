-- Seed Script: Cadastro do Time Piloto da Regional Campos / Macaé

DO $$
DECLARE
  v_campos_id UUID;
BEGIN
  -- Obter o ID da regional Campos / Macaé
  SELECT id INTO v_campos_id FROM public.regionais WHERE slug = 'campos-macae' LIMIT 1;

  IF v_campos_id IS NULL THEN
    RAISE EXCEPTION 'A regional campos-macae não foi encontrada. Execute primeiro o script docs/sql/migration-multi-regional.sql';
  END IF;

  -- 1. Líder Regional: Andreia Vieira (Funcional: 004268363)
  IF NOT EXISTS (SELECT 1 FROM public.gestores WHERE funcional = '004268363') THEN
    INSERT INTO public.gestores (nome, funcional, tipo_gestor, regional_id, permissoes)
    VALUES (
      'Andreia Vieira',
      '004268363',
      'lider_regional',
      v_campos_id,
      '{"tipo": "lider_regional", "escopo": "global"}'::jsonb
    );
  ELSE
    UPDATE public.gestores
    SET nome = 'Andreia Vieira',
        tipo_gestor = 'lider_regional',
        permissoes = '{"tipo": "lider_regional", "escopo": "global"}'::jsonb
    WHERE funcional = '004268363';
  END IF;

  -- 2. GGA: Dionathan Cunha (Funcional: 005400858)
  IF NOT EXISTS (SELECT 1 FROM public.gestores WHERE funcional = '005400858') THEN
    INSERT INTO public.gestores (nome, funcional, tipo_gestor, regional_id, permissoes)
    VALUES (
      'Dionathan Cunha',
      '005400858',
      'gga',
      v_campos_id,
      '{"tipo": "gga", "escopo": "regional"}'::jsonb
    );
  ELSE
    UPDATE public.gestores
    SET nome = 'Dionathan Cunha',
        tipo_gestor = 'gga',
        regional_id = v_campos_id,
        permissoes = '{"tipo": "gga", "escopo": "regional"}'::jsonb
    WHERE funcional = '005400858';
  END IF;

  -- 3. GA: Juliana Dutra (Funcional: 987367720)
  IF NOT EXISTS (SELECT 1 FROM public.gestores WHERE funcional = '987367720') THEN
    INSERT INTO public.gestores (nome, funcional, tipo_gestor, regional_id, permissoes)
    VALUES (
      'Juliana Dutra',
      '987367720',
      'ga',
      v_campos_id,
      '{"tipo": "ga", "escopo": "agencia"}'::jsonb
    );
  ELSE
    UPDATE public.gestores
    SET nome = 'Juliana Dutra',
        tipo_gestor = 'ga',
        regional_id = v_campos_id,
        permissoes = '{"tipo": "ga", "escopo": "agencia"}'::jsonb
    WHERE funcional = '987367720';
  END IF;

  -- 4. Estagiária Piloto: Esther Santos (Funcional: 987402979)
  IF NOT EXISTS (SELECT 1 FROM public.estagiarios WHERE perfil->>'funcional' = '987402979' OR nome = 'Esther Santos') THEN
    INSERT INTO public.estagiarios (nome, gestor_funcional, regional_id, perfil, atencao, obs)
    VALUES (
      'Esther Santos',
      '987367720',
      v_campos_id,
      '{
        "funcional": "987402979",
        "ga_funcional": "987367720",
        "gga_funcional": "005400858",
        "agencia": "Campos / Macaé",
        "inicio": "2026-08-01",
        "certificacao": "CPA-10",
        "trilha_manual": "Decolar (0-90d)"
      }'::jsonb,
      false,
      'Estagiária da Regional Piloto Campos / Macaé'
    );
  ELSE
    UPDATE public.estagiarios
    SET gestor_funcional = '987367720',
        regional_id = v_campos_id,
        perfil = '{
          "funcional": "987402979",
          "ga_funcional": "987367720",
          "gga_funcional": "005400858",
          "agencia": "Campos / Macaé",
          "inicio": "2026-08-01",
          "certificacao": "CPA-10",
          "trilha_manual": "Decolar (0-90d)"
        }'::jsonb
    WHERE perfil->>'funcional' = '987402979' OR nome = 'Esther Santos';
  END IF;

END $$;
