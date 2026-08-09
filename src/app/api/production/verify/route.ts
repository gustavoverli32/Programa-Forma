import { markProductionVerified } from "@/domain/production-deadline";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  authorizeStudentWrite,
  ProductionHttpError,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";
import { loadProductionConfig } from "@/server/production-context";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const body = (await request.json().catch(() => null)) as
      | { studentId?: unknown }
      | null;
    const studentId = String(body?.studentId ?? "");
    if (!/^[a-zA-Z0-9-]{1,128}$/.test(studentId)) {
      throw new ProductionHttpError("Estagiario invalido.", 400);
    }

    const supabase = createSupabaseAdminClient();
    const student = await authorizeStudentWrite(supabase, session, studentId);
    const config = await loadProductionConfig(supabase);
    const verification = markProductionVerified(
      (student.perfil ?? {}) as Record<string, unknown>,
      config,
    );
    const { error } = await supabase
      .from("estagiarios")
      .update({ perfil: verification.profile as Json })
      .eq("id", studentId);
    if (error) throw error;

    return Response.json(verification);
  } catch (error) {
    return productionErrorResponse(error);
  }
}
