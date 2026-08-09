"use client";

import { useState } from "react";
import { TRILHAS_FULL_DATA } from "@/domain/program";

export function TrilhasSection() {
  const [selectedPhase, setSelectedPhase] = useState<"iniciante" | "intermediario" | "avancado">("iniciante");

  const currentPhase = TRILHAS_FULL_DATA[selectedPhase];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "var(--ink, #111)" }}>
          Trilhas de <em>aprendizado</em>
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink3, #666)" }}>
          Cronogramas adaptados ao tempo de casa · Acompanhamento estruturado em 3 Fases do programa.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {(["iniciante", "intermediario", "avancado"] as const).map((phaseKey) => {
          const item = TRILHAS_FULL_DATA[phaseKey];
          const active = selectedPhase === phaseKey;

          return (
            <button
              key={phaseKey}
              onClick={() => setSelectedPhase(phaseKey)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: active ? `2px solid ${item.cor}` : "1px solid var(--border, #eee)",
                background: active ? item.cor + "10" : "var(--surface, #fff)",
                color: active ? item.cor : "var(--ink2, #444)",
                fontWeight: active ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: item.cor,
                  display: "inline-block",
                }}
              />
              {item.mesesLabel} ({item.titulo})
            </button>
          );
        })}
      </div>

      {/* Main Phase Banner */}
      <div
        style={{
          background: currentPhase.cor + "15",
          borderLeft: `5px solid ${currentPhase.cor}`,
          borderRadius: "12px",
          padding: "20px 24px",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 700, color: currentPhase.cor }}>
          {currentPhase.titulo}
        </div>
        <p style={{ fontSize: "14px", color: "var(--ink2, #444)", margin: "4px 0 10px 0" }}>
          {currentPhase.descricao}
        </p>
        <div style={{ fontSize: "13px", fontStyle: "italic", color: "var(--ink3, #666)", fontWeight: 500 }}>
          {currentPhase.frase}
        </div>
      </div>

      {/* Phase Topics Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {currentPhase.topicos.map((topico, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--surface, #fff)",
              border: "1px solid var(--border, #eee)",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700, color: "var(--ink, #111)" }}>
                {topico.tema}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink3, #666)" }}>
                <strong>Objetivo:</strong> {topico.obj}
              </p>
            </div>

            {/* Ações */}
            <div style={{ background: "var(--bg, #f9f9f9)", padding: "12px 16px", borderRadius: "8px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "var(--ink3, #666)",
                  marginBottom: "8px",
                }}
              >
                Ações esperadas nesta etapa
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--ink, #111)", lineHeight: 1.6 }}>
                {topico.acoes.map((acao, aIdx) => (
                  <li key={aIdx}>{acao}</li>
                ))}
              </ul>
            </div>

            {/* Orientação para a Tutora */}
            <div
              style={{
                fontSize: "12.5px",
                background: "#EFF6FF",
                color: "#1E40AF",
                border: "1px solid #BFDBFE",
                padding: "10px 14px",
                borderRadius: "8px",
              }}
            >
              <strong>💡 Orientação da Tutora:</strong> {topico.tutora}
            </div>

            {/* Checklist items */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: "var(--ink3, #666)",
                  marginBottom: "8px",
                }}
              >
                Itens do Checklist de Acompanhamento
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {topico.checks.map((chk, cIdx) => (
                  <span
                    key={cIdx}
                    style={{
                      fontSize: "12px",
                      background: "var(--bg, #f0f0f0)",
                      color: "var(--ink2, #444)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    ✓ {chk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
