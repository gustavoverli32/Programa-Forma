export type TrilhaPhase = {
  key: "iniciante" | "intermediario" | "avancado";
  cor: string;
  titulo: string;
  mesesLabel: string;
  descricao: string;
  frase: string;
  topicos: {
    tema: string;
    obj: string;
    acoes: string[];
    tutora: string;
    checks: string[];
  }[];
};

export const TRILHAS_FULL_DATA: Record<"iniciante" | "intermediario" | "avancado", TrilhaPhase> = {
  iniciante: {
    key: "iniciante",
    cor: "#EC7000",
    titulo: "Fase 1 | Decolar",
    mesesLabel: "1 a 3 meses",
    descricao: "Os primeiros 90 dias são sobre explorar, aprender e se conectar.",
    frase: '"Chegou. Agora é hora de explorar."',
    topicos: [
      {
        tema: "0 a 30 dias — Conexão com o Itaú",
        obj: "Conhecer a cultura e o jeito Itaú de fazer acontecer.",
        acoes: [
          "Conhecer nossa cultura e nosso jeito de fazer acontecer",
          "Entender a dinâmica da agência e as principais ferramentas",
          "Desenvolver organização, comunicação e postura profissional",
          "Concluir as capacitações obrigatórias da jornada",
        ],
        tutora: "Acolher, apresentar e contextualizar. Tom leve e próximo.",
        checks: [
          "Conhece a cultura do banco",
          "Entende a dinâmica da agência",
          "Desenvolveu postura profissional",
          "Concluiu capacitações obrigatórias",
        ],
      },
      {
        tema: "31 a 60 dias — Construindo a Base",
        obj: "Aprender os produtos e ganhar segurança.",
        acoes: [
          "Aprender sobre os principais produtos da carteira",
          "Conhecer fluxos e processos da operação",
          "Participar de simulações práticas",
          "Ganhar segurança para os primeiros atendimentos",
        ],
        tutora: "Garantir absorção do conteúdo. Tirar dúvidas.",
        checks: [
          "Conhece os principais produtos",
          "Conhece fluxos e processos",
          "Participou de simulações práticas",
          "Tem segurança para atender",
        ],
      },
      {
        tema: "61 a 90 dias — Primeiros Resultados",
        obj: "Colocar em prática e celebrar conquistas.",
        acoes: [
          "Colocar o aprendizado em prática",
          "Acompanhar indicadores e evolução",
          "Compartilhar aprendizados e desafios",
          "Celebrar as primeiras conquistas",
        ],
        tutora: "Acompanhar de perto. Feedback frequente.",
        checks: [
          "Está atuando na prática",
          "Acompanha indicadores",
          "Compartilha aprendizados",
          "Celebrou primeiras conquistas",
        ],
      },
    ],
  },
  intermediario: {
    key: "intermediario",
    cor: "#B45309",
    titulo: "Fase 2 | Evoluir",
    mesesLabel: "3 a 6 meses",
    descricao: "Dos 91 aos 180 dias: mais autonomia, mais protagonismo.",
    frase: '"Mais autonomia. Mais protagonismo."',
    topicos: [
      {
        tema: "91 a 120 dias — Crescimento em Movimento",
        obj: "Participar ativamente e expandir competências.",
        acoes: [
          "Participar ativamente da rotina comercial",
          "Aprimorar técnicas de escuta e relacionamento",
          "Expandir conhecimentos sobre soluções financeiras",
          "Desenvolver novas competências",
        ],
        tutora: "Observar evolução técnica. Mapear pontos fortes e de desenvolvimento.",
        checks: [
          "Participa ativamente da rotina",
          "Aprimorou escuta e relacionamento",
          "Expandiu conhecimento financeiro",
          "Desenvolveu novas competências",
        ],
      },
      {
        tema: "121 a 150 dias — Feedback e Evolução",
        obj: "Receber feedback e ajustar a rota.",
        acoes: [
          "Receber feedback estruturado",
          "Identificar pontos fortes e oportunidades",
          "Construir um plano de evolução",
          "Ajustar a rota para continuar crescendo",
        ],
        tutora: "Conversa honesta. Foco em quem precisa de mais apoio.",
        checks: [
          "Recebeu feedback estruturado",
          "Identificou pontos fortes",
          "Construiu plano de evolução",
          "Ajustou a rota",
        ],
      },
      {
        tema: "151 a 180 dias — Consolidando sua Jornada",
        obj: "Avaliar evolução e fortalecer protagonismo.",
        acoes: [
          "Avaliar sua evolução técnica e comportamental",
          "Reconhecer conquistas alcançadas",
          "Preparar os próximos passos da carreira",
          "Fortalecer seu protagonismo",
        ],
        tutora: "Conduzir com clareza e cuidado.",
        checks: [
          "Avaliação técnica e comportamental feita",
          "Conquistas reconhecidas",
          "Próximos passos preparados",
          "Protagonismo fortalecido",
        ],
      },
    ],
  },
  avancado: {
    key: "avancado",
    cor: "#166534",
    titulo: "Fase 3 | Impactar",
    mesesLabel: "Acima de 6 meses",
    descricao: "Acima de 181 dias. Seu futuro começa a ganhar forma.",
    frase: '"Seu futuro começa a ganhar forma."',
    topicos: [
      {
        tema: "181 a 210 dias — Construindo o Próximo Nível",
        obj: "Criar o PDI e ampliar horizontes.",
        acoes: [
          "Criar seu Plano de Desenvolvimento Individual",
          "Ampliar conhecimentos sobre novos produtos",
          "Definir objetivos de crescimento",
          "Planejar os próximos passos da sua jornada",
        ],
        tutora: "Apoiar o PDI. Conectar com alvos da agência.",
        checks: [
          "PDI criado e alinhado",
          "Conhece novos produtos",
          "Objetivos de crescimento definidos",
          "Próximos passos planejados",
        ],
      },
      {
        tema: "+210 dias — Estagiário Referência",
        obj: "Multiplicar, inspirar e construir carreira.",
        acoes: [
          "Apoiar ativamente a formação de novos estagiários",
          "Atuar como multiplicador e mentor",
          "Analisar sua curva de resultados e evolução",
          "Refletir sobre carreira: onde quero chegar?",
        ],
        tutora: "Facilitar protagonismo. Espaço para reflexão de carreira.",
        checks: [
          "Atua como multiplicador",
          "Apoia novos estagiários",
          "Analisou sua evolução",
          "Realizou reflexão de carreira",
        ],
      },
    ],
  },
};

