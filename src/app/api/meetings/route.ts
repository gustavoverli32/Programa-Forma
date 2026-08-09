import { parseMeeting } from "@/domain/admin-mutations";
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
    const input = parseMeeting(await request.json().catch(() => null));
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("encontros")
      .insert({ titulo: input.title, data: input.date, descricao: input.description })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ meeting: data }, { status: 201 });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
