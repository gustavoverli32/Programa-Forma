import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const MAX_REQUEST_SIZE = 160_000;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return Response.json(
      { error: "Faca login para usar o assistente." },
      { status: 401 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_SIZE) {
    return Response.json({ error: "Solicitacao muito grande." }, { status: 413 });
  }

  const body = await request.text();
  if (!body || body.length > MAX_REQUEST_SIZE) {
    return Response.json({ error: "Solicitacao invalida." }, { status: 400 });
  }

  const functionUrl = process.env.SUPABASE_AI_FUNCTION_URL;
  const authorizationKey =
    process.env.SUPABASE_AI_FUNCTION_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!functionUrl || !authorizationKey) {
    return Response.json(
      { error: "Assistente nao configurado." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorizationKey}`,
        apikey: authorizationKey,
      },
      body,
      cache: "no-store",
    });

    return new Response(await response.text(), {
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
