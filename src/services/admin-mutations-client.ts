type ApiError = { error?: string };

async function requestJson<T>(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as (T & ApiError) | null;
  if (!response.ok) {
    throw new Error(result?.error || "Nao foi possivel salvar os dados.");
  }
  return result as T;
}

export const nextuberMutationBridge = {
  createStudent(input: unknown) {
    return requestJson<{ student: Record<string, unknown> }>("/api/students", "POST", input);
  },
  updateStudent(id: string, input: unknown) {
    return requestJson<{ student: Record<string, unknown> }>(
      `/api/students/${encodeURIComponent(id)}`,
      "PATCH",
      input,
    );
  },
  deleteStudent(id: string) {
    return requestJson<{ ok: true }>(`/api/students/${encodeURIComponent(id)}`, "DELETE");
  },
  createManager(input: unknown) {
    return requestJson<{ manager: Record<string, unknown> }>("/api/managers", "POST", input);
  },
  updateMyManagerProfile(input: unknown) {
    return requestJson<{ manager: Record<string, unknown> }>("/api/managers/me", "PATCH", input);
  },
  updateManager(id: string, input: unknown) {
    return requestJson<{ manager: Record<string, unknown> }>(
      `/api/managers/${encodeURIComponent(id)}`,
      "PATCH",
      input,
    );
  },
  deleteManager(id: string) {
    return requestJson<{ ok: true }>(`/api/managers/${encodeURIComponent(id)}`, "DELETE");
  },
  saveSetting(key: "timeline" | "textos_projeto" | "checklist_mensal", value: unknown) {
    return requestJson<{ ok: true; value: unknown }>("/api/settings/legacy", "POST", {
      key,
      value,
    });
  },
  ensureProductionAudit() {
    return requestJson<{ history: Array<Record<string, unknown>> }>(
      "/api/settings/production-audit",
      "POST",
    );
  },
  createMeeting(input: unknown) {
    return requestJson<{ meeting: Record<string, unknown> }>("/api/meetings", "POST", input);
  },
  deleteMeeting(id: string) {
    return requestJson<{ ok: true }>(`/api/meetings/${encodeURIComponent(id)}`, "DELETE");
  },
  createAppointment(input: unknown) {
    return requestJson<{ appointment: Record<string, unknown> }>(
      "/api/appointments",
      "POST",
      input,
    );
  },
  updateAppointment(id: string, input: unknown) {
    return requestJson<{ appointment: Record<string, unknown> }>(
      `/api/appointments/${encodeURIComponent(id)}`,
      "PATCH",
      input,
    );
  },
  deleteAppointment(id: string) {
    return requestJson<{ ok: true }>(
      `/api/appointments/${encodeURIComponent(id)}`,
      "DELETE",
    );
  },
  async uploadAppointment(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/appointments/upload", {
      method: "POST",
      credentials: "same-origin",
      body: form,
    });
    const result = (await response.json().catch(() => null)) as
      | ({ fileUrl: string; fileName: string } & ApiError)
      | null;
    if (!response.ok) {
      throw new Error(result?.error || "Nao foi possivel enviar o arquivo.");
    }
    return result as { fileUrl: string; fileName: string };
  },
};

export type NextuberMutationBridge = typeof nextuberMutationBridge;
