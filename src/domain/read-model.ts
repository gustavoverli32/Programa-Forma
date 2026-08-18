import type { Json } from "@/types/database";

export type StudentReadRow = {
  id: string;
  nome: string;
  meses: string[] | null;
  obs: string | null;
  atencao: boolean | null;
  perfil: Json | null;
  trilha_checks: Json | null;
  gestor_funcional: string | null;
  regional_id?: string | null;
  created_at: string | null;
  arquivado_em?: string | null;
  arquivado_por?: string | null;
  motivo_arquivamento?: string | null;
  excluir_em?: string | null;
};

const PUBLIC_PROFILE_FIELDS = [
  "agencia",
  "inicio",
  "certificacao",
  "mes_aniversario",
  "dia_aniversario",
  "trilha_manual",
] as const;

function objectValue(value: Json | null) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json | undefined>)
    : {};
}

function preserveCase(source: string, replacement: string) {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  return source[0] === source[0]?.toUpperCase()
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;
}

export function publicStudent(row: StudentReadRow) {
  const sourceProfile = objectValue(row.perfil);
  const perfil = Object.fromEntries(
    PUBLIC_PROFILE_FIELDS.flatMap((key) =>
      sourceProfile[key] === undefined ? [] : [[key, sourceProfile[key]]],
    ),
  );

  return {
    id: row.id,
    nome: row.nome,
    meses: row.meses,
    obs: "",
    atencao: false,
    perfil,
    trilha_checks: {},
    regional_id: row.regional_id ?? null,
    created_at: row.created_at,
    arquivado_em: row.arquivado_em ?? null,
    excluir_em: row.excluir_em ?? null,
  };
}

export function privateStudent(row: StudentReadRow) {
  return {
    id: row.id,
    nome: row.nome,
    meses: row.meses,
    obs: row.obs,
    atencao: row.atencao,
    perfil: row.perfil,
    trilha_checks: row.trilha_checks,
    gestor_funcional: row.gestor_funcional,
    regional_id: row.regional_id ?? null,
    created_at: row.created_at,
    arquivado_em: row.arquivado_em ?? null,
    arquivado_por: row.arquivado_por ?? null,
    motivo_arquivamento: row.motivo_arquivamento ?? null,
    excluir_em: row.excluir_em ?? null,
  };
}

export function isStudentAssignedToManager(
  row: StudentReadRow,
  employeeCode: string,
) {
  const profile = objectValue(row.perfil);
  return (
    String(profile.ga_funcional ?? "") === employeeCode ||
    String(profile.gga_funcional ?? "") === employeeCode ||
    String(row.gestor_funcional ?? "") === employeeCode
  );
}

export function isStudentInRegional(
  row: StudentReadRow,
  regionalId?: string | null,
) {
  if (!regionalId) return true;
  return String(row.regional_id ?? "") === String(regionalId);
}

export function sanitizeProjectTexts(value: Json | null) {
  const texts = objectValue(value);
  return Object.fromEntries(
    Object.entries(texts).map(([key, item]) => [
      key,
      typeof item === "string"
        ? item
            .replace(/\bmetas atingidas\b/gi, (match) =>
              preserveCase(match, "alvos atingidos"),
            )
            .replace(/\bmeta atingida\b/gi, (match) =>
              preserveCase(match, "alvo atingido"),
            )
            .replace(/\bmetas?\b/gi, (match) =>
              preserveCase(
                match,
                match.toLocaleLowerCase("pt-BR").endsWith("s")
                  ? "alvos"
                  : "alvo",
              ),
            )
        : item,
    ]),
  );
}
