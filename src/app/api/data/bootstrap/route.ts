import {
  isStudentAssignedToManager,
  privateStudent,
  publicStudent,
  sanitizeProjectTexts,
  type StudentReadRow,
} from "@/domain/read-model";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  getProductionSession,
  productionErrorResponse,
} from "@/server/production-access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const session = await getProductionSession();

    const [
      settingsResult,
      descriptionsResult,
      studentsResult,
      configResult,
      managersResult,
      productionResult,
      meetingsResult,
    ] = await Promise.all([
      supabase
        .from("configuracoes")
        .select("id,valor")
        .in("id", ["timeline", "textos_projeto"]),
      supabase
        .from("descricao_projeto")
        .select("id,titulo,conteudo,ordem,created_at")
        .order("ordem"),
      supabase
        .from("estagiarios")
        .select(
          "id,nome,meses,obs,atencao,perfil,trilha_checks,gestor_funcional,created_at",
        )
        .order("created_at"),
      supabase
        .from("configuracoes")
        .select("valor")
        .eq("id", "cfg_geral")
        .maybeSingle(),
      supabase
        .from("gestores")
        .select("id,nome,funcional,permissoes,tipo_gestor,created_at")
        .order("nome"),
      supabase
        .from("producao_trimestral")
        .select("id,estagiario_id,tri_ref,meta,producao,created_at"),
      supabase
        .from("encontros")
        .select("id,titulo,descricao,data,created_at")
        .order("data", { ascending: true }),
    ]);

    const settings = new Map(
      (settingsResult.data ?? []).map((item) => [item.id, item.valor]),
    );

    const rows = (studentsResult.data ?? []) as StudentReadRow[];

    if (!session) {
      return Response.json(
        {
          students: rows.map(publicStudent),
          timeline: settings.get("timeline") ?? null,
          config: configResult.data?.valor ?? {},
          projectTexts: sanitizeProjectTexts(
            settings.get("textos_projeto") ?? null,
          ),
          managers: [],
          production: productionResult.data ?? [],
          descriptions: descriptionsResult.data ?? [],
          meetings: meetingsResult.data ?? [],
          session: null,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const managers = managersResult.data ?? [];
    const currentManager =
      session.role === "gestor"
        ? managers.find((manager) => manager.id === session.subject) ?? null
        : null;

    if (session.role === "gestor" && !currentManager) {
      return Response.json({ error: "Gestor nao encontrado." }, { status: 403 });
    }

    let students: Array<
      ReturnType<typeof publicStudent> | ReturnType<typeof privateStudent>
    > = rows.map(privateStudent);
    let readableStudentIds = new Set(rows.map((row) => row.id));
    if (session.role === "gestor" && currentManager) {
      const permissions = (currentManager.permissoes ?? {}) as Record<
        string,
        unknown
      >;
      const seesAll =
        currentManager.tipo_gestor === "gga" ||
        permissions.todos_estagiarios === true;
      readableStudentIds = new Set(
        rows
          .filter(
            (row) =>
              seesAll ||
              isStudentAssignedToManager(
                row,
                String(currentManager.funcional ?? ""),
              ),
          )
          .map((row) => row.id),
      );
      students = rows.map((row) =>
        seesAll ||
        isStudentAssignedToManager(row, String(currentManager.funcional ?? ""))
          ? privateStudent(row)
          : publicStudent(row),
      );
    }

    return Response.json(
      {
        students,
        timeline: settings.get("timeline") ?? null,
        config: configResult.data?.valor ?? {},
        projectTexts: sanitizeProjectTexts(
          settings.get("textos_projeto") ?? null,
        ),
        managers,
        production: (productionResult.data ?? []).filter((row) =>
          row.estagiario_id
            ? readableStudentIds.has(row.estagiario_id)
            : false,
        ),
        descriptions: descriptionsResult.data ?? [],
        meetings: meetingsResult.data ?? [],
        session:
          session.role === "tutora"
            ? { role: "tutora" as const }
            : { role: "gestor" as const, manager: currentManager },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return productionErrorResponse(error);
  }
}
