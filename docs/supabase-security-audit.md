# Auditoria de segurança do Supabase

Data da auditoria: 8 de agosto de 2026.

Projeto analisado: banco atualmente utilizado pelo Nextuber em produção.

## Resumo executivo

O Row Level Security está habilitado nas tabelas principais, porém as políticas atuais concedem `ALL` ao papel `public` com condições sempre verdadeiras. Na prática, a chave pública usada pelo frontend permite leitura e escrita sem autenticação efetiva.

As políticas não devem ser fechadas imediatamente porque o GitHub Pages atual ainda grava diretamente no Supabase. O fechamento será feito apenas no corte para a aplicação Next.js, depois que todos os módulos de escrita estiverem atrás de rotas autenticadas.

## Tabelas afetadas

- `agendamentos`
- `configuracoes`
- `conteudos`
- `descricao_projeto`
- `encontros`
- `estagiarios`
- `feedbacks`
- `gestores`
- `producao_trimestral`
- `snapshots`

## Situação validada

- Projeto ativo e saudável na região de São Paulo.
- 23 estagiários cadastrados.
- RLS habilitado nas tabelas do Nextuber.
- Índices únicos existentes em produção e snapshots por estagiário/trimestre.
- Edge Function `ai-assistant` ativa e configurada para exigir JWT.
- Nenhuma migração formal registrada no histórico do Supabase.
- Índice ausente na chave estrangeira `feedbacks.estagiario_id`.

## Plano de correção sem indisponibilidade

1. Manter temporariamente as políticas atuais enquanto o GitHub Pages for a versão principal.
2. Migrar todas as escritas para Route Handlers autenticados do Next.js.
3. Configurar os segredos privados apenas no Vercel e no ambiente local ignorado pelo Git.
4. Validar todos os fluxos em um Preview isolado.
5. Criar e revisar uma migração de corte que remova as políticas públicas de escrita.
6. Ativar políticas mínimas de leitura e bloquear acesso direto a hashes, permissões e dados sensíveis.
7. Publicar o Next.js, monitorar e só então retirar a versão antiga.

Produção semanal, confirmação de produção, prazo e contatos já utilizam Route Handlers na branch de migração.

## Regra de segurança para o corte

O fechamento do RLS e a troca de domínio devem ocorrer na mesma janela de publicação. Aplicar apenas uma dessas etapas isoladamente pode interromper a plataforma atual ou manter o banco exposto.

Referência: [Supabase Database Linter — RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
