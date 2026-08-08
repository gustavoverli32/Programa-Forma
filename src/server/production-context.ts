import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductionConfig } from "@/domain/production-deadline";

export async function loadProductionConfig(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("id", "cfg_geral")
    .maybeSingle();
  if (error) throw error;
  return (data?.valor ?? {}) as ProductionConfig & Record<string, unknown>;
}
