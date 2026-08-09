export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

export const SUGGESTED_QUESTIONS = [
  "Quais estagiários estão com sinalização de atenção?",
  "Qual é o volume total de crédito realizado no trimestre?",
  "Como funciona a Fase 1 (Decolar) da Trilha?",
  "Qual é o prazo para atualização da produção esta semana?",
];

export function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeAssistantText(rawText: string): string {
  if (!rawText) return "";
  const safe = escapeHtml(rawText);
  return safe.replace(/\n/g, "<br>");
}

export function createChatMessage(role: "user" | "assistant" | "system", content: string): ChatMessage {
  return {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role,
    content,
    timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}
