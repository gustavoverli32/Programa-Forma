import type { Json } from "@/types/database";

export type StudentProfile = {
  funcional?: string;
  agencia?: string;
  inicio?: string;
  certificacao?: string;
  dia_aniversario?: string | number;
  mes_aniversario?: string | number;
  telefone?: string;
  foto?: string;
  ga_nome?: string;
  ga_funcional?: string;
  gga_nome?: string;
  gga_funcional?: string;
  trilha_manual?: string;
  ultima_atualizacao_producao?: string;
};

export type StudentItem = {
  id: string;
  nome: string;
  meses?: string[] | null;
  obs?: string | null;
  atencao?: boolean | null;
  perfil?: Json | null;
  trilha_checks?: Json | null;
  created_at?: string | null;
};

export function getStudentProfile(student: StudentItem): StudentProfile {
  const profile = student.perfil;
  if (profile && typeof profile === "object" && !Array.isArray(profile)) {
    return profile as StudentProfile;
  }
  return {};
}

export function calcDaysInProgram(inicioStr?: string | null, now = new Date()): number {
  if (!inicioStr) return 0;
  const start = new Date(inicioStr);
  if (isNaN(start.getTime())) return 0;
  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getProgramPhaseKey(
  inicioStr?: string | null,
  customPhase?: string | null,
  now = new Date(),
): "iniciante" | "intermediario" | "avancado" {
  if (customPhase && ["iniciante", "intermediario", "avancado"].includes(customPhase)) {
    return customPhase as "iniciante" | "intermediario" | "avancado";
  }
  const days = calcDaysInProgram(inicioStr, now);
  if (days <= 90) return "iniciante";
  if (days <= 180) return "intermediario";
  return "avancado";
}

export function formatDaysInProgram(inicioStr?: string | null, now = new Date()): string {
  const days = calcDaysInProgram(inicioStr, now);
  const months = Math.floor(days / 30);
  if (months === 0) return `${days} dias`;
  return `${months} ${months === 1 ? "mês" : "meses"} (${days} dias)`;
}

export function formatWhatsAppUrl(phone?: string | null, name = ""): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return null;
  const fullNum = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  const text = encodeURIComponent(`Olá, ${name}! Tudo bem?`);
  return `https://wa.me/${fullNum}?text=${text}`;
}

export function isProductionUpdatePending(lastUpdateStr?: string | null, now = new Date()): boolean {
  if (!lastUpdateStr) return true;
  const lastUpdate = new Date(lastUpdateStr);
  if (isNaN(lastUpdate.getTime())) return true;
  const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 7;
}

export type StudentFilterOptions = {
  search?: string;
  agency?: string;
  cert?: string;
  sort?: "nome" | "maior_nota" | "menor_nota";
};

export function filterAndSortStudents(
  students: StudentItem[],
  options: StudentFilterOptions = {},
  scores: Record<string, number> = {},
): StudentItem[] {
  const search = (options.search || "").toLowerCase().trim();
  const agency = options.agency || "todas";
  const cert = options.cert || "todas";
  const sort = options.sort || "nome";

  const filtered = students.filter((s) => {
    const prof = getStudentProfile(s);
    const nameMatch = !search || s.nome.toLowerCase().includes(search) || (prof.funcional || "").toLowerCase().includes(search);
    const agencyMatch = agency === "todas" || (prof.agencia || "").toLowerCase() === agency.toLowerCase();
    
    let certMatch = true;
    if (cert === "sem") {
      certMatch = !prof.certificacao || prof.certificacao === "Sem certificação";
    } else if (cert !== "todas") {
      certMatch = (prof.certificacao || "").toLowerCase().includes(cert.toLowerCase());
    }

    return nameMatch && agencyMatch && certMatch;
  });

  return filtered.sort((a, b) => {
    if (sort === "maior_nota" || sort === "menor_nota") {
      const scoreA = scores[a.id] ?? 0;
      const scoreB = scores[b.id] ?? 0;
      if (scoreA !== scoreB) {
        return sort === "maior_nota" ? scoreB - scoreA : scoreA - scoreB;
      }
    }
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}
