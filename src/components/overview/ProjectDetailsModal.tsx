"use client";

import { useState } from "react";
import { nextuberMutationBridge } from "@/services/admin-mutations-client";

type ProjectTexts = {
  banner_over?: string;
  banner_titulo?: string;
  banner_desc?: string;
  sec_objetivo?: string;
  sec_estrutura?: string;
  sec_metodologia?: string;
  sec_avaliacao?: string;
  sec_formatura?: string;
};

const DEFAULT_TEXTS: Required<ProjectTexts> = {
  banner_over: "Nextuber",
  banner_titulo: "Desenvolvendo o futuro comercial do Itaú",
  banner_desc:
    "Programa estruturado de 6 meses para formar estagiários comerciais com excelência técnica, comportamental e comprometimento com o cliente. Acompanhamento contínuo, trilhas adaptadas e desenvolvimento orientado por dados.",
  sec_objetivo:
    "Desenvolver estagiários com visão estratégica do negócio bancário, alta postura consultiva e domínio técnico dos produtos de crédito e serviços.",
  sec_estrutura:
    "Jornada de 6 meses dividida em 3 Fases: Decolar (0-90d), Evoluir (91-180d) e Impactar (181d+). Acompanhamento semanal de alvos e encontros de aceleração.",
  sec_metodologia:
    "Aprendizado prático orientado por alvos graduais, reuniões de feedback constante, mentoria com tutora regional e simulações comerciais diárias.",
  sec_avaliacao:
    "Composição de nota equilibrada: 60% alvos de Crédito (INSS, OP, EP, Creditário) + 40% Produtos (Seguros, PIC, Combinaqui, Consórcios e Engajamento).",
  sec_formatura:
    "Ao final do ciclo de 6 meses, os estagiários de maior destaque recebem recomendação direta para programas de aceleração de carreira e efetivação no Itaú.",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  texts?: ProjectTexts | null;
  canEdit?: boolean;
  onTextsUpdated?: (updated: ProjectTexts) => void;
};

export function ProjectDetailsModal({
  isOpen,
  onClose,
  texts,
  canEdit = false,
  onTextsUpdated,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const merged = { ...DEFAULT_TEXTS, ...texts };
  const [formData, setFormData] = useState<Required<ProjectTexts>>(merged);

  if (!isOpen) return null;

  async function handleSave() {
    if (!canEdit || saving) return;
    try {
      setSaving(true);
      await nextuberMutationBridge.saveSetting("textos_projeto", formData);
      if (onTextsUpdated) onTextsUpdated(formData);
      setIsEditing(false);
    } catch (e) {
      console.error("Erro ao salvar textos do projeto:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)",
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "650px",
          maxHeight: "85vh",
          background: "var(--surface, #fff)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border, #eee)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, var(--or, #EC7000), #CC5833)",
            color: "#fff",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".08em", opacity: 0.9 }}>
              {merged.banner_over}
            </span>
            <h3 style={{ margin: "2px 0 0 0", fontSize: "18px", fontWeight: 700 }}>
              {merged.banner_titulo}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", color: "var(--or, #EC7000)" }}>
                Editar Apresentação do Programa
              </h4>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Objetivo Principal:
                </label>
                <textarea
                  value={formData.sec_objetivo}
                  onChange={(e) => setFormData({ ...formData, sec_objetivo: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Estrutura do Programa:
                </label>
                <textarea
                  value={formData.sec_estrutura}
                  onChange={(e) => setFormData({ ...formData, sec_estrutura: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Metodologia & Alvos:
                </label>
                <textarea
                  value={formData.sec_metodologia}
                  onChange={(e) => setFormData({ ...formData, sec_metodologia: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Composição de Avaliação:
                </label>
                <textarea
                  value={formData.sec_avaliacao}
                  onChange={(e) => setFormData({ ...formData, sec_avaliacao: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Formatura & Efetivação:
                </label>
                <textarea
                  value={formData.sec_formatura}
                  onChange={(e) => setFormData({ ...formData, sec_formatura: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--or, #EC7000)", fontWeight: 700 }}>
                  🎯 Objetivo do Programa
                </h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink2, #444)", lineHeight: 1.6 }}>
                  {merged.sec_objetivo}
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--or, #EC7000)", fontWeight: 700 }}>
                  📋 Estrutura da Jornada
                </h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink2, #444)", lineHeight: 1.6 }}>
                  {merged.sec_estrutura}
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--or, #EC7000)", fontWeight: 700 }}>
                  ⚡ Metodologia de Acompanhamento
                </h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink2, #444)", lineHeight: 1.6 }}>
                  {merged.sec_metodologia}
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--or, #EC7000)", fontWeight: 700 }}>
                  📊 Critérios de Avaliação (Nota 6+4)
                </h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink2, #444)", lineHeight: 1.6 }}>
                  {merged.sec_avaliacao}
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--or, #EC7000)", fontWeight: 700 }}>
                  🎓 Formatura & Próximos Passos
                </h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink2, #444)", lineHeight: 1.6 }}>
                  {merged.sec_formatura}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border, #eee)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg, #f9f9f9)",
          }}
        >
          {canEdit && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                background: isEditing ? "var(--or, #EC7000)" : "var(--surface, #fff)",
                color: isEditing ? "#fff" : "var(--ink, #111)",
                border: isEditing ? "none" : "1px solid var(--border, #ccc)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "✎ Editar Textos"}
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              background: "var(--surface, #fff)",
              color: "var(--ink2, #444)",
              border: "1px solid var(--border, #ccc)",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: "13px",
              marginLeft: "auto",
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
