# Nextuber — Plataforma de Formação Comercial do Itaú Unibanco

Plataforma de acompanhamento, desenvolvimento e alta performance para estagiários comerciais e gestores do Itaú Unibanco, totalmente migrada para **Next.js 16 (App Router)** + **React 19** + **TypeScript**.

[![Nextuber CI/CD Pipeline](https://github.com/gustavoverli32/programa-nextuber/actions/workflows/ci.yml/badge.svg)](https://github.com/gustavoverli32/programa-nextuber/actions/workflows/ci.yml)

---

## 🚀 Arquitetura & Principais Funcionalidades

### 1. Acompanhamento Individual & Perfil Lateral (`/`)
- Grid interativo de estagiários com busca em tempo real e filtros combinados (*Agência, Certificação CPA/C-PRO R/C-PRO I, Nota Ponderada 6+4*).
- Drawer lateral completo exibindo checks de trilha, notas acumuladas, acionamento de atenção (`⚠️`), observações da tutora e confirmação diária de produção.
- Exportação nativa dos resultados consolidados em planilha `.xlsx` (Excel).

### 2. Página Inicial & Dashboards Consolidados
- Banner com visão executiva do programa, modal de apresentação dos 5 pilares do programa (*Objetivo, Estrutura, Metodologia, Avaliação 6+4, Formatura*).
- KPIs consolidados (Total de estagiários, Crédito Realizado R$, Produtos Comercializados un, Alertas).
- Agenda de próximos encontros e reuniões com formulário inline.
- Ranking do trimestre com pódio (🥇 1º, 🥈 2º, 🥉 3º) e filtros por modalidade individual.

### 3. Cadastro & Gestão de Acessos
- Formulário de inclusão de novos estagiários com pré-visualização em tempo real.
- Cadastro e gestão de gestores (GA, GGA, Tutora) com atribuição de permissões granulares (*Trilhas, Agendamentos, Lançamento de Produção*).
- Listagem dinâmica e exclusão segura com confirmação no servidor.

### 4. Trilhas de Aprendizado, Agendamentos & Configurações
- Visualização das 3 Fases da Jornada (*Fase 1 Decolar*, *Fase 2 Evoluir*, *Fase 3 Impactar*) com tópicos, objetivos, ações, dicas da tutora e checklist.
- Central de agendamentos com upload de arquivos de comprovante via `/api/appointments/upload` e controle de presença.
- Configuração do prazo limite semanal para lançamentos de produção via `/api/settings/production-deadline`.

### 5. Assistente de Inteligência Artificial (`✨ Nextuber IA`)
- Widget flutuante de chat de inteligência artificial com respostas sanitizadas via servidor (`/api/assistant`).
- Sugestões de perguntas frequentes de acionamento rápido com 1-clique.

### 6. Segurança e Proteção de Dados
- Sessões protegidas por HMAC SHA-256 com resistência a *Timing Attacks* (`crypto.timingSafeEqual`).
- Cookies HTTP-Only com `SameSite=Lax` e `Secure`.
- Autorização baseada em papéis no servidor (`authorizeStudentWrite`), limitando o acesso de escrita dos GAs/GGAs exclusivamente às suas agências ou estagiários vinculados.
- Proteção anti-CSRF com verificação de origem `assertSameOrigin`.

---

## 🛠️ Comandos de Desenvolvimento e Verificação

```bash
# Instalar dependências
npm install

# Rodar servidor local de desenvolvimento
npm run dev

# Executar suíte completa de testes automatizados, lint e build
npm run check
```

---

## 🔒 Variáveis de Ambiente Necessárias

| Variável | Descrição |
|---|---|
| `NEXTUBER_SESSION_SECRET` | Chave secreta de alta entropia para assinatura HMAC dos cookies de sessão. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de conexão do projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave administrativa do Supabase no servidor. |
| `SUPABASE_AI_FUNCTION_URL` | URL da função Edge de IA no Supabase. |
| `SUPABASE_AI_FUNCTION_KEY` | Chave de autorização da função de IA. |
