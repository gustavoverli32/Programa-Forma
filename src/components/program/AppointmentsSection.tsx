"use client";

import { useState } from "react";
import { filterAppointments, type AppointmentItem } from "@/domain/program";
import type { StudentItem } from "@/domain/student-monitoring";
import { nextuberMutationBridge } from "@/services/admin-mutations-client";

type Props = {
  appointments?: AppointmentItem[];
  students?: StudentItem[];
  canEdit?: boolean;
  isAuthorized?: boolean;
  onAppointmentCreated?: (newApp: AppointmentItem) => void;
  onAppointmentUpdated?: (updated: AppointmentItem) => void;
  onAppointmentDeleted?: (id: string) => void;
  onLoginClick?: () => void;
};

export function AppointmentsSection({
  appointments = [],
  students = [],
  canEdit = true,
  isAuthorized = true,
  onAppointmentCreated,
  onAppointmentUpdated,
  onAppointmentDeleted,
  onLoginClick,
}: Props) {
  const [faseFilter, setFaseFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [fase, setFase] = useState("fase1");
  const [tipo, setTipo] = useState("aula");
  const [estagiarioId, setEstagiarioId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filtered = filterAppointments(appointments, faseFilter, tipoFilter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || saving) return;

    try {
      setSaving(true);
      let fileUrl = "";
      let fileName = "";

      if (selectedFile) {
        setUploading(true);
        const uploadRes = await nextuberMutationBridge.uploadAppointment(selectedFile);
        fileUrl = uploadRes.fileUrl;
        fileName = uploadRes.fileName;
      }

      const res = await nextuberMutationBridge.createAppointment({
        studentId: estagiarioId || undefined,
        title: titulo.trim(),
        date: data,
        phase: fase,
        type: tipo,
        description: descricao.trim() || undefined,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
      });

      if (res.appointment && onAppointmentCreated) {
        onAppointmentCreated(res.appointment as unknown as AppointmentItem);
      }

      // Reset form
      setTitulo("");
      setData("");
      setFase("fase1");
      setTipo("aula");
      setEstagiarioId("");
      setDescricao("");
      setSelectedFile(null);
      setShowForm(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao criar agendamento.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!canEdit) return;
    if (!confirm("Deseja realmente excluir este agendamento?")) return;
    try {
      await nextuberMutationBridge.deleteAppointment(id);
      if (onAppointmentDeleted) onAppointmentDeleted(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir agendamento.");
    }
  }

  async function handleToggleStatus(item: AppointmentItem) {
    if (!canEdit) return;
    const newStatus = item.status === "Presente" ? "Pendente" : "Presente";
    try {
      const res = await nextuberMutationBridge.updateAppointment(item.id, {
        status: newStatus,
      });
      if (res.appointment && onAppointmentUpdated) {
        onAppointmentUpdated(res.appointment as unknown as AppointmentItem);
      }
    } catch (err) {
      console.error(err);
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
          Faça login para visualizar e registrar agendamentos.
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "var(--ink, #111)" }}>
          Agendamentos
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink3, #666)" }}>
          Registre aulas, workshops, treinamentos e encontros com os estagiários.
        </p>
      </div>

      {/* Filter and Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={faseFilter}
            onChange={(e) => setFaseFilter(e.target.value)}
            style={{
              fontSize: "13px",
              border: "1px solid var(--border, #ccc)",
              borderRadius: "8px",
              padding: "8px 12px",
              background: "var(--surface, #fff)",
              cursor: "pointer",
            }}
          >
            <option value="todos">Todas as fases</option>
            <option value="fase1">Fase 1 - Decolar</option>
            <option value="fase2">Fase 2 - Evoluir</option>
            <option value="fase3">Fase 3 - Impactar</option>
          </select>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            style={{
              fontSize: "13px",
              border: "1px solid var(--border, #ccc)",
              borderRadius: "8px",
              padding: "8px 12px",
              background: "var(--surface, #fff)",
              cursor: "pointer",
            }}
          >
            <option value="todos">Todos os tipos</option>
            <option value="aula">Aula</option>
            <option value="workshop">Workshop</option>
            <option value="treinamento">Treinamento</option>
            <option value="reuniao">Reunião</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {canEdit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
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
            + Novo Agendamento
          </button>
        )}
      </div>

      {/* Modal / Form para criar Agendamento */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--surface, #fff)",
            border: "1px solid var(--border, #ccc)",
            borderRadius: "14px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink, #111)" }}>
            Registrar Novo Agendamento
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Título *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Treinamento de Seguros"
                maxLength={80}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Data *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Fase do Programa
              </label>
              <select
                value={fase}
                onChange={(e) => setFase(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="fase1">Fase 1 - Decolar</option>
                <option value="fase2">Fase 2 - Evoluir</option>
                <option value="fase3">Fase 3 - Impactar</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Tipo de Evento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="aula">Aula</option>
                <option value="workshop">Workshop</option>
                <option value="treinamento">Treinamento</option>
                <option value="reuniao">Reunião</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Estagiário (opcional)
              </label>
              <select
                value={estagiarioId}
                onChange={(e) => setEstagiarioId(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="">Todos os estagiários / Geral</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Descrição / Pauta
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Pauta ou informações para os participantes..."
                rows={3}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Anexar Arquivo / Comprovante (opcional)
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ fontSize: "12.5px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: "13px" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "8px 20px", borderRadius: "6px", border: "none", background: "var(--or, #EC7000)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
            >
              {saving ? (uploading ? "Enviando arquivo..." : "Salvando...") : "Salvar Agendamento"}
            </button>
          </div>
        </form>
      )}

      {/* Appointments List */}
      <div style={{ display: "grid", gap: "12px" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--ink3, #666)",
              fontSize: "14px",
              background: "var(--surface, #fff)",
              borderRadius: "12px",
            }}
          >
            Nenhum agendamento encontrado.
          </div>
        ) : (
          filtered.map((item) => {
            const isPresent = item.status === "Presente";

            return (
              <div
                key={item.id}
                style={{
                  background: "var(--surface, #fff)",
                  border: "1px solid var(--border, #eee)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "#EFF6FF",
                        color: "#1D4ED8",
                      }}
                    >
                      {item.tipo || "Evento"}
                    </span>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--ink, #111)" }}>
                      {item.titulo}
                    </h4>
                  </div>
                  {item.descricao && (
                    <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--ink3, #666)" }}>
                      {item.descricao}
                    </p>
                  )}
                  {item.arquivo_url && (
                    <a
                      href={item.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "12px", color: "var(--or, #EC7000)", textDecoration: "none", fontWeight: 600, display: "inline-block", marginTop: "6px" }}
                    >
                      📎 Ver anexo ({item.arquivo_nome || "Arquivo"})
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink, #111)" }}>
                      {new Date(item.data).toLocaleDateString("pt-BR")}
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => handleToggleStatus(item)}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                          marginTop: "2px",
                          background: isPresent ? "#DCFCE7" : "#FEF3C7",
                          color: isPresent ? "#166534" : "#B45309",
                        }}
                      >
                        {isPresent ? "✓ Presença Confirmada" : "Pendente"}
                      </button>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "16px",
                        cursor: "pointer",
                        color: "#DC2626",
                        padding: "4px",
                      }}
                      title="Excluir agendamento"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
