import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const MAX_REQUEST_SIZE = 160_000;
const DEFAULT_AI_FUNCTION_URL =
  "https://hbebkripmytkknqydjpt.supabase.co/functions/v1/ai-assistant";
const DEFAULT_SUPABASE_KEY = "sb_publishable_PjzxYcSPxCwSjeGB-Jzk3g_1632xWIH";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_SIZE) {
      return Response.json({ error: "Solicitacao muito grande." }, { status: 413 });
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
      contexto: parsedBody.contexto || {},
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
        "Olá! Estou pronto para analisar os dados dos estagiários, rankings, acompanhamentos e metas do programa Nextuber. Como posso ajudar com os estagiários hoje?";
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
