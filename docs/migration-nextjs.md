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

## Pendências de segurança antes da produção

- Auditar e ativar RLS em todas as tabelas do Supabase.
- Migrar todas as gravações do navegador para Server Actions ou Route Handlers autenticados.
- Trocar o hash legado de gestores por autenticação Supabase Auth ou Argon2/bcrypt com salt.
- Adicionar limitação de tentativas de login e de chamadas ao assistente.
- Configurar logs de auditoria para alterações de produção, perfis e permissões.
- Rotacionar a senha antiga da tutora, pois ela existia no frontend publicado.

## Critério para remover a camada legada

A pasta `public/legacy` só será removida quando todos os fluxos abaixo estiverem cobertos por testes:

- leitura e gravação de produção;
- alerta semanal e confirmação sem produção;
- rankings;
- cadastro e edição de estagiários;
- autenticação e permissões;
- trilhas, agendamentos, exportação e assistente;
- instalação e atualização do PWA em iOS e Android.
