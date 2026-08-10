import { parseContactsBatchInput } from "@/domain/contacts";
import { localYmd } from "@/domain/production-deadline";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  authorizeStudentWrite,
  ProductionHttpError,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const body = await request.json().catch(() => null);
    let input;
    try {
      input = parseContactsBatchInput(body);
    } catch (error) {
      throw new ProductionHttpError(
        error instanceof Error ? error.message : "Dados de contatos invalidos.",
        400,
      );
    }

    const supabase = createSupabaseAdminClient();
    const student = await authorizeStudentWrite(supabase, session, input.studentId);
    const rowsToSave = [
      {
        estagiario_id: student.id,
        tri_ref: "CONTATO-META",
        meta: input.dailyTarget,
        producao: 0,
      },
      ...input.days.map((day) => ({
        estagiario_id: student.id,
        tri_ref: `CONTATO-${input.weekRef}-D${day.dayIndex}`,
        meta: 0,
        producao: day.value,
      })),
    ];
    const { data: contactRows, error: contactsError } = await supabase
      .from("producao_trimestral")
      .upsert(rowsToSave, { onConflict: "estagiario_id,tri_ref" })
      .select();
    if (contactsError) throw contactsError;

    const profile = {
      ...((student.perfil ?? {}) as Record<string, unknown>),
      ultima_atualizacao_prod: localYmd(),
    };
    const { error: profileError } = await supabase
      .from("estagiarios")
      .update({ perfil: profile as Json })
      .eq("id", student.id);
    if (profileError) throw profileError;

    return Response.json({ contactRows, profile });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
