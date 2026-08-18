import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  productionErrorResponse,
  requireProductionSession,
  requireTutorOrManagerPermission,
} from "@/server/production-access";
import { ensureLatestProductionAudit } from "@/server/production-audit";
import { loadProductionConfig } from "@/server/production-context";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const supabase = createSupabaseAdminClient();
    await requireTutorOrManagerPermission(supabase, session, "configuracoes");
    const config = await loadProductionConfig(supabase);
    const history = await ensureLatestProductionAudit(supabase, config);
    return Response.json({ history });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
