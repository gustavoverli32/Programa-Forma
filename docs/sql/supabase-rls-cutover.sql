-- NEXTUBER: EXECUCAO MANUAL SOMENTE NA JANELA DE CORTE PARA O NEXT.JS.
-- Nao execute enquanto o GitHub Pages ainda for a versao principal.
-- Este primeiro corte bloqueia escrita publica e preserva as leituras usadas
-- temporariamente pela camada de compatibilidade do frontend.

begin;

drop policy if exists "Permitir tudo" on public.agendamentos;
drop policy if exists acesso_configuracoes on public.configuracoes;
drop policy if exists acesso_conteudos on public.conteudos;
drop policy if exists acesso_descricao on public.descricao_projeto;
drop policy if exists acesso_encontros on public.encontros;
drop policy if exists acesso_estagiarios on public.estagiarios;
drop policy if exists acesso_feedbacks on public.feedbacks;
drop policy if exists acesso_gestores on public.gestores;
drop policy if exists acesso_producao on public.producao_trimestral;
drop policy if exists acesso_snapshots on public.snapshots;

revoke insert, update, delete, truncate, references, trigger
on public.agendamentos, public.configuracoes, public.conteudos,
   public.descricao_projeto, public.encontros, public.estagiarios,
   public.feedbacks, public.gestores, public.producao_trimestral,
   public.snapshots
from public, anon, authenticated;

revoke select on public.gestores from public, anon, authenticated;
grant select (id, nome, funcional, permissoes, tipo_gestor, created_at)
on public.gestores to anon, authenticated;

grant select
on public.agendamentos, public.configuracoes, public.conteudos,
   public.descricao_projeto, public.encontros, public.estagiarios,
   public.feedbacks, public.producao_trimestral, public.snapshots
to anon, authenticated;

create policy nextuber_read_agendamentos on public.agendamentos
  for select to anon, authenticated using (true);
create policy nextuber_read_configuracoes on public.configuracoes
  for select to anon, authenticated using (true);
create policy nextuber_read_conteudos on public.conteudos
  for select to anon, authenticated using (true);
create policy nextuber_read_descricao on public.descricao_projeto
  for select to anon, authenticated using (true);
create policy nextuber_read_encontros on public.encontros
  for select to anon, authenticated using (true);
create policy nextuber_read_estagiarios on public.estagiarios
  for select to anon, authenticated using (true);
create policy nextuber_read_feedbacks on public.feedbacks
  for select to anon, authenticated using (true);
create policy nextuber_read_gestores on public.gestores
  for select to anon, authenticated using (true);
create policy nextuber_read_producao on public.producao_trimestral
  for select to anon, authenticated using (true);
create policy nextuber_read_snapshots on public.snapshots
  for select to anon, authenticated using (true);

create index if not exists feedbacks_estagiario_id_idx
  on public.feedbacks (estagiario_id);

commit;

-- Verificacoes obrigatorias apos o corte:
-- 1. anon consegue executar SELECT nas telas da plataforma;
-- 2. anon recebe permission denied em INSERT/UPDATE/DELETE;
-- 3. login de tutora e gestor funciona;
-- 4. producao, cadastro, trilhas, encontros e agendamentos salvam pelas APIs;
-- 5. nenhum hash de senha aparece nas respostas do navegador.
