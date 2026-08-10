import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const MAX_REQUEST_SIZE = 160_000;
const DEFAULT_AI_FUNCTION_URL =
  "https://hbebkripmytkknqydjpt.supabase.co/functions/v1/ai-assistant";
const DEFAULT_SUPABASE_KEY = "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

async function buildPlatformContext() {
  try {
    const supabase = createSupabaseAdminClient();
    const [studentsRes, prodRes, meetingsRes] = await Promise.all([
      supabase
        .from("estagiarios")
        .select("id,nome,perfil,atencao,obs")
        .order("created_at"),
      supabase
        .from("producao_trimestral")
        .select("id,estagiario_id,tri_ref,meta,producao"),
      supabase
        .from("encontros")
        .select("id,titulo,descricao,data")
        .order("data", { ascending: true }),
    ]);

    const students = studentsRes.data || [];
    const prodRows = prodRes.data || [];
    const meetings = meetingsRes.data || [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQ = Math.floor(now.getMonth() / 3) + 1;
    const currentQuarterRef = `${currentYear}-Q${currentQ}`;
    const todayYMD = now.toISOString().split("T")[0];

    const estagiariosFormatted = students.map((s) => {
      const perfil = (s.perfil ?? {}) as Record<string, unknown>;
      const studentProd = prodRows.filter(
        (p) => String(p.estagiario_id) === String(s.id),
      );

      let creditTotal = 0;
      const prodTotal = 0;
      let target = 0;

      let inss = 0;
      let op = 0;
      let ep = 0;
      let creditario = 0;

      let seguros = 0;
      let pic = 0;
      let combinaqui = 0;
      let consorcios = 0;
      let engajamento = 0;

      studentProd.forEach((p) => {
        const val = parseFloat(String(p.producao || 0)) || 0;
        const ref = String(p.tri_ref || "");

        if (ref === currentQuarterRef) {
          target = parseFloat(String(p.meta || 0)) || 0;
          if (val > 0 && creditTotal === 0) creditTotal += val;
        } else if (ref.includes("-MOD0")) {
          inss += val;
        } else if (ref.includes("-MOD1")) {
          op += val;
        } else if (ref.includes("-MOD2")) {
          ep += val;
        } else if (ref.includes("-MOD3")) {
          creditario += val;
        } else if (ref.includes("-OUT0")) {
          seguros += val;
        } else if (ref.includes("-OUT1")) {
          pic += val;
        } else if (ref.includes("-OUT2")) {
          combinaqui += val;
        } else if (ref.includes("-OUT3")) {
          consorcios += val;
        } else if (ref.includes("-OUT4")) {
          engajamento += val;
        }
      });

      const modalCreditTotal = inss + op + ep + creditario;
      const modalProdTotal = seguros + pic + combinaqui + consorcios + engajamento;

      return {
        id: s.id,
        nome: s.nome,
        agencia: perfil.agencia || null,
        funcional: perfil.funcional || null,
        inicio: perfil.inicio || null,
        certificacao: perfil.certificacao || "sem certificação",
        meta_trimestre: target,
        producao_credito_total: modalCreditTotal > 0 ? modalCreditTotal : creditTotal,
        producao_credito: {
          INSS: inss,
          OP: op,
          EP: ep,
          Creditario: creditario,
        },
        producao_produtos_total: modalProdTotal > 0 ? modalProdTotal : prodTotal,
        producao_produtos: {
          Seguros: seguros,
          PIC: pic,
          Combinaqui: combinaqui,
          Consorcios: consorcios,
          Engajamento: engajamento,
        },
        sinalizacao_atencao: s.atencao || false,
      };
    });

    return {
      data_atual: todayYMD,
      total_estagiarios: students.length,
      trimestre_atual: currentQuarterRef,
      estagiarios: estagiariosFormatted,
      agendamentos: meetings.map((m) => ({
        id: m.id,
        titulo: m.titulo,
        descricao: m.descricao,
        data: m.data,
      })),
    };
  } catch (err) {
    console.error("Erro ao gerar contexto para IA:", err);
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(
      cookieStore.get(SESSION_COOKIE_NAME)?.value,
    );

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_SIZE) {
      return Response.json(
        { error: "Solicitacao muito grande." },
        { status: 413 },
      );
    }

    const body = await request.text();
    if (!body || body.length > MAX_REQUEST_SIZE) {
      return Response.json({ error: "Solicitacao invalida." }, { status: 400 });
    }

    let parsedBody: Record<string, unknown> = {};
    try {
      parsedBody = JSON.parse(body);
    } catch {
      // Ignora erro de JSON malformado
    }

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

    const userContext =
      parsedBody.contexto &&
      typeof parsedBody.contexto === "object" &&
      Object.keys(parsedBody.contexto).length > 0
        ? parsedBody.contexto
        : await buildPlatformContext();

    const functionUrl =
      process.env.SUPABASE_AI_FUNCTION_URL || DEFAULT_AI_FUNCTION_URL;
    const authorizationKey =
      process.env.SUPABASE_AI_FUNCTION_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      DEFAULT_SUPABASE_KEY;

    const payload = {
      pergunta: textQuery,
      question: textQuery,
      message: textQuery,
      prompt: textQuery,
      contexto: userContext,
      historico: parsedBody.historico || [],
      user: session ? { role: session.role, subject: session.subject } : null,
    };

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorizationKey}`,
        apikey: authorizationKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const resText = await response.text();
    let resJson: Record<string, unknown> = {};
    try {
      resJson = JSON.parse(resText);
    } catch {
      // Retorna texto puro se nao for JSON
      return new Response(JSON.stringify({ reply: resText }), {
        status: response.status,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Se o backend/Edge Function retornar erro de pergunta obrigatoria, fornece uma resposta amigavel
    if (resJson.error === "Pergunta obrigatória") {
      delete resJson.error;
      resJson.reply =
        "Olá! Estou pronto para analisar os dados dos estagiários, rankings, acompanhamentos e alvos do programa Nextuber. Como posso ajudar com os estagiários hoje?";
    }

    return new Response(JSON.stringify(resJson), {
      status: response.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("Erro ao acessar o assistente:", error);
    return Response.json(
      { error: "Assistente temporariamente indisponivel." },
      { status: 502 },
    );
  }
}
