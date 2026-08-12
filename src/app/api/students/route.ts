import { parseStudentMutation } from "@/domain/admin-mutations";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  loadSessionManager,
  ProductionHttpError,
  productionErrorResponse,
  requireProductionSession,
  requireTutorOrGga,
} from "@/server/production-access";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const input = parseStudentMutation(await request.json().catch(() => null));
    const supabase = createSupabaseAdminClient();
    await requireTutorOrGga(supabase, session);

    const employeeCode = String((input.profile as Record<string, Json>).funcional ?? "");
    const { data: duplicate, error: duplicateError } = await supabase
      .from("estagiarios")
      .select("id")
      .eq("perfil->>funcional", employeeCode)
      .limit(1)
      .maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) throw new ProductionHttpError("Ja existe um estagiario com este funcional.", 409);

    let defaultRegionalId: string | null = null;
    if (session.role === "gestor") {
      const manager = await loadSessionManager(supabase, session);
      defaultRegionalId = manager.regional_id ?? null;
    }

    const { data, error } = await supabase
      .from("estagiarios")
      .insert({
        nome: input.name,
        meses: input.months,
        obs: input.notes,
        atencao: input.attention,
        perfil: input.profile,
        trilha_checks: input.trailChecks,
        regional_id: input.regionalId || defaultRegionalId,
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ student: data }, { status: 201 });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
