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
  permissoes: unknown;
  tipo_gestor: string | null;
}>(manager: T) {
  return {
    id: manager.id,
    nome: manager.nome,
    funcional: manager.funcional,
    permissoes: manager.permissoes,
    tipo_gestor: manager.tipo_gestor,
  };
}
