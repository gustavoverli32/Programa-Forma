"use client";

import { useMemo, useState } from "react";
import {
  calcDaysInProgram,
  filterAndSortStudents,
  formatDaysInProgram,
  formatWhatsAppUrl,
  getStudentProfile,
  isProductionUpdatePending,
  type StudentItem,
} from "@/domain/student-monitoring";
import { StudentProfileDrawer } from "./StudentProfileDrawer";

type Props = {
  students: StudentItem[];
  scores?: Record<string, number>;
  onStudentUpdated?: (updated: StudentItem) => void;
  canEdit?: boolean;
  isAuthorized?: boolean;
  onLoginClick?: () => void;
};

export function StudentMonitoringSection({
  students,
  scores = {},
  onStudentUpdated,
  canEdit = true,
  isAuthorized = true,
  onLoginClick,
}: Props) {
  const [search, setSearch] = useState("");
  const [agency, setAgency] = useState("todas");
  const [cert, setCert] = useState("todas");
  const [sort, setSort] = useState<"nome" | "maior_nota" | "menor_nota">("nome");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Extrair agências únicas para o filtro
  const availableAgencies = useMemo(() => {
    const setAg = new Set<string>();
    students.forEach((s) => {
      const prof = getStudentProfile(s);
      if (prof.agencia) setAg.add(prof.agencia);
    });
    return Array.from(setAg).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [students]);

  // Filtrar e ordenar a lista de estagiários
  const filteredStudents = useMemo(() => {
    return filterAndSortStudents(students, { search, agency, cert, sort }, scores);
  }, [students, search, agency, cert, sort, scores]);

  function handleClearFilters() {
    setSearch("");
    setAgency("todas");
    setCert("todas");
    setSort("nome");
  }

  async function handleExportExcel() {
    try {
      // @ts-expect-error XLSX is loaded via a script tag globally
      const xlsx = window.XLSX || (await import("xlsx"));
      const exportData = filteredStudents.map((s) => {
        const prof = getStudentProfile(s);
        return {
          Nome: s.nome,
          Funcional: prof.funcional || "",
          Agência: prof.agencia || "",
          Início: prof.inicio || "",
          "Tempo no Programa": formatDaysInProgram(prof.inicio),
          Certificação: prof.certificacao || "Sem certificação",
          Score: scores[s.id] ?? "—",
          Atenção: s.atencao ? "Sim" : "Não",
          "Última Atualização Produção": prof.ultima_atualizacao_producao || "Sem registro",
          Observações: s.obs || "",
        };
      });

      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Estagiários");
      xlsx.writeFile(workbook, `Nextuber_Acompanhamento_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error("Erro ao exportar Excel:", e);
    }
  }

  if (!isAuthorized) {
    return (
      <div
        className="lock-screen"
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
          Esta área é exclusiva para tutoras e gestores credenciados.
          <br />
          Faça login para visualizar o acompanhamento dos estagiários.
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Dynamic Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              color: "var(--ink, #111)",
            }}
          >
            Acompanhamento <em>individual</em>
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink3, #666)" }}>
            Toque no card para ver o perfil completo, trilha e adicionar observações.
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            border: "1px solid var(--border, #ccc)",
            borderRadius: "8px",
            background: "var(--surface, #fff)",
            color: "var(--ink, #111)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          title="Exportar resultados filtrados para Excel"
        >
          <span style={{ fontSize: "16px" }}>📊</span> Exportar Excel
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border, #eee)",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: "1 1 200px" }}>
          <span style={{ fontSize: "14px", color: "var(--ink3, #666)" }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar estagiário ou funcional..."
            style={{
              width: "100%",
              padding: "6px 10px",
              fontSize: "12.5px",
              border: "1px solid var(--border, #ccc)",
              borderRadius: "6px",
              background: "var(--bg, #f9f9f9)",
            }}
          />
        </div>

        {/* Agency Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "12px", color: "var(--ink2, #444)" }}>Agência:</label>
          <select
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            style={{
              fontSize: "12.5px",
              border: "1px solid var(--border, #ccc)",
              borderRadius: "6px",
              padding: "5px 10px",
              background: "var(--surface, #fff)",
              cursor: "pointer",
            }}
          >
            <option value="todas">Todas</option>
            {availableAgencies.map((ag) => (
              <option key={ag} value={ag}>
                {ag}
              </option>
            ))}
          </select>
        </div>

        {/* Certification Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "12px", color: "var(--ink2, #444)" }}>Certificação:</label>
          <select
            value={cert}
            onChange={(e) => setCert(e.target.value)}
            style={{
              fontSize: "12.5px",
              border: "1px solid var(--border, #ccc)",
              borderRadius: "6px",
              padding: "5px 10px",
              background: "var(--surface, #fff)",
              cursor: "pointer",
            }}
          >
            <option value="todas">Todas</option>
            <option value="sem">Sem certificação</option>
            <option value="CPA">CPA</option>
            <option value="C-PRO R">C-PRO R</option>
            <option value="C-PRO I">C-PRO I</option>
          </select>
        </div>

        {/* Sort Order */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "12px", color: "var(--ink2, #444)" }}>Ordenar por:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            style={{
              fontSize: "12.5px",
              border: "1px solid var(--border, #ccc)",
              borderRadius: "6px",
              padding: "5px 10px",
              background: "var(--surface, #fff)",
              cursor: "pointer",
            }}
          >
            <option value="nome">Nome (A-Z)</option>
            <option value="maior_nota">Maior nota</option>
            <option value="menor_nota">Menor nota</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={handleClearFilters}
          style={{
            fontSize: "12px",
            padding: "5px 12px",
            border: "1px solid var(--border, #ccc)",
            borderRadius: "6px",
            background: "var(--bg, #f5f5f5)",
            color: "var(--ink2, #444)",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Limpar
        </button>

        {/* Result Counter */}
        <div
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "var(--ink3, #666)",
            fontWeight: 500,
          }}
        >
          {filteredStudents.length} de {students.length} estagiários
        </div>
      </div>

      {/* Student Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {filteredStudents.map((s) => {
          const prof = getStudentProfile(s);
          const score = scores[s.id];
          const days = calcDaysInProgram(prof.inicio);
          const updatePending = isProductionUpdatePending(prof.ultima_atualizacao_producao);
          const whatsappUrl = formatWhatsAppUrl(prof.telefone, s.nome);

          return (
            <div
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              style={{
                background: "var(--surface, #fff)",
                border: s.atencao
                  ? "2px solid #FCA5A5"
                  : "1px solid var(--border, #eee)",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                position: "relative",
                boxShadow: s.atencao
                  ? "0 4px 12px rgba(239, 68, 68, 0.12)"
                  : "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              {/* Top Row: Avatar & Basic Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "var(--or, #EC7000)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {s.nome[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--ink, #111)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.nome}
                  </div>
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "var(--ink3, #666)",
                      fontFamily: "monospace",
                    }}
                  >
                    {prof.agencia || "Sem agência"}
                  </div>
                </div>
                {score !== undefined && (
                  <div
                    style={{
                      background: "var(--bg, #f5f5f5)",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--or, #EC7000)",
                    }}
                  >
                    {typeof score === "number" ? score.toFixed(1) : score}
                  </div>
                )}
              </div>

              {/* Badges Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "6px",
                  fontSize: "11px",
                }}
              >
                <span
                  style={{
                    background: "var(--bg, #f5f5f5)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    color: "var(--ink2, #444)",
                  }}
                >
                  ⏳ {days}d no programa
                </span>

                {prof.certificacao && prof.certificacao !== "Sem certificação" && (
                  <span
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}
                  >
                    📜 {prof.certificacao}
                  </span>
                )}

                {s.atencao && (
                  <span
                    style={{
                      background: "#FEF2F2",
                      color: "#DC2626",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ Atenção
                  </span>
                )}

                {updatePending && (
                  <span
                    style={{
                      background: "#FFFBEB",
                      color: "#B45309",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    🕒 Produção pendente
                  </span>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "4px",
                  paddingTop: "8px",
                  borderTop: "1px solid var(--border, #f0f0f0)",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "var(--or, #EC7000)", fontWeight: 500 }}>
                  Ver perfil completo →
                </span>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: "#25D366",
                      textDecoration: "none",
                      fontWeight: 600,
                      padding: "2px 6px",
                    }}
                    title="Falar no WhatsApp"
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--ink3, #666)",
            fontSize: "14px",
            background: "var(--surface, #fff)",
            borderRadius: "12px",
          }}
        >
          Nenhum estagiário encontrado com os filtros selecionados.
        </div>
      )}

      {/* Selected Student Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onStudentUpdated={(updated) => {
          setSelectedStudent(updated);
          if (onStudentUpdated) onStudentUpdated(updated);
        }}
        canEdit={canEdit}
      />
    </div>
  );
}
