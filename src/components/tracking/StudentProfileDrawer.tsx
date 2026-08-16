"use client";

import { useState } from "react";
import {
  calcDaysInProgram,
  formatDaysInProgram,
  formatWhatsAppUrl,
  getProgramPhaseKey,
  getStudentProfile,
  isProductionUpdatePending,
  type StudentItem,
} from "@/domain/student-monitoring";
import { nextuberMutationBridge } from "@/services/admin-mutations-client";
import { nextuberTrackingBridge } from "@/services/tracking-bridge";

const TRILHAS_DATA = {
  iniciante: {
    cor: "#EC7000",
    titulo: "Fase 1 | Decolar",
    descricao: "Os primeiros 90 dias são sobre explorar, aprender e se conectar.",
    topicos: [
      {
        tema: "0 a 30 dias — Conexão com o Itaú",
        checks: [
          "Conhece a cultura do banco",
          "Entende a dinâmica da agência",
          "Desenvolveu postura profissional",
          "Concluiu capacitações obrigatórias",
        ],
      },
      {
        tema: "31 a 60 dias — Construindo a Base",
        checks: [
          "Conhece os principais produtos",
          "Conhece fluxos e processos",
          "Participou de simulações práticas",
          "Tem segurança para atender",
        ],
      },
      {
        tema: "61 a 90 dias — Primeiros Resultados",
        checks: [
          "Está atuando na prática",
          "Acompanha indicadores",
          "Compartilha aprendizados",
          "Celebrou primeiras conquistas",
        ],
      },
    ],
  },
  intermediario: {
    cor: "#B45309",
    titulo: "Fase 2 | Evoluir",
    descricao: "Dos 91 aos 180 dias: mais autonomia, mais protagonismo.",
    topicos: [
      {
        tema: "91 a 120 dias — Crescimento em Movimento",
        checks: [
          "Participa ativamente da rotina",
          "Aprimorou escuta e relacionamento",
          "Expandiu conhecimento financeiro",
          "Desenvolveu novas competências",
        ],
      },
      {
        tema: "121 a 150 dias — Feedback e Evolução",
        checks: [
          "Recebeu feedback estruturado",
          "Identificou pontos fortes",
          "Construiu plano de evolução",
          "Ajustou a rota",
        ],
      },
      {
        tema: "151 a 180 dias — Consolidando sua Jornada",
        checks: [
          "Avaliação técnica e comportamental feita",
          "Conquistas reconhecidas",
          "Próximos passos preparados",
          "Protagonismo fortalecido",
        ],
      },
    ],
  },
  avancado: {
    cor: "#166534",
    titulo: "Fase 3 | Impactar",
    descricao: "Acima de 181 dias. Seu futuro começa a ganhar forma.",
    topicos: [
      {
        tema: "181 a 210 dias — Construindo o Próximo Nível",
        checks: [
          "PDI criado e alinhado",
          "Conhece novos produtos",
          "Objetivos de crescimento definidos",
          "Próximos passos planejados",
        ],
      },
      {
        tema: "+210 dias — Estagiário Referência",
        checks: [
          "Atua como multiplicador",
          "Apoia novos estagiários",
          "Analisou sua evolução",
          "Realizou reflexão de carreira",
        ],
      },
    ],
  },
};

type Props = {
  student: StudentItem | null;
  onClose: () => void;
  onStudentUpdated?: (updated: StudentItem) => void;
  canEdit?: boolean;
};

