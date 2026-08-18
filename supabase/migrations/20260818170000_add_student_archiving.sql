alter table public.estagiarios
  add column if not exists arquivado_em timestamptz,
  add column if not exists arquivado_por text,
  add column if not exists motivo_arquivamento text,
  add column if not exists excluir_em timestamptz;

alter table public.estagiarios
  drop constraint if exists estagiarios_motivo_arquivamento_check;

alter table public.estagiarios
  add constraint estagiarios_motivo_arquivamento_check
  check (
    motivo_arquivamento is null
    or motivo_arquivamento in ('Promovido', 'Desligado', 'Outro')
  );

create index if not exists estagiarios_arquivados_expiracao_idx
  on public.estagiarios (excluir_em)
  where arquivado_em is not null;
