"use client";

import { useState } from "react";
import {
  createChatMessage,
  sanitizeAssistantText,
  SUGGESTED_QUESTIONS,
  type ChatMessage,
} from "@/domain/assistant";

export function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createChatMessage(
      "assistant",
      "Olá! Sou o **Nextuber IA**, seu assistente de inteligência. Como posso ajudar com os acompanhamentos, metas ou trilhas hoje?",
    ),
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(textToSend?: string) {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg = createChatMessage("user", query);
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");

    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        let errText = "Assistente temporariamente indisponível.";
        try {
          const errJson = await res.json();
          if (errJson.error) errText = errJson.error;
        } catch {
          // Ignorar se a resposta nao for JSON
        }

        setMessages((prev) => [
          ...prev,
          createChatMessage("assistant", `⚠️ ${errText}`),
        ]);
        return;
      }

      const data = await res.json();
      const reply = data.reply || data.message || data.text || JSON.stringify(data);
      setMessages((prev) => [...prev, createChatMessage("assistant", reply)]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createChatMessage("assistant", "⚠️ Erro de conexão com o assistente."),
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          padding: "12px 20px",
          borderRadius: "50px",
          background: "linear-gradient(135deg, #EC7000 0%, #B45309 100%)",
          color: "#fff",
          border: "none",
          boxShadow: "0 4px 20px rgba(236,112,0,0.35)",
          fontWeight: 700,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          transition: "transform 0.2s ease",
        }}
      >
        <span>✨</span>
        <span>{isOpen ? "Fechar IA" : "Nextuber IA"}</span>
      </button>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "84px",
            right: "24px",
            zIndex: 9999,
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            height: "520px",
            maxHeight: "calc(100vh - 120px)",
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #eee)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #EC7000 0%, #B45309 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>Nextuber IA</div>
                <div style={{ fontSize: "11px", opacity: 0.85 }}>Assistente Inteligente do Programa</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "var(--bg, #fafafa)",
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isUser ? "var(--or, #EC7000)" : "var(--surface, #fff)",
                      color: isUser ? "#fff" : "var(--ink, #111)",
                      border: isUser ? "none" : "1px solid var(--border, #eee)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizeAssistantText(msg.content) }}
                  />
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--ink3, #888)",
                      textAlign: isUser ? "right" : "left",
                      marginTop: "2px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: "12px", color: "var(--ink3, #666)", padding: "8px 12px" }}>
                ⏳ Pensando...
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          <div
            style={{
              padding: "8px 12px",
              background: "var(--surface, #fff)",
              borderTop: "1px solid var(--border, #eee)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
            }}
          >
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  border: "1px solid var(--border, #ccc)",
                  background: "var(--bg, #f5f5f5)",
                  color: "var(--ink2, #444)",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px",
              background: "var(--surface, #fff)",
              borderTop: "1px solid var(--border, #eee)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Digite sua dúvida para a IA..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "20px",
                border: "1px solid var(--border, #ccc)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                background: "var(--or, #EC7000)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
