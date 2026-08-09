import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  type SessionPayload,
  verifySessionToken,
} from "@/lib/session";

export class ProductionHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function requireProductionSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) throw new ProductionHttpError("Faca login novamente.", 401);
  return session;
}

export function requireTutorSession(session: SessionPayload) {
  if (session.role !== "tutora") {
    throw new ProductionHttpError("Apenas a tutora pode concluir esta operacao.", 403);
  }
}

export async function loadSessionManager(
  supabase: SupabaseClient,
  session: SessionPayload,
) {
  if (session.role !== "gestor") {
    throw new ProductionHttpError("Gestor nao autenticado.", 403);
  }
  const { data: manager, error } = await supabase
    .from("gestores")
    .select("id,nome,funcional,permissoes,tipo_gestor")
    .eq("id", session.subject)
    .maybeSingle();
  if (error) throw error;
  if (!manager) throw new ProductionHttpError("Gestor nao encontrado.", 403);
  return manager;
}

export async function requireTutorOrGga(
  supabase: SupabaseClient,
  session: SessionPayload,
) {
  if (session.role === "tutora") return null;
  const manager = await loadSessionManager(supabase, session);
  if (manager.tipo_gestor !== "gga") {
    throw new ProductionHttpError("Apenas a tutora ou um GGA pode concluir esta operacao.", 403);
  }
  return manager;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new ProductionHttpError("Origem da solicitacao invalida.", 403);
  }
}

export async function authorizeStudentWrite(
  supabase: SupabaseClient,
  session: SessionPayload,
  studentId: string,
) {
  const { data: student, error: studentError } = await supabase
    .from("estagiarios")
    .select("id,perfil")
    .eq("id", studentId)
    .maybeSingle();
  if (studentError) throw studentError;
  if (!student) throw new ProductionHttpError("Estagiario nao encontrado.", 404);

  if (session.role === "tutora") return student;

  const { data: manager, error: managerError } = await supabase
    .from("gestores")
    .select("id,funcional,permissoes,tipo_gestor")
    .eq("id", session.subject)
    .maybeSingle();
  if (managerError) throw managerError;
  if (!manager) throw new ProductionHttpError("Gestor nao encontrado.", 403);

  const permissions = (manager.permissoes ?? {}) as Record<string, unknown>;
  const profile = (student.perfil ?? {}) as Record<string, unknown>;
  const managerCode = String(manager.funcional ?? "");
  const canWrite =
    manager.tipo_gestor === "gga" ||
    permissions.todos_estagiarios === true ||
    String(profile.ga_funcional ?? "") === managerCode ||
    String(profile.gga_funcional ?? "") === managerCode;

  if (!canWrite) {
    throw new ProductionHttpError("Sem permissao para este estagiario.", 403);
  }
  return student;
}

export function productionErrorResponse(error: unknown) {
  if (error instanceof ProductionHttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Erro seguro de producao:", error);
  return Response.json(
    { error: "Nao foi possivel concluir a operacao agora." },
    { status: 503 },
  );
}
