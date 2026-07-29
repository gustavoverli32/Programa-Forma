# Nextuber — refatoração segura

## Objetivo

Separar os recursos internos da plataforma sem alterar a interface, os IDs, as classes CSS ou os fluxos atuais.

## O que foi feito

- O CSS que estava dentro do HTML foi extraído para `assets/css/app.css`.
- O JavaScript principal foi extraído para `assets/js/app.js`.
- O registro do PWA foi extraído para `assets/js/pwa.js`.
- `index.html` foi criado como ponto de entrada do GitHub Pages.
- O `manifest.json` passou a iniciar pela raiz da aplicação.
- O Service Worker passou a usar cache versionado e atualização sem apagar o cache a cada carregamento.
- Foi criado um backup local em `.backup/` antes da alteração.

## Garantia visual

O HTML original, os IDs, as classes, os estilos e a ordem dos scripts foram preservados. Não foi feito redesign ou alteração de layout.

## Próxima etapa recomendada

Migrar gradualmente as chamadas ao Supabase para uma camada de serviços, começando pela leitura e persistência de estagiários. Essa etapa deve ser feita somente após validar a versão publicada.

## Atenção de segurança

O código original contém uma senha administrativa no JavaScript do cliente. Ela deve ser substituída por Supabase Auth e políticas RLS antes de considerar a aplicação segura para uso público.
