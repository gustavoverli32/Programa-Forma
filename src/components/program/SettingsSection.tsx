"use client";

import { useState } from "react";
import { formatDeadlineStatus } from "@/domain/program";

type Props = {
  activeDeadline?: string | null;
  canEdit?: boolean;
  isAuthorized?: boolean;
  onDeadlineUpdated?: (newDeadline: string) => void;
  onLoginClick?: () => void;
};

export function SettingsSection({
  activeDeadline,
  canEdit = true,
  isAuthorized = true,
  onDeadlineUpdated,
  onLoginClick,
}: Props) {
  const [deadlineData, setDeadlineData] = useState(activeDeadline || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const status = formatDeadlineStatus(activeDeadline);

  async function handleSaveDeadline(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !deadlineData || saving) return;
    try {
      setSaving(true);
      const res = await fetch("/api/settings/production-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadlineDate: deadlineData }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        if (onDeadlineUpdated) onDeadlineUpdated(deadlineData);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (e) {
      console.error("Erro ao salvar prazo:", e);
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          background: "var(--surface, #fff)",
          borderRadius: "16px",
          margin: "20px 0",
          border: "1px solid var(--border, #eee)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>Acesso restrito</h2>
        <p style={{ color: "var(--ink3, #666)", fontSize: "14px", margin: "0 0 20px 0" }}>
          Esta área é exclusiva para a tutora e gestores. Faça login para acessar as configurações.
        </p>
        {onLoginClick && (
          <button
            onClick={onLoginClick}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              background: "var(--or, #EC7000)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Fazer login
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "680px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "var(--ink, #111)" }}>
          Configurações
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink3, #666)" }}>
          Ajustes gerais e parametrização do programa Nextuber.
        </p>
      </div>

      {/* Recorrência e Prazo de Produção */}
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #eee)",
          borderRadius: "14px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>⏰</span>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--ink, #111)" }}>
              Prazo para Atualização de Produção Semanal
            </h3>
            <p style={{ fontSize: "12px", color: "var(--ink3, #666)", margin: "2px 0 0 0" }}>
              Defina a data limite para os gestores atualizarem os lançamentos. Quando o prazo se aproximar (2 dias antes), os cards ficarão em alerta.
            </p>
          </div>
        </div>

        {/* Card do Prazo Atual */}
        <div
          style={{
            background: "var(--bg, #f9f9f9)",
            border: `1px solid ${status.statusColor}40`,
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "var(--ink3, #666)",
                marginBottom: "4px",
              }}
            >
              Prazo Ativo em Sistema
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink, #111)" }}>
              {activeDeadline ? new Date(activeDeadline).toLocaleDateString("pt-BR") : "Nenhum prazo definido"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: status.statusColor, marginTop: "2px" }}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Formulário de Alteração de Prazo */}
        {canEdit && (
          <form onSubmit={handleSaveDeadline} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="date"
              required
              value={deadlineData}
              onChange={(e) => setDeadlineData(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border, #ccc)",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                background: "var(--or, #EC7000)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {saving ? "Salvando..." : "Definir Prazo"}
            </button>
            {savedSuccess && (
              <span style={{ color: "#166534", fontSize: "12px", fontWeight: 600 }}>
                ✓ Prazo atualizado!
              </span>
            )}
          </form>
        )}
      </div>

      {/* Info Card */}
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px dashed var(--border, #ccc)",
          borderRadius: "14px",
          padding: "20px",
          textAlign: "center",
          color: "var(--ink3, #666)",
          fontSize: "13px",
        }}
      >
        📌 Novas integrações de alertas automáticos via Webhook e PWA Push estarão disponíveis nas próximas etapas.
      </div>
    </div>
  );
}
