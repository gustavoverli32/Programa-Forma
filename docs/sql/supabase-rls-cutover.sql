-- NEXTUBER: EXECUCAO MANUAL SOMENTE NA JANELA DE CORTE PARA O NEXT.JS.
-- Nao execute enquanto o GitHub Pages ainda for a versao principal.
-- O Next.js acessa estas tabelas no servidor com a chave privada.

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

drop policy if exists nextuber_read_agendamentos on public.agendamentos;
drop policy if exists nextuber_read_configuracoes on public.configuracoes;
drop policy if exists nextuber_read_conteudos on public.conteudos;
drop policy if exists nextuber_read_descricao on public.descricao_projeto;
drop policy if exists nextuber_read_encontros on public.encontros;
drop policy if exists nextuber_read_estagiarios on public.estagiarios;
drop policy if exists nextuber_read_feedbacks on public.feedbacks;
drop policy if exists nextuber_read_gestores on public.gestores;
drop policy if exists nextuber_read_producao on public.producao_trimestral;
drop policy if exists nextuber_read_snapshots on public.snapshots;

revoke all privileges
on table public.agendamentos, public.configuracoes, public.conteudos,
   public.descricao_projeto, public.encontros, public.estagiarios,
   public.feedbacks, public.gestores, public.producao_trimestral,
   public.snapshots
from public, anon, authenticated;

create index if not exists feedbacks_estagiario_id_idx
  on public.feedbacks (estagiario_id);

commit;

-- Verificacoes obrigatorias apos o corte:
-- 1. anon recebe permission denied em SELECT/INSERT/UPDATE/DELETE;
-- 2. a pagina institucional abre sem login pelas APIs do Next.js;
-- 3. login de tutora e gestor funciona e restaura a sessao ao recarregar;
-- 4. producao, cadastro, trilhas, encontros e agendamentos carregam e salvam;
-- 5. nenhum hash, chave privada ou funcional nao autorizado aparece no navegador.
