import { parseUuid } from "@/domain/admin-mutations";
import { archiveExpiryDate, parseArchiveReason } from "@/domain/student-archive";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  authorizeStudentWrite,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const id = parseUuid((await params).id, "Estagiario");
    const reason = parseArchiveReason(await request.json().catch(() => null));
    const supabase = createSupabaseAdminClient();
    await authorizeStudentWrite(supabase, session, id);

    const archivedAt = new Date();
    const { data, error } = await supabase
      .from("estagiarios")
      .update({
        arquivado_em: archivedAt.toISOString(),
        arquivado_por: session.subject,
        motivo_arquivamento: reason,
        excluir_em: archiveExpiryDate(archivedAt).toISOString(),
      })
      .eq("id", id)
      .is("arquivado_em", null)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return Response.json({ error: "Este estagiario ja foi arquivado." }, { status: 409 });
    }
    return Response.json({ student: data });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
