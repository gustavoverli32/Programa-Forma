type ManagerSession = {
  id: string;
  nome: string;
  funcional: string;
  permissoes: Record<string, unknown> | null;
  tipo_gestor: string | null;
};

async function postJson<T>(url: string, body?: unknown) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!response.ok) {
    throw new Error(result?.error || "Nao foi possivel concluir a autenticacao.");
  }
  return result as T;
}

export const nextuberAuthBridge = {
  loginTutor(password: string) {
    return postJson<{ ok: true }>("/api/auth/tutora", { password });
  },
  loginManager(funcional: string, password: string) {
    return postJson<{ gestor: ManagerSession }>("/api/auth/gestor", {
      funcional,
      password,
    });
  },
  logout() {
    return postJson<{ ok: true }>("/api/auth/logout");
  },
};

export type NextuberAuthBridge = typeof nextuberAuthBridge;
