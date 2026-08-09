# Nextuber

Aplicação de acompanhamento de estagiários comerciais, em migração incremental para Next.js 16, React 19 e TypeScript.

## Executar localmente

1. Copie `.env.example` para `.env.local` e preencha as variáveis.
2. Instale as dependências com `npm install`.
3. Execute `npm run dev`.
4. Abra `http://localhost:3000`.

## Comandos

- `npm run dev`: servidor local.
- `npm run test`: testes das regras de produção, prazo e pontuação.
- `npm run lint`: análise estática.
- `npm run build`: build de produção.
- `npm run check`: testes, lint e build.
- `npm run sync:legacy`: atualiza o shell de compatibilidade após mudanças no HTML legado.

## Arquitetura atual da migração

- `src/app`: App Router, metadados, PWA e rotas de backend.
- `src/components`: componentes React e inicialização temporária do código legado.
- `src/legacy`: HTML de referência e shell gerado.
- `public/legacy`: JavaScript legado adaptado para o runtime Next.js.
- `src/lib`: sessão segura e acesso privado ao Supabase.
- `src/domain`: regras de negócio puras e testáveis.
- `src/server`: autorização e serviços exclusivos do servidor.
- `src/services`: ponte temporária entre a interface preservada e as APIs Next.js.
- `docs/migration-nextjs.md`: plano, riscos e critérios da migração.
- `docs/supabase-security-audit.md`: diagnóstico do RLS e plano seguro de corte.

O shell legado é temporário. Ele garante fidelidade visual e funcional enquanto cada domínio é convertido para componentes React e serviços TypeScript, sem uma reescrita arriscada de uma só vez.