export type AppointmentItem = {
  id: string;
  estagiario_id?: string | null;
  titulo: string;
  data: string;
  fase?: string | null;
  tipo?: string | null;
  descricao?: string | null;
  status?: string | null;
  arquivo_url?: string | null;
  arquivo_nome?: string | null;
  created_at?: string | null;
};

export function filterAppointments(
  items: AppointmentItem[],
  faseFilter = "todos",
  tipoFilter = "todos",
): AppointmentItem[] {
  return items.filter((item) => {
    const faseMatch = faseFilter === "todos" || (item.fase || "").toLowerCase() === faseFilter.toLowerCase();
    const tipoMatch = tipoFilter === "todos" || (item.tipo || "").toLowerCase() === tipoFilter.toLowerCase();
    return faseMatch && tipoMatch;
  });
}

export function formatDeadlineStatus(deadlineStr?: string | null, now = new Date()): {
  label: string;
  statusColor: string;
  daysRemaining: number;
} {
  if (!deadlineStr) {
    return { label: "Nenhum prazo definido", statusColor: "#666", daysRemaining: 999 };
  }

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) {
    return { label: "Prazo inválido", statusColor: "#666", daysRemaining: 999 };
  }

  const diffMs = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { label: "⚠️ Prazo vencido", statusColor: "#DC2626", daysRemaining };
  }
  if (daysRemaining === 0) {
    return { label: "🚨 Vence HOJE", statusColor: "#DC2626", daysRemaining: 0 };
  }
  if (daysRemaining <= 2) {
    return { label: `⚡ Vence em ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}`, statusColor: "#D97706", daysRemaining };
  }

  return { label: `Vence em ${daysRemaining} dias`, statusColor: "#166534", daysRemaining };
}
