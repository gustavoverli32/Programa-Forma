import { buildAssistantResultsContext } from "@/domain/assistant-context";
import {
  isStudentAssignedToManager,
  isStudentInRegional,
  type StudentReadRow,
} from "@/domain/read-model";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  loadSessionManager,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";

const MAX_REQUEST_SIZE = 160_000;
const DEFAULT_AI_FUNCTION_URL =
  "https://hbebkripmytkknqydjpt.supabase.co/functions/v1/ai-assistant";

async function buildPlatformContext(
  session: Awaited<ReturnType<typeof requireProductionSession>>,
) {
  const supabase = createSupabaseAdminClient();
  const [studentsResult, meetingsResult] = await Promise.all([
    supabase
      .from("estagiarios")
      .select(
        "id,nome,meses,obs,atencao,perfil,trilha_checks,gestor_funcional,regional_id,created_at,arquivado_em,arquivado_por,motivo_arquivamento,excluir_em",
      )
      .order("created_at"),
    supabase
      .from("encontros")
      .select("id,titulo,descricao,data")
      .order("data", { ascending: true }),
  ]);
  if (studentsResult.error) throw studentsResult.error;
  if (meetingsResult.error) throw meetingsResult.error;

  let students = (studentsResult.data ?? []) as StudentReadRow[];
  if (session.role === "gestor") {
    const manager = await loadSessionManager(supabase, session);
    const permissions = (manager.permissoes ?? {}) as Record<string, unknown>;
    const hasRegional = Boolean(manager.regional_id);
    const isRegionalLeader =
      manager.tipo_gestor === "lider_regional" || manager.tipo_gestor === "gga";
    const scopedToRegional =
      hasRegional &&
      (String(permissions.escopo ?? "") === "regional" || isRegionalLeader);
    const seesAll =
      !scopedToRegional &&
      (manager.tipo_gestor === "gga" || permissions.todos_estagiarios === true);

    students = students.filter(
      (student) =>
        seesAll ||
        isStudentAssignedToManager(student, String(manager.funcional ?? "")) ||
        (scopedToRegional && isStudentInRegional(student, manager.regional_id)),
    );
  }

  const studentIds = students.map((student) => student.id);
  const productionResult = studentIds.length
    ? await supabase
        .from("producao_trimestral")
        .select("id,estagiario_id,tri_ref,meta,producao")
        .in("estagiario_id", studentIds)
    : { data: [], error: null };
  if (productionResult.error) throw productionResult.error;

  return {
    ...buildAssistantResultsContext(students, productionResult.data ?? []),
    agendamentos: meetingsResult.data ?? [],
  };
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireProductionSession();
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_SIZE) {
      return Response.json({ error: "Solicitacao muito grande." }, { status: 413 });
    }

    const body = await request.text();
    if (!body || body.length > MAX_REQUEST_SIZE) {
      return Response.json({ error: "Solicitacao invalida." }, { status: 400 });
    }

    const parsedBody = JSON.parse(body) as Record<string, unknown>;
    const textQuery = String(
      parsedBody.pergunta ||
        parsedBody.message ||
        parsedBody.question ||
        parsedBody.prompt ||
        "",
    ).trim();
    if (!textQuery) {
      return Response.json({ error: "Pergunta obrigatoria." }, { status: 400 });
    }

    const functionUrl =
      process.env.SUPABASE_AI_FUNCTION_URL || DEFAULT_AI_FUNCTION_URL;
    const authorizationKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!authorizationKey) {
      throw new Error("Credencial interna do assistente indisponivel.");
    }
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorizationKey}`,
        apikey: authorizationKey,
      },
      body: JSON.stringify({
        pergunta: textQuery,
        contexto: await buildPlatformContext(session),
        historico: Array.isArray(parsedBody.historico)
          ? parsedBody.historico.slice(-8)
          : [],
      }),
      cache: "no-store",
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
