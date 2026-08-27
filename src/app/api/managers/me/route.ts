import { parseManagerSelf } from "@/domain/admin-mutations";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { hashManagerPassword, safeManager } from "@/server/manager-security";
import {
  assertSameOrigin,
  loadSessionManager,
  ProductionHttpError,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const input = parseManagerSelf(await request.json().catch(() => null));
    const supabase = createSupabaseAdminClient();
    const manager = await loadSessionManager(supabase, session);
    const { data: duplicate, error: duplicateError } = await supabase
      .from("gestores")
      .select("id")
      .eq("funcional", input.employeeCode)
      .neq("id", manager.id)
      .maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) throw new ProductionHttpError("Ja existe outro gestor com este funcional.", 409);
    const update = {
      nome: input.name,
      funcional: input.employeeCode,
      ...(input.password ? { senha_hash: hashManagerPassword(input.password) } : {}),
    };
    const { data, error } = await supabase
      .from("gestores")
      .update(update)
      .eq("id", manager.id)
      .select("id,nome,funcional,agencia,permissoes,tipo_gestor,regional_id")
      .single();
    if (error) throw error;
    return Response.json({ manager: safeManager(data) });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
