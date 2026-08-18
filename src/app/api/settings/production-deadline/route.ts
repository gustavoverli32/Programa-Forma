import { getCurrentProductionDeadline, getWeekStartYmd, isYmd } from "@/domain/production-deadline";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  ProductionHttpError,
  productionErrorResponse,
  requireProductionSession,
  requireTutorOrManagerPermission,
} from "@/server/production-access";
import { loadProductionConfig } from "@/server/production-context";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const body = (await request.json().catch(() => null)) as
      | { deadline?: unknown }
      | null;
    if (!isYmd(body?.deadline)) {
      throw new ProductionHttpError("Selecione uma data valida.", 400);
    }

    const supabase = createSupabaseAdminClient();
    await requireTutorOrManagerPermission(supabase, session, "configuracoes");
    const current = await loadProductionConfig(supabase);
    const config = {
      ...current,
      prazo_producao_manual: body.deadline,
      prazo_producao_manual_semana: getWeekStartYmd(),
      prazo_producao: body.deadline,
      ultimo_prazo_producao: body.deadline,
    };
    const { error } = await supabase
      .from("configuracoes")
      .upsert({ id: "cfg_geral", valor: config });
    if (error) throw error;

    return Response.json({
      config,
      deadline: getCurrentProductionDeadline(config),
    });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
