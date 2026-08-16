alter table if exists public.gestores
  add column if not exists agencia text not null default '';