export function StudentProfileDrawer({
  student,
  onClose,
  onStudentUpdated,
  canEdit = true,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "info" | "trilha" | "resultados" | "obs"
  >("info");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!student) return null;
  const activeStudent = student;

  const profile = getStudentProfile(activeStudent);
  const phaseKey = getProgramPhaseKey(profile.inicio, profile.trilha_manual);
  const phaseInfo = TRILHAS_DATA[phaseKey];
  const daysInProgram = calcDaysInProgram(profile.inicio);
  const updatePending = isProductionUpdatePending(
    profile.ultima_atualizacao_producao,
  );
  const whatsappUrl = formatWhatsAppUrl(profile.telefone, activeStudent.nome);

  const checksState =
    (activeStudent.trilha_checks as Record<string, boolean> | undefined) || {};

  async function handleToggleCheck(checkKey: string) {
    if (!canEdit || saving) return;
    const newChecks = {
      ...checksState,
      [checkKey]: !checksState[checkKey],
    };
    try {
      setSaving(true);
      const res = await nextuberMutationBridge.updateStudent(activeStudent.id, {
        name: activeStudent.nome,
        months: activeStudent.meses || [],
        notes: activeStudent.obs || "",
        attention: !!activeStudent.atencao,
        profile,
        trailChecks: newChecks,
      });
      if (res.student && onStudentUpdated) {
        onStudentUpdated(res.student as unknown as StudentItem);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhaseOverride(newPhase: string) {
    if (!canEdit || saving) return;
    const newProfile = {
      ...profile,
      trilha_manual: newPhase === "auto" ? undefined : newPhase,
    };
    try {
      setSaving(true);
      const res = await nextuberMutationBridge.updateStudent(activeStudent.id, {
        name: activeStudent.nome,
        months: activeStudent.meses || [],
        notes: activeStudent.obs || "",
        attention: !!activeStudent.atencao,
        profile: newProfile,
        trailChecks: checksState,
      });
      if (res.student && onStudentUpdated) {
        onStudentUpdated(res.student as unknown as StudentItem);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAttention() {
    if (!canEdit || saving) return;
    const nextAttention = !activeStudent.atencao;
    try {
      setSaving(true);
      const res = await nextuberMutationBridge.updateStudent(activeStudent.id, {
        name: activeStudent.nome,
        months: activeStudent.meses || [],
        notes: activeStudent.obs || "",
        attention: nextAttention,
        profile,
        trailChecks: checksState,
      });
      if (res.student && onStudentUpdated) {
        onStudentUpdated(res.student as unknown as StudentItem);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotes(notesText: string) {
    if (!canEdit || saving) return;
    try {
      setSaving(true);
      const res = await nextuberMutationBridge.updateStudent(activeStudent.id, {
        name: activeStudent.nome,
        months: activeStudent.meses || [],
        notes: notesText,
        attention: !!activeStudent.atencao,
        profile,
        trailChecks: checksState,
      });
      if (res.student && onStudentUpdated) {
        onStudentUpdated(res.student as unknown as StudentItem);
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenProductionIsland() {
    nextuberTrackingBridge.open({
      student: { id: activeStudent.id, name: activeStudent.nome },
      quarterRef: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
      productionRows: [],
      canEdit,
    });
  }

  return (
    <>
      <div
        className="drawer-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
        }}
      />
      <div
        className="drawer-panel"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "480px",
          background: "var(--surface, #ffffff)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border, #eee)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--bg, #f9f9f9)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--or, #EC7000)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            {activeStudent.nome[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--ink, #111)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {activeStudent.nome}
            </h3>
            <span
              style={{
                fontSize: "12px",
                color: "var(--ink3, #666)",
                fontFamily: "monospace",
              }}
            >
              Funcional: {profile.funcional || "—"} | Agência:{" "}
              {profile.agencia || "—"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "var(--ink3, #666)",
              padding: "4px",
            }}
            title="Fechar perfil"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border, #eee)",
            background: "var(--surface, #fff)",
          }}
        >
          {[
            { id: "info", label: "Informações" },
            { id: "trilha", label: "Trilha" },
            { id: "resultados", label: "Resultados" },
            { id: "obs", label: "Observações" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                flex: 1,
                padding: "10px 4px",
                border: "none",
                background: "none",
                fontSize: "12px",
                fontWeight: activeTab === tab.id ? 600 : 400,
                color:
                  activeTab === tab.id
                    ? "var(--or, #EC7000)"
                    : "var(--ink2, #444)",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--or, #EC7000)"
                    : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* TAB INFORMAÇÕES */}
          {activeTab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  background: "var(--bg, #f8f9fa)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink3, #666)" }}>Tempo no programa:</span>
                  <strong>{formatDaysInProgram(profile.inicio)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink3, #666)" }}>Data de Início:</span>
                  <span>{profile.inicio || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink3, #666)" }}>Certificação:</span>
                  <span>{profile.certificacao || "Sem certificação"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink3, #666)" }}>Aniversário:</span>
                  <span>
                    {profile.dia_aniversario && profile.mes_aniversario
                      ? `${profile.dia_aniversario}/${profile.mes_aniversario}`
                      : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink3, #666)" }}>Gestor (GA):</span>
                  <span>{profile.ga_nome || profile.ga_funcional || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink3, #666)" }}>Gestor Geral (GGA):</span>
                  <span>{profile.gga_nome || profile.gga_funcional || "—"}</span>
                </div>
              </div>

              {/* Status de Atualização de Produção */}
              <div
                style={{
                  background: updatePending ? "#FEF2F2" : "#F0FDF4",
                  border: `1px solid ${updatePending ? "#FCA5A5" : "#86EFAC"}`,
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "12px",
                  color: updatePending ? "#991B1B" : "#166534",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  {updatePending ? "⚠️ Produção pendente de verificação" : "✅ Produção em dia"}
                </div>
                <div>
                  Última verificação:{" "}
                  {profile.ultima_atualizacao_producao
                    ? new Date(profile.ultima_atualizacao_producao).toLocaleDateString("pt-BR")
                    : "Sem registro"}
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#25D366",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  <span>💬</span> Falar via WhatsApp
                </a>
              )}
            </div>
          )}

          {/* TAB TRILHA */}
          {activeTab === "trilha" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: phaseInfo.cor + "15",
                  borderLeft: `4px solid ${phaseInfo.cor}`,
                  padding: "10px 12px",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: phaseInfo.cor,
                  }}
                >
                  {phaseInfo.titulo}
                </div>
                <div style={{ fontSize: "12px", color: "var(--ink2, #444)" }}>
                  {phaseInfo.descricao}
                </div>
              </div>

              {/* Checkboxes por Tópico */}
              {phaseInfo.topicos.map((topico, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid var(--border, #eee)",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "var(--ink, #111)",
                    }}
                  >
                    {topico.tema}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {topico.checks.map((checkText, cIdx) => {
                      const checkKey = `${phaseKey}_${idx}_${cIdx}`;
                      const isChecked = !!checksState[checkKey];
                      return (
                        <label
                          key={cIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "12px",
                            cursor: canEdit ? "pointer" : "default",
                            color: isChecked ? "var(--ink, #111)" : "var(--ink3, #666)",
                            textDecoration: isChecked ? "none" : "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!canEdit || saving}
                            onChange={() => handleToggleCheck(checkKey)}
                            style={{ accentColor: phaseInfo.cor }}
                          />
                          <span>{checkText}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Personalização da Fase da Trilha */}
              {canEdit && (
                <div style={{ marginTop: "8px", fontSize: "12px" }}>
                  <label style={{ color: "var(--ink3, #666)", display: "block", marginBottom: "4px" }}>
                    Alterar fase manualmente:
                  </label>
                  <select
                    value={profile.trilha_manual || "auto"}
                    onChange={(e) => handlePhaseOverride(e.target.value)}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border, #ccc)",
                      background: "var(--surface, #fff)",
                      fontSize: "12px",
                    }}
                  >
                    <option value="auto">Automático (baseado na data de início: {daysInProgram} dias)</option>
                    <option value="iniciante">Fase 1 | Decolar (0 a 90 dias)</option>
                    <option value="intermediario">Fase 2 | Evoluir (91 a 180 dias)</option>
                    <option value="avancado">Fase 3 | Impactar (181+ dias)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* TAB RESULTADOS */}
          {activeTab === "resultados" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "var(--bg, #f8f9fa)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--ink3, #666)" }}>
                  Produção e Alvos Semanais
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--or, #EC7000)",
                    margin: "4px 0 12px 0",
                  }}
                >
                  Tabela Semanal
                </div>
                <button
                  onClick={handleOpenProductionIsland}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    background: "var(--or, #EC7000)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  📊 Abrir Matriz de Lançamento de Produção
                </button>
              </div>
            </div>
          )}

          {/* TAB OBSERVAÇÕES */}
          {activeTab === "obs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Botão Marcação de Atenção */}
              <div
                style={{
                  background: activeStudent.atencao ? "#FEF2F2" : "var(--bg, #f8f9fa)",
                  border: `1px solid ${activeStudent.atencao ? "#FCA5A5" : "var(--border, #eee)"}`,
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: activeStudent.atencao ? "#991B1B" : "var(--ink, #111)",
                    }}
                  >
                    {activeStudent.atencao ? "⚠️ Estagiário marcado em Atenção" : "Sinalização de Atenção"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ink3, #666)" }}>
                    {activeStudent.atencao
                      ? "Este estagiário possui um alerta ativo no painel principal."
                      : "Marque caso o estagiário necessite de acompanhamento reforçado."}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={handleToggleAttention}
                    disabled={saving}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: activeStudent.atencao ? "#DC2626" : "#F59E0B",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeStudent.atencao ? "Remover Atenção" : "Marcar Atenção"}
                  </button>
                )}
              </div>

              {/* Textarea de Anotações */}
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--ink2, #444)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Anotações da Tutora / Gestor:
                </label>
                <textarea
                  defaultValue={activeStudent.obs || ""}
                  disabled={!canEdit || saving}
                  rows={6}
                  placeholder="Escreva observações sobre o acompanhamento, alinhamentos ou plano de desenvolvimento..."
                  onBlur={(e) => handleSaveNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border, #ccc)",
                    fontSize: "13px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    background: "var(--surface, #fff)",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--ink3, #666)" }}>
                    As anotações são salvas ao sair do campo de texto.
                  </span>
                  {savedMessage && (
                    <span style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>
                      ✓ Salvo com sucesso!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
