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

export async function GET(request: Request) {
  try {
    let session = await getProductionSession();

    const supabase = createSupabaseAdminClient();

    const [
      settingsResult,
      descriptionsResult,
      studentsResult,
      configResult,
      managersResult,
      meetingsResult,
      regionaisResult,
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
          "id,nome,meses,obs,atencao,perfil,trilha_checks,gestor_funcional,regional_id,created_at",
        )
        .order("created_at"),
      supabase
        .from("configuracoes")
        .select("valor")
        .eq("id", "cfg_geral")
        .maybeSingle(),
      supabase
        .from("gestores")
        .select("id,nome,funcional,permissoes,tipo_gestor,regional_id,created_at")
        .order("nome"),

      supabase
        .from("encontros")
        .select("id,titulo,descricao,data,created_at")
        .order("data", { ascending: true }),
      supabase
        .from("regionais")
        .select("id,slug,nome,ativa,created_at")
        .eq("ativa", true)
        .order("nome"),
    ]);

    const settings = new Map(
      (settingsResult.data ?? []).map((item) => [item.id, item.valor]),
    );

    const rows = (studentsResult.data ?? []) as StudentReadRow[];

    if (!session) {
      return Response.json(
        {
          regionais: regionaisResult.data ?? [],
          students: rows.map(publicStudent),
          timeline: settings.get("timeline") ?? null,
          config: configResult.data?.valor ?? {},
          projectTexts: sanitizeProjectTexts(
            settings.get("textos_projeto") ?? null,
          ),
          managers: [],
          production: [],
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
              ) ||
              (Boolean(currentManager.regional_id) &&
                String(row.regional_id ?? "") ===
                  String(currentManager.regional_id)),
          )
          .map((row) => row.id),
      );
      students = rows.map((row) =>
        seesAll ||
        isStudentAssignedToManager(
          row,
          String(currentManager.funcional ?? ""),
        ) ||
        (Boolean(currentManager.regional_id) &&
          String(row.regional_id ?? "") === String(currentManager.regional_id))
          ? privateStudent(row)
          : publicStudent(row),
      );
    }

    let productionData: any[] = [];
    const studentIdsArr = Array.from(readableStudentIds);
    if (studentIdsArr.length > 0) {
      const chunkSize = 50;
      const promises = [];
      for (let i = 0; i < studentIdsArr.length; i += chunkSize) {
        promises.push(
          supabase
            .from("producao_trimestral")
            .select("id,estagiario_id,tri_ref,meta,producao,created_at")
            .in("estagiario_id", studentIdsArr.slice(i, i + chunkSize))
            .limit(1000)
        );
      }
      const results = await Promise.all(promises);
      for (const res of results) {
        if (res.data) productionData.push(...res.data);
      }
    }

    return Response.json(
      {
        regionais: regionaisResult.data ?? [],
        students,
        timeline: settings.get("timeline") ?? null,
        config: configResult.data?.valor ?? {},
        projectTexts: sanitizeProjectTexts(
          settings.get("textos_projeto") ?? null,
        ),
        managers,
        production: productionData,
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
