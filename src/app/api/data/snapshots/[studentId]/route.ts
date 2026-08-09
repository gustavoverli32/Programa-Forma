import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  authorizeStudentWrite,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ studentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireProductionSession();
    const { studentId } = await context.params;
    if (!studentId || studentId.length > 100) {
      return Response.json({ error: "Estagiario invalido." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    await authorizeStudentWrite(supabase, session, studentId);
    const { data, error } = await supabase
      .from("snapshots")
      .select(
        "id,estagiario_id,tri_ref,meta,total_producao,score,score_producao,score_trilha,created_at",
      )
      .eq("estagiario_id", studentId)
      .order("tri_ref", { ascending: true });
    if (error) throw error;

    return Response.json(
      { snapshots: data ?? [] },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return productionErrorResponse(error);
  }
}
