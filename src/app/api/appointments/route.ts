import { parseAppointment } from "@/domain/admin-mutations";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  loadSessionManager,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireProductionSession();
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("agendamentos")
      .select(
        "id,titulo,descricao,data,tipo,fase_alvo,gestor_id,gestor_nome,arquivo_url,arquivo_nome,presenca,created_at,updated_at",
      )
      .order("data", { ascending: false });
    if (error) throw error;
    return Response.json(
      { appointments: data ?? [] },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return productionErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const input = parseAppointment(await request.json().catch(() => null));
    const supabase = createSupabaseAdminClient();
    const actor =
      session.role === "tutora"
        ? { id: "tutora", name: "Tutora Kamilla" }
        : await loadSessionManager(supabase, session).then((manager) => ({
            id: manager.id,
            name: manager.nome,
          }));
    const { data, error } = await supabase
      .from("agendamentos")
      .insert({
        gestor_id: actor.id,
        gestor_nome: actor.name,
        titulo: input.title,
        descricao: input.description,
        data: input.date,
        tipo: input.type,
        fase_alvo: input.targetPhase,
        arquivo_url: input.fileUrl,
        arquivo_nome: input.fileName,
        presenca: input.presence,
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ appointment: data }, { status: 201 });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
