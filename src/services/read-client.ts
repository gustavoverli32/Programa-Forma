type BootstrapPayload = {
  regionais?: Record<string, unknown>[];
  students: Record<string, unknown>[];
  archivedStudents: Record<string, unknown>[];
  timeline: unknown;
  config: Record<string, unknown>;
  projectTexts: Record<string, unknown>;
  monthlyChecklist: { enabled?: boolean };
  productionAuditHistory: Array<Record<string, unknown>>;
  managers: Record<string, unknown>[];
  production: Record<string, unknown>[];
  descriptions: Record<string, unknown>[];
  meetings: Record<string, unknown>[];
  session: null | {
    role: "tutora" | "gestor";
    manager?: Record<string, unknown>;
  };
};

async function getJson<T>(url: string) {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  });
  const result = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!response.ok) {
    throw new Error(result?.error || "Nao foi possivel carregar os dados.");
  }
  return result as T;
}

export const nextuberReadBridge = {
  bootstrap() {
    return getJson<BootstrapPayload>("/api/data/bootstrap");
  },
  snapshots(studentId: string) {
    return getJson<{ snapshots: Record<string, unknown>[] }>(
      `/api/data/snapshots/${encodeURIComponent(studentId)}`,
    );
  },
  appointments() {
    return getJson<{ appointments: Record<string, unknown>[] }>(
      "/api/appointments",
    );
  },
};

export type NextuberReadBridge = typeof nextuberReadBridge;
