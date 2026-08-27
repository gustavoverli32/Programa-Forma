import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

function hashesMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { funcional?: unknown; password?: unknown }
    | null;
  const funcional =
    typeof body?.funcional === "string" ? body.funcional.replace(/\D/g, "") : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (funcional.length !== 9 || password.length < 4) {
    return Response.json(
      { error: "Funcional ou senha incorretos." },
      { status: 401 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: gestor, error } = await supabase
      .from("gestores")
      .select("id,nome,funcional,agencia,senha_hash,permissoes,tipo_gestor,regional_id")
      .eq("funcional", funcional)
      .maybeSingle();

    if (error) throw error;

    const defaultHash = createHash("sha256")
      .update(`${funcional.slice(0, 4)}itau_formacao_2025`)
      .digest("hex");

    const expectedHash = gestor?.senha_hash || defaultHash;

    const receivedHash = createHash("sha256")
      .update(`${password}itau_formacao_2025`)
      .digest("hex");

    if (!gestor || !hashesMatch(receivedHash, expectedHash)) {
      return Response.json(
        { error: "Funcional ou senha incorretos." },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      createSessionToken("gestor", String(gestor.id)),
      sessionCookieOptions,
    );

    const safeGestor = {
      id: gestor.id,
      nome: gestor.nome,
      funcional: gestor.funcional,
      permissoes: gestor.permissoes,
      tipo_gestor: gestor.tipo_gestor,
    };
    return Response.json({ gestor: safeGestor });
  } catch (error) {
    console.error("Erro na autenticacao do gestor:", error);
    return Response.json(
      { error: "Nao foi possivel autenticar agora." },
      { status: 503 },
    );
  }
}
