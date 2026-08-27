import "server-only";

import { createHash } from "node:crypto";

export function hashManagerPassword(password: string) {
  return createHash("sha256")
    .update(`${password.slice(0, 4)}itau_formacao_2025`)
    .digest("hex");
}

export function safeManager<T extends {
  id: string;
  nome: string;
  funcional: string;
  agencia?: string | null;
  regional_id?: string | null;
  permissoes: unknown;
  tipo_gestor: string | null;
}>(manager: T) {
  return {
    id: manager.id,
    nome: manager.nome,
    funcional: manager.funcional,
    agencia: manager.agencia || "",
    regional_id: manager.regional_id || null,
    permissoes: manager.permissoes,
    tipo_gestor: manager.tipo_gestor,
  };
}
