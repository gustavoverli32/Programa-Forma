"use client";

import { useState } from "react";
import {
  cleanEmployeeCode,
  validateStudentRegistrationInput,
} from "@/domain/registration";
import { nextuberMutationBridge } from "@/services/admin-mutations-client";
import type { StudentItem } from "@/domain/student-monitoring";

type Props = {
  onStudentCreated?: (newStudent: StudentItem) => void;
  canEdit?: boolean;
};

export function StudentRegistrationCard({ onStudentCreated, canEdit = true }: Props) {
  const [nome, setNome] = useState("");
  const [funcional, setFuncional] = useState("");
  const [agencia, setAgencia] = useState("");
  const [inicio, setInicio] = useState("");
  const [gaFuncional, setGaFuncional] = useState("");
  const [ggaFuncional, setGgaFuncional] = useState("");
  const [certificacao, setCertificacao] = useState("");
  const [diaAniv, setDiaAniv] = useState("");
  const [mesAniv, setMesAniv] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || saving) return;

    const validation = validateStudentRegistrationInput({
      nome,
      funcional,
      agencia,
      ga_funcional: gaFuncional,
      gga_funcional: ggaFuncional,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});

    try {
      setSaving(true);
      const res = await nextuberMutationBridge.createStudent({
        name: nome.trim(),
        months: ["Mês 1", "Mês 2", "Mês 3", "Mês 4", "Mês 5", "Mês 6"],
        notes: "",
        attention: false,
        profile: {
          funcional: cleanEmployeeCode(funcional),
          agencia: agencia.trim(),
          inicio: inicio || new Date().toISOString().slice(0, 10),
          certificacao: certificacao || "Sem certificação",
          dia_aniversario: diaAniv ? parseInt(diaAniv, 10) : undefined,
          mes_aniversario: mesAniv ? parseInt(mesAniv, 10) : undefined,
          ga_funcional: cleanEmployeeCode(gaFuncional) || undefined,
          gga_funcional: cleanEmployeeCode(ggaFuncional) || undefined,
        },
        trailChecks: {},
      });

      if (res.student) {
        setSavedSuccess(true);
        if (onStudentCreated) onStudentCreated(res.student as unknown as StudentItem);
        // Clear Form
        setNome("");
        setFuncional("");
        setAgencia("");
        setInicio("");
        setGaFuncional("");
        setGgaFuncional("");
        setCertificacao("");
        setDiaAniv("");
        setMesAniv("");
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar estagiário.";
      setErrors({ global: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #eee)",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Card Header Live Preview */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border, #eee)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
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
          {nome ? nome[0].toUpperCase() : "?"}
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink, #111)" }}>
            {nome || "Novo estagiário"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--ink3, #666)" }}>
            {funcional ? `Funcional: ${cleanEmployeeCode(funcional)}` : "Preencha os dados do estagiário abaixo"}
          </div>
        </div>
      </div>

      {errors.global && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#991B1B",
            padding: "10px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            marginBottom: "14px",
          }}
        >
          {errors.global}
        </div>
      )}

      {/* Form Fields Grid */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Nome completo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João Silva"
              maxLength={60}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: `1px solid ${errors.nome ? "#DC2626" : "var(--border, #ccc)"}`,
                fontSize: "13px",
              }}
            />
            {errors.nome && <span style={{ color: "#DC2626", fontSize: "11px" }}>{errors.nome}</span>}
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Funcional (9 dígitos) *
            </label>
            <input
              type="text"
              required
              value={funcional}
              onChange={(e) => setFuncional(cleanEmployeeCode(e.target.value))}
              placeholder="000000000"
              maxLength={9}
              inputMode="numeric"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: `1px solid ${errors.funcional ? "#DC2626" : "var(--border, #ccc)"}`,
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            />
            {errors.funcional && <span style={{ color: "#DC2626", fontSize: "11px" }}>{errors.funcional}</span>}
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Agência *
            </label>
            <input
              type="text"
              required
              value={agencia}
              onChange={(e) => setAgencia(e.target.value)}
              placeholder="Ex: 0001 - Centro"
              maxLength={20}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: `1px solid ${errors.agencia ? "#DC2626" : "var(--border, #ccc)"}`,
                fontSize: "13px",
              }}
            />
            {errors.agencia && <span style={{ color: "#DC2626", fontSize: "11px" }}>{errors.agencia}</span>}
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Data de Início
            </label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border, #ccc)",
                fontSize: "13px",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Certificação
            </label>
            <select
              value={certificacao}
              onChange={(e) => setCertificacao(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border, #ccc)",
                fontSize: "13px",
                background: "var(--surface, #fff)",
              }}
            >
              <option value="">Sem certificação</option>
              <option value="CPA">CPA</option>
              <option value="C-PRO R">C-PRO R</option>
              <option value="C-PRO I">C-PRO I</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Funcional GA
            </label>
            <input
              type="text"
              value={gaFuncional}
              onChange={(e) => setGaFuncional(cleanEmployeeCode(e.target.value))}
              placeholder="000000000"
              maxLength={9}
              inputMode="numeric"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: `1px solid ${errors.ga_funcional ? "#DC2626" : "var(--border, #ccc)"}`,
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            />
            {errors.ga_funcional && <span style={{ color: "#DC2626", fontSize: "11px" }}>{errors.ga_funcional}</span>}
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Funcional GGA
            </label>
            <input
              type="text"
              value={ggaFuncional}
              onChange={(e) => setGgaFuncional(cleanEmployeeCode(e.target.value))}
              placeholder="000000000"
              maxLength={9}
              inputMode="numeric"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: `1px solid ${errors.gga_funcional ? "#DC2626" : "var(--border, #ccc)"}`,
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            />
            {errors.gga_funcional && <span style={{ color: "#DC2626", fontSize: "11px" }}>{errors.gga_funcional}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
              Aniversário (Dia e Mês)
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={diaAniv}
                onChange={(e) => setDiaAniv(e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="">Dia</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={mesAniv}
                onChange={(e) => setMesAniv(e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              >
                <option value="">Mês</option>
                {[
                  "Janeiro",
                  "Fevereiro",
                  "Março",
                  "Abril",
                  "Maio",
                  "Junho",
                  "Julho",
                  "Agosto",
                  "Setembro",
                  "Outubro",
                  "Novembro",
                  "Dezembro",
                ].map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
          <button
            type="submit"
            disabled={!canEdit || saving}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              background: "var(--or, #EC7000)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {saving ? "Adicionando..." : "+ Adicionar Estagiário"}
          </button>
          {savedSuccess && (
            <span style={{ color: "#166534", fontSize: "12px", fontWeight: 600 }}>
              ✓ Estagiário cadastrado com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
