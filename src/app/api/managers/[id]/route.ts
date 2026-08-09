import { parseManagerAdmin, parseUuid } from "@/domain/admin-mutations";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { hashManagerPassword, safeManager } from "@/server/manager-security";
import {
  assertSameOrigin,
  productionErrorResponse,
  requireProductionSession,
  requireTutorSession,
} from "@/server/production-access";
import type { Json } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    requireTutorSession(session);
    const id = parseUuid((await params).id, "Gestor");
    const input = parseManagerAdmin(await request.json().catch(() => null));
    const update = {
      permissoes: input.permissions as Json,
      tipo_gestor: input.managerType,
      ...(input.password ? { senha_hash: hashManagerPassword(input.password) } : {}),
    };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("gestores")
      .update(update)
      .eq("id", id)
      .select("id,nome,funcional,permissoes,tipo_gestor")
      .single();
    if (error) throw error;
    return Response.json({ manager: safeManager(data) });
  } catch (error) {
    return productionErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    requireTutorSession(session);
    const id = parseUuid((await params).id, "Gestor");
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("gestores").delete().eq("id", id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
