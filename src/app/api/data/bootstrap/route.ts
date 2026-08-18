import {
  isStudentAssignedToManager,
  isStudentInRegional,
  privateStudent,
  publicStudent,
  sanitizeProjectTexts,
  type StudentReadRow,
} from "@/domain/read-model";
import { normalizeProductionAuditHistory } from "@/domain/production-audit";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  getProductionSession,
  productionErrorResponse,
} from "@/server/production-access";

async function fetchAllStudents(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
): Promise<StudentReadRow[]> {
  const PAGE_SIZE = 1000;
  let from = 0;
  let hasMore = true;
  const allStudents: StudentReadRow[] = [];

  while (hasMore) {
    const { data, error } = await supabase
      .from("estagiarios")
      .select(
        "id,nome,meses,obs,atencao,perfil,trilha_checks,gestor_funcional,regional_id,created_at,arquivado_em,arquivado_por,motivo_arquivamento,excluir_em",
      )
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Erro ao paginar estagiarios:", error);
      throw error;
    }

    if (data && data.length > 0) {
      allStudents.push(...(data as StudentReadRow[]));
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        from += PAGE_SIZE;
      }
    } else {
      hasMore = false;
    }
  }

  return allStudents;
}

async function fetchAllProductionForStudents(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  studentIds: string[],
): Promise<unknown[]> {
  if (studentIds.length === 0) return [];

  const PAGE_SIZE = 1000;
  const CHUNK_SIZE = 50;
  const allRows: unknown[] = [];

  for (let i = 0; i < studentIds.length; i += CHUNK_SIZE) {
    const chunk = studentIds.slice(i, i + CHUNK_SIZE);
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("producao_trimestral")
        .select("id,estagiario_id,tri_ref,meta,producao,created_at")
        .in("estagiario_id", chunk)
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Erro ao paginar producao_trimestral:", error);
        throw error;
      }

      if (data && data.length > 0) {
        allRows.push(...data);
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        } else {
          from += PAGE_SIZE;
        }
      } else {
        hasMore = false;
      }
    }
  }

  return allRows;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getProductionSession();

    const supabase = createSupabaseAdminClient();

    const [
      settingsResult,
      descriptionsResult,
      rows,
      configResult,
      managersResult,
      meetingsResult,
      regionaisResult,
    ] = await Promise.all([
      supabase
        .from("configuracoes")
        .select("id,valor")
        .in("id", [
          "timeline",
          "textos_projeto",
          "checklist_mensal",
          "historico_pendencias_producao",
        ]),
      supabase
        .from("descricao_projeto")
        .select("id,titulo,conteudo,ordem,created_at")
        .order("ordem"),
      fetchAllStudents(supabase),
      supabase
        .from("configuracoes")
        .select("valor")
        .eq("id", "cfg_geral")
        .maybeSingle(),
      supabase
        .from("gestores")
        .select("id,nome,funcional,agencia,permissoes,tipo_gestor,regional_id,created_at")
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

    if (!session) {
      return Response.json(
        {
          regionais: regionaisResult.data ?? [],
          students: [],
          archivedStudents: [],
          timeline: settings.get("timeline") ?? null,
          config: configResult.data?.valor ?? {},
          projectTexts: sanitizeProjectTexts(
            settings.get("textos_projeto") ?? null,
          ),
          monthlyChecklist: settings.get("checklist_mensal") ?? { enabled: true },
          productionAuditHistory: [],
          managers: [],
          production: [],
          descriptions: descriptionsResult.data ?? [],
          meetings: [],
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

    const activeRows = rows.filter((row) => !row.arquivado_em);
    const archivedRows = rows.filter((row) => Boolean(row.arquivado_em));
    let students: Array<
      ReturnType<typeof publicStudent> | ReturnType<typeof privateStudent>
    > = activeRows.map(privateStudent);
    let archivedStudents = archivedRows.map(privateStudent);
    let readableStudentIds = new Set(rows.map((row) => row.id));
    let canAccessSettings = session.role === "tutora";
    if (session.role === "gestor" && currentManager) {
      const permissions = (currentManager.permissoes ?? {}) as Record<
        string,
        unknown
      >;
      canAccessSettings = permissions.configuracoes === true;
      const hasRegional = Boolean(currentManager.regional_id);
      const isLiderRegional = currentManager.tipo_gestor === "lider_regional" || currentManager.tipo_gestor === "gga";
      const scopedToRegional = hasRegional && (String(permissions.escopo ?? "") === "regional" || isLiderRegional);
      
      const seesAll = !scopedToRegional && (currentManager.tipo_gestor === "gga" || permissions.todos_estagiarios === true);
      
      readableStudentIds = new Set(
        rows
          .filter(
            (row) =>
              seesAll ||
              isStudentAssignedToManager(
                row,
                String(currentManager.funcional ?? ""),
              ) ||
              (scopedToRegional && isStudentInRegional(row, currentManager.regional_id))
          )
          .map((row) => row.id),
      );
      students = activeRows.map((row) =>
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
      archivedStudents = archivedRows
        .filter((row) => readableStudentIds.has(row.id))
        .map(privateStudent);
    }

    const productionData = await fetchAllProductionForStudents(
      supabase,
      Array.from(readableStudentIds),
    );

    return Response.json(
      {
        regionais: regionaisResult.data ?? [],
        students,
        archivedStudents,
        timeline: settings.get("timeline") ?? null,
        config: configResult.data?.valor ?? {},
        projectTexts: sanitizeProjectTexts(
          settings.get("textos_projeto") ?? null,
        ),
        monthlyChecklist: settings.get("checklist_mensal") ?? { enabled: true },
        productionAuditHistory:
          canAccessSettings
            ? normalizeProductionAuditHistory(
                settings.get("historico_pendencias_producao"),
              )
            : [],
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
