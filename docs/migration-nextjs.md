# Migração do Nextuber para Next.js

## Estratégia

A migração usa substituição incremental. A interface existente é preservada por uma camada de compatibilidade dentro do Next.js e cada módulo será migrado separadamente para React e TypeScript.

Ordem dos módulos:

1. Estrutura visual, navegação e PWA.
2. Autenticação da tutora e dos gestores.
3. Acompanhamento e produção semanal.
4. Página inicial e rankings.
5. Cadastro e permissões.
6. Trilhas e agendamentos.
7. Assistente de IA e exportação.

## Decisões já aplicadas

- Next.js 16 com App Router, React 19 e TypeScript estrito.
- Senha da tutora removida do JavaScript entregue ao navegador.
- Login de tutora e gestor intermediado por rotas do servidor.
- Hash de senha dos gestores removido da consulta feita pelo navegador.
- Assistente de IA acessado por rota do servidor e protegido por sessão.
- Variáveis sensíveis separadas das variáveis públicas.
- PWA mantido com manifesto, ícones e service worker próprios.
- Cabeçalhos básicos de segurança habilitados.
- Regra de prazo semanal centralizada em TypeScript e coberta por testes.
- Gravações de produção, confirmação sem produção e alteração de prazo movidas para rotas autenticadas.
- Permissão do gestor validada novamente no servidor antes de qualquer gravação.
- Salvamento da tabela consolidado em uma única requisição do navegador.
- Proteção de origem aplicada às novas operações de escrita.
- Contatos diários e alvo de contatos consolidados em uma rota autenticada.
- Cadastro e edição de estagiários movidos para rotas autenticadas, incluindo a regra de acesso do GGA.
- Cadastro, perfil, permissões e exclusão de gestores protegidos no servidor.
- Textos do projeto, linha do tempo e encontros protegidos por sessão de tutora.
- Agendamentos e uploads protegidos por sessão, validação de arquivo e regra de propriedade.
- Arquivos substituídos ou pertencentes a agendamentos excluídos são removidos do Storage.
- O navegador não calcula nem envia mais hashes de senha e não grava diretamente no Supabase.

## Pendências de segurança antes da produção

- Substituir as políticas RLS públicas atuais por políticas mínimas no momento do corte.
- Migrar as leituras públicas restantes para rotas do servidor antes da segunda etapa de restrição do RLS.
- Trocar o hash legado de gestores por autenticação Supabase Auth ou Argon2/bcrypt com salt.
- Adicionar limitação de tentativas de login e de chamadas ao assistente.
- Configurar logs de auditoria para alterações de produção, perfis e permissões.
- Rotacionar a senha antiga da tutora, pois ela existia no frontend publicado.

O diagnóstico detalhado e o plano de corte estão em `docs/supabase-security-audit.md`.
O SQL manual da primeira etapa do corte está em `docs/sql/supabase-rls-cutover.sql` e não deve ser executado enquanto o GitHub Pages estiver ativo.

## Critério para remover a camada legada

A pasta `public/legacy` só será removida quando todos os fluxos abaixo estiverem cobertos por testes:

- leitura e gravação de produção;
- alerta semanal e confirmação sem produção;
- rankings;
- cadastro e edição de estagiários;
- autenticação e permissões;
- trilhas, agendamentos, exportação e assistente;
- instalação e atualização do PWA em iOS e Android.
