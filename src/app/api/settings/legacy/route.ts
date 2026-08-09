import { parseLegacySetting } from "@/domain/admin-mutations";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  productionErrorResponse,
  requireProductionSession,
  requireTutorSession,
} from "@/server/production-access";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    requireTutorSession(session);
    const input = parseLegacySetting(await request.json().catch(() => null));
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("configuracoes")
      .upsert({ id: input.key, valor: input.value });
    if (error) throw error;
    return Response.json({ ok: true, value: input.value });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
