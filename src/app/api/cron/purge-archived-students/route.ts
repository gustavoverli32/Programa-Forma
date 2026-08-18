import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: candidates, error: findError } = await supabase
    .from("estagiarios")
    .select("id")
    .not("arquivado_em", "is", null)
    .lte("excluir_em", new Date().toISOString());
  if (findError) throw findError;

  const ids = (candidates ?? []).map((item) => item.id);
  if (!ids.length) return Response.json({ deleted: 0 });

  const { error: deleteError } = await supabase
    .from("estagiarios")
    .delete()
    .in("id", ids);
  if (deleteError) throw deleteError;
  return Response.json({ deleted: ids.length });
}
