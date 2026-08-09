import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  assertSameOrigin,
  ProductionHttpError,
  productionErrorResponse,
  requireProductionSession,
} from "@/server/production-access";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
]);

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireProductionSession();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new ProductionHttpError("Selecione um arquivo valido.", 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new ProductionHttpError("O arquivo deve ter no maximo 10 MB.", 400);
    }
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new ProductionHttpError("Tipo de arquivo nao permitido.", 400);
    }
    const path = `agendamentos/${Date.now()}_${randomUUID()}.${extension}`;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from("arquivos").upload(
      path,
      Buffer.from(await file.arrayBuffer()),
      { contentType: file.type || "application/octet-stream", upsert: false },
    );
    if (error) throw error;
    const { data } = supabase.storage.from("arquivos").getPublicUrl(path);
    return Response.json({ fileUrl: data.publicUrl, fileName: file.name });
  } catch (error) {
    return productionErrorResponse(error);
  }
}
