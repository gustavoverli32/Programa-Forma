"use client";

import { useState } from "react";
import {
  calculateConsolidatedKpis,
  calculateRankings,
  formatDateLong,
  formatQuarterName,
} from "@/domain/home-overview";
import type { ProductionRow } from "@/domain/production";
import type { StudentItem } from "@/domain/student-monitoring";
import { nextuberMutationBridge } from "@/services/admin-mutations-client";
import { ProjectDetailsModal } from "./ProjectDetailsModal";

type MeetingItem = {
  id: string;
  titulo: string;
  data: string;
  descricao?: string | null;
};

type Props = {
  students: StudentItem[];
  productionRows?: ProductionRow[];
  meetings?: MeetingItem[];
  canEdit?: boolean;
  isAuthorized?: boolean;
  onMeetingAdded?: (newMeeting: MeetingItem) => void;
};

export function HomeOverviewSection({
  students,
  productionRows = [],
  meetings = [],
  canEdit = false,
  isAuthorized = true,
  onMeetingAdded,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [rankingFilter, setRankingFilter] = useState("nota");

  // State para adicionar novo encontro
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [encTitulo, setEncTitulo] = useState("");
  const [encData, setEncData] = useState("");
  const [encDesc, setEncDesc] = useState("");
  const [savingMeeting, setSavingMeeting] = useState(false);

  const kpis = calculateConsolidatedKpis(students, productionRows);
  const rankings = calculateRankings(students, productionRows, rankingFilter);

  async function handleAddMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!encTitulo || !encData || savingMeeting) return;
    try {
      setSavingMeeting(true);
      const res = await nextuberMutationBridge.createMeeting({
        title: encTitulo,
        date: encData,
        description: encDesc,
      });
      if (res.meeting && onMeetingAdded) {
        onMeetingAdded(res.meeting as unknown as MeetingItem);
      }
      setEncTitulo("");
      setEncData("");
      setEncDesc("");
      setShowMeetingForm(false);
    } catch (err) {
      console.error("Erro ao criar encontro:", err);
    } finally {
      setSavingMeeting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--or, #EC7000), #C04E00)",
          color: "#fff",
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 6px 24px rgba(236,112,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                opacity: 0.9,
                marginBottom: "6px",
              }}
            >
              Nextuber
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                margin: "0 0 10px 0",
                lineHeight: 1.25,
              }}
            >
              Desenvolvendo o futuro comercial do Itaú
            </h2>
            <p
              style={{
                fontSize: "13.5px",
                lineHeight: 1.6,
                opacity: 0.95,
                maxWidth: "680px",
                margin: 0,
              }}
            >
              Programa estruturado para formar estagiários comerciais com excelência técnica,
              comportamental e comprometimento com o cliente. Acompanhamento contínuo e desenvolvimento orientado por dados.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              whiteSpace: "nowrap",
            }}
          >
            Ver mais →
          </button>
        </div>
      </div>

      {/* DATA & TRIMESTRE CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #eee)",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--ink3, #666)",
              marginBottom: "4px",
            }}
          >
            Hoje
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink, #111)", textTransform: "capitalize" }}>
            {formatDateLong()}
          </div>
        </div>

        <div
          style={{
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #eee)",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--ink3, #666)",
              marginBottom: "4px",
            }}
          >
            Trimestre vigente
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--or, #EC7000)" }}>
            {formatQuarterName()}
          </div>
        </div>
      </div>

      {/* VISÃO CONSOLIDADA (KPIS GRID) */}
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--ink3, #666)",
            marginBottom: "10px",
          }}
        >
          Visão consolidada
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "var(--surface, #fff)",
              border: "1px solid var(--border, #eee)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--ink3, #666)" }}>Estagiários no Programa</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--ink, #111)", margin: "4px 0 0 0" }}>
              {kpis.totalStudents}
            </div>
          </div>

          <div
            style={{
              background: "var(--surface, #fff)",
              border: "1px solid var(--border, #eee)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--ink3, #666)" }}>Crédito Total Realizado</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#166534", margin: "4px 0 0 0" }}>
              R$ {kpis.totalCreditAmount.toLocaleString("pt-BR")}
            </div>
          </div>

          <div
            style={{
              background: "var(--surface, #fff)",
              border: "1px solid var(--border, #eee)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--ink3, #666)" }}>Produtos Comercializados</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#1D4ED8", margin: "4px 0 0 0" }}>
              {kpis.totalProductsAmount.toLocaleString("pt-BR")} un
            </div>
          </div>

          <div
            style={{
              background: kpis.attentionCount > 0 ? "#FEF2F2" : "var(--surface, #fff)",
              border: `1px solid ${kpis.attentionCount > 0 ? "#FCA5A5" : "var(--border, #eee)"}`,
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "12px", color: kpis.attentionCount > 0 ? "#991B1B" : "var(--ink3, #666)" }}>
              Sinalizações de Atenção
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: kpis.attentionCount > 0 ? "#DC2626" : "var(--ink, #111)",
                margin: "4px 0 0 0",
              }}
            >
              {kpis.attentionCount}
            </div>
          </div>
        </div>
      </div>

      {/* DISTRIBUIÇÃO POR TRILHA */}
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #eee)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--ink, #111)" }}>
          Distribuição por Trilha de Aprendizado
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <div style={{ background: "#FFF7ED", border: "1px solid #FFEDD5", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#EC7000" }}>Fase 1 | Decolar (0-90d)</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#EC7000", marginTop: "2px" }}>
              {kpis.phaseCounts.iniciante} estagiários
            </div>
          </div>

          <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#B45309" }}>Fase 2 | Evoluir (91-180d)</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#B45309", marginTop: "2px" }}>
              {kpis.phaseCounts.intermediario} estagiários
            </div>
          </div>

          <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#166534" }}>Fase 3 | Impactar (181+d)</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#166534", marginTop: "2px" }}>
              {kpis.phaseCounts.avancado} estagiários
            </div>
          </div>
        </div>
      </div>

      {/* PRÓXIMOS ENCONTROS */}
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #eee)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink, #111)" }}>
            📅 Próximos Encontros & Eventos
          </span>
          {canEdit && !showMeetingForm && (
            <button
              onClick={() => setShowMeetingForm(true)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "1px solid var(--border, #ccc)",
                background: "var(--bg, #f5f5f5)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Adicionar Encontro
            </button>
          )}
        </div>

        {showMeetingForm && (
          <form
            onSubmit={handleAddMeeting}
            style={{
              background: "var(--bg, #f9f9f9)",
              border: "1.5px dashed var(--border, #ccc)",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={encTitulo}
                  onChange={(e) => setEncTitulo(e.target.value)}
                  placeholder="Ex: Encontro mensal com a Tutora"
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "12.5px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={encData}
                  onChange={(e) => setEncData(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "12.5px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Descrição (opcional)
              </label>
              <textarea
                value={encDesc}
                onChange={(e) => setEncDesc(e.target.value)}
                placeholder="Detalhes ou pauta da reunião..."
                rows={2}
                style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "12.5px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowMeetingForm(false)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: "12px" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingMeeting}
                style={{ padding: "6px 16px", borderRadius: "6px", border: "none", background: "var(--or, #EC7000)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}
              >
                {savingMeeting ? "Salvar..." : "Salvar Encontro"}
              </button>
            </div>
          </form>
        )}

        {meetings.length === 0 ? (
          <div style={{ fontSize: "13px", color: "var(--ink3, #666)", padding: "8px 0" }}>
            Nenhum encontro agendado no momento.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {meetings.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "var(--bg, #f8f9fa)",
                  border: "1px solid var(--border, #eee)",
                }}
              >
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ink, #111)" }}>{m.titulo}</div>
                  {m.descricao && <div style={{ fontSize: "12px", color: "var(--ink3, #666)", marginTop: "2px" }}>{m.descricao}</div>}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--or, #EC7000)",
                    background: "#FFF7ED",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(m.data).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RANKING DO TRIMESTRE */}
      {isAuthorized && (
        <div
          style={{
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #eee)",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink, #111)" }}>
              🏆 Ranking do Trimestre
            </div>
            <select
              value={rankingFilter}
              onChange={(e) => setRankingFilter(e.target.value)}
              style={{
                fontSize: "12px",
                border: "1px solid var(--border, #ccc)",
                borderRadius: "6px",
                padding: "6px 12px",
                background: "var(--surface, #fff)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <optgroup label="Geral">
                <option value="nota">🏆 Nota (Crédito + Produtos)</option>
                <option value="credito">💳 Crédito total (INSS+OP+EP+Creditário)</option>
                <option value="produtos">📦 Produtos total (Seg+PIC+Comb+Cons+Eng)</option>
              </optgroup>
              <optgroup label="Crédito (por modalidade)">
                <option value="cred_INSS">🔵 INSS</option>
                <option value="cred_OP">🟠 OP</option>
                <option value="cred_EP">🩷 EP</option>
                <option value="cred_Crediario">🟢 Creditário</option>
              </optgroup>
              <optgroup label="Produtos (por tipo)">
                <option value="out_Seguros">🟣 Seguros</option>
                <option value="out_PIC">🔵 PIC</option>
                <option value="out_Combinaqui">🟠 Combinaqui</option>
                <option value="out_Consorcios">🟢 Consórcios</option>
                <option value="out_Engajamento">🩷 Engajamento</option>
              </optgroup>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {rankings.map((item) => {
              const isTop3 = item.position <= 3;
              const badgeSymbol =
                item.position === 1 ? "🥇" : item.position === 2 ? "🥈" : item.position === 3 ? "🥉" : `${item.position}º`;

              return (
                <div
                  key={item.studentId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: isTop3 ? "var(--bg, #fefce8)" : "var(--surface, #fff)",
                    border: `1px solid ${isTop3 ? "#fef08a" : "var(--border, #eee)"}`,
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isTop3 ? "var(--or, #EC7000)" : "var(--bg, #f0f0f0)",
                      color: isTop3 ? "#fff" : "var(--ink2, #444)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                      flexShrink: 0,
                    }}
                  >
                    {badgeSymbol}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink, #111)" }}>
                      {item.studentName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--ink3, #666)" }}>
                      Agência: {item.agency} | Funcional: {item.functional}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--or, #EC7000)" }}>
                      {item.formattedValue}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Ver Mais */}
      <ProjectDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        canEdit={canEdit}
      />
    </div>
  );
}
