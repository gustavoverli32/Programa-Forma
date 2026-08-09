import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_PREFIX = "/storage/v1/object/public/arquivos/";

export function appointmentStoragePath(fileUrl: string | null) {
  if (!fileUrl) return null;
  try {
    const url = new URL(fileUrl);
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (configuredUrl && url.origin !== new URL(configuredUrl).origin) return null;
    if (!url.pathname.startsWith(`${PUBLIC_PREFIX}agendamentos/`)) return null;
    return decodeURIComponent(url.pathname.slice(PUBLIC_PREFIX.length));
  } catch {
    return null;
  }
}

export async function removeAppointmentFile(
  supabase: SupabaseClient,
  fileUrl: string | null,
) {
  const path = appointmentStoragePath(fileUrl);
  if (!path) return;
  const { error } = await supabase.storage.from("arquivos").remove([path]);
  if (error) console.error("Nao foi possivel remover arquivo de agendamento:", error);
}
