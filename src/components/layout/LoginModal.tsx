"use client";

import { useState } from "react";
import { nextuberAuthBridge } from "@/services/auth-client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
};

export function LoginModal({ isOpen, onClose, onLoginSuccess }: Props) {
  const [tab, setTab] = useState<"gestor" | "tutora">("gestor");
  const [funcional, setFuncional] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || (tab === "gestor" && !funcional)) return;

    try {
      setLoading(true);
      setError("");

      if (tab === "gestor") {
        await nextuberAuthBridge.loginManager(funcional, password);
      } else {
        await nextuberAuthBridge.loginTutor(password);
      }

      onLoginSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Senha ou credencial inválida.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "var(--surface)", width: "100%", maxWidth: "400px",
        borderRadius: "16px", padding: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px", background: "transparent",
            border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink3)"
          }}
        >
          ✕
        </button>
        
        <h2 style={{ fontSize: "22px", fontFamily: "'DM Serif Display', serif", marginBottom: "20px", color: "var(--ink)" }}>
          Fazer Login
        </h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => { setTab("gestor"); setError(""); }}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: "8px",
              border: tab === "gestor" ? "1px solid var(--or)" : "1px solid var(--border)",
              background: tab === "gestor" ? "#FFF3E8" : "var(--surface)",
              color: tab === "gestor" ? "var(--or)" : "var(--ink2)",
              fontWeight: 600, fontSize: "13px", cursor: "pointer"
            }}
          >
            👨‍💼 Sou Gestor
          </button>
          <button
            type="button"
            onClick={() => { setTab("tutora"); setError(""); }}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: "8px",
              border: tab === "tutora" ? "1px solid var(--or)" : "1px solid var(--border)",
              background: tab === "tutora" ? "#FFF3E8" : "var(--surface)",
              color: tab === "tutora" ? "var(--or)" : "var(--ink2)",
              fontWeight: 600, fontSize: "13px", cursor: "pointer"
            }}
          >
            👩‍🏫 Sou Tutora
          </button>
        </div>

        {error && (
          <div style={{ padding: "10px", background: "#FEE2E2", color: "#DC2626", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {tab === "gestor" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink2)" }}>Funcional</label>
              <input
                type="text"
                value={funcional}
                onChange={(e) => setFuncional(e.target.value)}
                placeholder="Ex: 1234567"
                style={{
                  padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                  fontSize: "14px", width: "100%", boxSizing: "border-box"
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink2)" }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={{
                padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                fontSize: "14px", width: "100%", boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px", padding: "12px", borderRadius: "8px",
              background: "var(--or)", color: "#fff", border: "none",
              fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
