import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/session";

function hashesMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  const expectedHash = process.env.NEXTUBER_ADMIN_PASSWORD_HASH;
  if (!expectedHash) {
    return Response.json(
      { error: "Autenticacao da tutora nao configurada." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { password?: unknown }
    | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const receivedHash = createHash("sha256").update(password).digest("hex");

  if (!password || !hashesMatch(receivedHash, expectedHash)) {
    return Response.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    createSessionToken("tutora", "regional"),
    sessionCookieOptions,
  );

  return Response.json({ ok: true });
}
