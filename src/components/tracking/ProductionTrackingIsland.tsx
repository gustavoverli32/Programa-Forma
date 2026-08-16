"use client";

import {
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import type { ProductionRow } from "@/domain/production";
import { quantityWeeksInMonth } from "@/domain/production-deadline";
import {
  CREDIT_COLORS,
  CREDIT_MODALITIES,
  currentQuarterMonthIndex,
  formatAmount,
  itemMonthTotal,
  itemQuarterTotal,
  monthEntries,
  monthTotal,
  OTHER_PRODUCT_COLORS,
  OTHER_PRODUCTS,
  parseAmount,
  productTargetsForQuarter,
  productionRef,
  productionValues,
  quarterCreditTotal,
  quarterMonths,
  resultTone,
  targetForQuarter,
  targetAchievementPercent,
  valueAt,
  weekTotal,
} from "@/domain/production-view";
import { nextuberProductionBridge } from "@/services/production-client";
import {
  nextuberTrackingBridge,
  type ProductionTrackingPayload,
} from "@/services/tracking-bridge";

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 11,
  background: "var(--surface)",
  borderRadius: 6,
  overflow: "hidden",
};

const headerCellStyle: CSSProperties = {
  padding: "6px 4px",
  fontSize: 10,
  color: "var(--ink3)",
  fontWeight: 600,
  textTransform: "uppercase",
  border: "1px solid var(--border)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "4px 5px",
  border: "1px solid var(--border)",
  borderRadius: 4,
  fontFamily: "inherit",
  fontSize: 11,
  textAlign: "center",
  background: "var(--surface)",
};

function ProductionTable({
  labels,
  colors,
  kind,
  values,
  quarterRef,
  monthIndex,
  canEdit,
  onChange,
}: {
  labels: readonly string[];
  colors: readonly string[];
  kind: "MOD" | "OUT";
  values: Record<string, number>;
  quarterRef: string;
  monthIndex: number;
  canEdit: boolean;
  onChange: (ref: string, value: number) => void;
}) {
  const weeks = quantityWeeksInMonth(quarterRef, monthIndex);
  const label = kind === "MOD" ? "Modalidade" : "Produto";

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "var(--bg)" }}>
            <th style={{ ...headerCellStyle, textAlign: "left", letterSpacing: ".04em" }}>
              {label}
            </th>
            {Array.from({ length: weeks }, (_, index) => (
              <th key={index} style={headerCellStyle}>
                Sem {index + 1}
              </th>
            ))}
            <th style={{ ...headerCellStyle, background: "var(--bg)" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((item, itemIndex) => (
            <tr key={item}>
              <td
                style={{
                  padding: 6,
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                  color: colors[itemIndex],
                  fontSize: 11,
                }}
              >
                {item}
              </td>
              {Array.from({ length: weeks }, (_, weekIndex) => {
                const ref = productionRef(
                  quarterRef,
                  monthIndex,
                  weekIndex + 1,
                  kind,
                  itemIndex,
                );
                return (
                  <td key={ref} style={{ padding: 3, border: "1px solid var(--border)" }}>
                    <input
                      aria-label={`${item}, semana ${weekIndex + 1}`}
                      disabled={!canEdit}
                      inputMode="numeric"
                      style={{
                        ...inputStyle,
                        opacity: canEdit ? 1 : 0.6,
                        cursor: canEdit ? "text" : "not-allowed",
                      }}
                      type="text"
                      value={formatAmount(valueAt(values, ref))}
                      placeholder="0"
                      onChange={(event) => onChange(ref, parseAmount(event.target.value))}
                    />
                  </td>
                );
              })}
              <td
                style={{
                  padding: 6,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: 11,
                }}
              >
                {itemMonthTotal(values, quarterRef, monthIndex, kind, itemIndex).toLocaleString(
                  "pt-BR",
                )}
              </td>
            </tr>
          ))}
          <tr style={{ background: "var(--bg)", fontWeight: 700 }}>
            <td
              style={{
                padding: 6,
                border: "1px solid var(--border)",
                fontSize: 10,
                textTransform: "uppercase",
                color: "var(--ink)",
                letterSpacing: ".04em",
              }}
            >
              Total
            </td>
            {Array.from({ length: weeks }, (_, weekIndex) => (
              <td
                key={weekIndex}
                style={{
                  padding: 6,
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  fontSize: 11,
                }}
              >
                {weekTotal(values, quarterRef, monthIndex, weekIndex + 1, kind).toLocaleString(
                  "pt-BR",
                )}
              </td>
            ))}
            <td
              style={{
                padding: 6,
                border: "1px solid var(--border)",
                background: "var(--or-l)",
                color: "var(--or-d)",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {monthTotal(values, quarterRef, monthIndex, kind).toLocaleString("pt-BR")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ProductionResults({ payload }: { payload: ProductionTrackingPayload }) {
  const [rows, setRows] = useState<ProductionRow[]>(payload.productionRows);
  const [values, setValues] = useState(() => productionValues(payload.productionRows));
  const [target, setTarget] = useState(() => targetForQuarter(payload.productionRows, payload.quarterRef));
  const [productTargets, setProductTargets] = useState(() =>
    productTargetsForQuarter(payload.productionRows, payload.quarterRef),
  );
  const [monthIndex, setMonthIndex] = useState(() => currentQuarterMonthIndex(payload.quarterRef));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [targetEditor, setTargetEditor] = useState<{
    kind: "agency" | "product";
    productIndex: number;
    label: string;
    value: number;
  } | null>(null);
  const [targetDraft, setTargetDraft] = useState("");
  const [targetSaving, setTargetSaving] = useState(false);
  const [targetSaved, setTargetSaved] = useState("");
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const months = quarterMonths(payload.quarterRef);
  const currentMonthIndex = currentQuarterMonthIndex(payload.quarterRef);
  const total = quarterCreditTotal(values, rows, payload.quarterRef);
  const selectedMonth = months[monthIndex - 1];
  const creditMonthTotal = monthTotal(values, payload.quarterRef, monthIndex, "MOD");
  const otherMonthTotal = monthTotal(values, payload.quarterRef, monthIndex, "OUT");

  const updateValue = (ref: string, value: number) => {
    setValues((current) => ({ ...current, [ref]: value }));
    setDirty((current) => {
      const next = new Set(current);
      next.add(ref);
      return next;
    });
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const entries = monthEntries(values, payload.quarterRef, monthIndex).filter(
        (entry) => dirty.has(entry.ref),
      );
      const result = await nextuberProductionBridge.saveBatch({
        studentId: payload.student.id,
        quarterRef: payload.quarterRef,
        target,
        productTargets,
        entries,
      });
      setRows(result.productionRows);
      setValues(productionValues(result.productionRows));
      setDirty(new Set());
      setSaved(true);
      window.dispatchEvent(
        new CustomEvent("nextuber:production-saved", {
          detail: {
            studentId: payload.student.id,
            quarterRef: payload.quarterRef,
            productionRows: result.productionRows,
            profile: result.profile,
            productionAuditHistory: result.productionAuditHistory,
          },
        }),
      );
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Salvar resultados:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Os dados não foram salvos por completo. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openTargetEditor = (
    kind: "agency" | "product",
    productIndex: number,
    label: string,
    value: number,
  ) => {
    if (!payload.canEdit) return;
    setTargetEditor({ kind, productIndex, label, value });
    setTargetDraft(formatAmount(value));
    setTargetSaved("");
  };

  const saveTarget = async () => {
    if (!targetEditor) return;
    const nextValue = parseAmount(targetDraft);
    const nextTarget = targetEditor.kind === "agency" ? nextValue : target;
    const nextProductTargets = [...productTargets];
    if (targetEditor.kind === "product") {
      nextProductTargets[targetEditor.productIndex] = nextValue;
    }

    setTargetSaving(true);
    try {
      const result = await nextuberProductionBridge.saveBatch({
        studentId: payload.student.id,
        quarterRef: payload.quarterRef,
        target: nextTarget,
        productTargets: nextProductTargets,
        entries: [],
      });
      setTarget(nextTarget);
      setProductTargets(nextProductTargets);
      setRows(result.productionRows);
      setTargetEditor(null);
      setTargetSaved(`${targetEditor.label} salva`);
      window.setTimeout(() => setTargetSaved(""), 2200);
    } catch (error) {
      console.error("Salvar meta trimestral:", error);
      window.alert(
        error instanceof Error ? error.message : "Não foi possível salvar a meta.",
      );
    } finally {
      setTargetSaving(false);
    }
  };

  const targetCards = [
    {
      kind: "agency" as const,
      productIndex: -1,
      label: "Meta trimestral da agência (equilíbrio)",
      shortLabel: "Meta trimestral da agência (equilíbrio)",
      value: target,
      produced: total,
      color: "var(--or)",
      background: "var(--or-l)",
    },
    ...OTHER_PRODUCTS.map((product, productIndex) => ({
      kind: "product" as const,
      productIndex,
      label: `Meta de ${product}`,
      shortLabel: `Meta de ${product}`,
      value: productTargets[productIndex] ?? 0,
      produced: itemQuarterTotal(values, payload.quarterRef, "OUT", productIndex),
      color: OTHER_PRODUCT_COLORS[productIndex],
      background: "var(--surface)",
    })),
  ];

  return (
    <>
      <section className="production-target-section" aria-labelledby="production-target-title">
        <div className="production-target-heading">
          <div>
            <div id="production-target-title" className="production-target-title">Metas trimestrais</div>
            <div className="production-target-help">
              {payload.canEdit ? "Toque em um card para editar" : "Metas definidas para o trimestre"}
            </div>
          </div>
          {targetSaved ? <span className="production-target-saved">✓ {targetSaved}</span> : null}
        </div>
        <div className="production-target-grid">
          {targetCards.map((card) => {
            const cardPercent = targetAchievementPercent(card.produced, card.value);
            const cardTone = resultTone(cardPercent);
            const hasTarget = card.value > 0;
            return (
              <button
                key={`${card.kind}-${card.productIndex}`}
                type="button"
                className={`production-target-card${card.kind === "agency" ? " agency" : ""}`}
                disabled={!payload.canEdit}
                aria-label={`${card.label}. Meta: ${card.value.toLocaleString("pt-BR") || "não definida"}. Produzido: ${card.produced.toLocaleString("pt-BR")}. Atingido: ${hasTarget ? `${cardPercent}%` : "não calculado"}`}
                style={{ borderTopColor: card.color, background: card.background }}
                onClick={() =>
                  openTargetEditor(card.kind, card.productIndex, card.label, card.value)
                }
              >
                <span className="production-target-card-label">{card.shortLabel}</span>
                <span className="production-target-card-main">
                  <span>
                    <small>Meta</small>
                    <strong style={{ color: card.value > 0 ? card.color : "var(--ink3)" }}>
                      {card.value > 0 ? card.value.toLocaleString("pt-BR") : "Definir"}
                    </strong>
                  </span>
                  <span
                    className="production-target-percent"
                    style={{
                      color: hasTarget ? cardTone.color : "var(--ink3)",
                      background: hasTarget ? cardTone.background : "var(--bg)",
                    }}
                  >
                    {hasTarget ? `${cardPercent}%` : "—"}
                  </span>
                </span>
                <span className="production-target-progress" aria-hidden="true">
                  <span
                    style={{
                      width: `${cardPercent}%`,
                      background: hasTarget ? cardTone.color : "var(--border2)",
                    }}
                  />
                </span>
                <span className="production-target-card-footer">
                  <span>Produzido: <b>{card.produced.toLocaleString("pt-BR")}</b></span>
                  {payload.canEdit ? <span className="production-target-edit">Editar</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
        <button
          disabled={monthIndex === 1}
          style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: monthIndex === 1 ? "default" : "pointer", fontSize: 12, fontWeight: 500, color: "var(--or)", opacity: monthIndex === 1 ? 0.5 : 1 }}
          onClick={() => setMonthIndex((current) => Math.max(1, current - 1))}
        >
          ← Anterior
        </button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{selectedMonth}</div>
          <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>
            {monthIndex === currentMonthIndex ? (
              <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>● Mês vigente</span>
            ) : null}
          </div>
        </div>
        <button
          disabled={monthIndex === 3}
          style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: monthIndex === 3 ? "default" : "pointer", fontSize: 12, fontWeight: 500, color: "var(--or)", opacity: monthIndex === 3 ? 0.5 : 1 }}
          onClick={() => setMonthIndex((current) => Math.min(3, current + 1))}
        >
          Próximo →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".06em" }}>{selectedMonth} - Modalidades</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--or)", fontSize: 10, fontWeight: 600 }}>{monthIndex === currentMonthIndex ? "● Mês vigente" : "✎ Editável"}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>Total: {creditMonthTotal.toLocaleString("pt-BR")}</span>
            </div>
          </div>
          <ProductionTable labels={CREDIT_MODALITIES} colors={CREDIT_COLORS} kind="MOD" values={values} quarterRef={payload.quarterRef} monthIndex={monthIndex} canEdit={payload.canEdit} onChange={updateValue} />
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".06em" }}>{selectedMonth} - Outros Produtos</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>Total: {otherMonthTotal.toLocaleString("pt-BR")}</span>
          </div>
          <ProductionTable labels={OTHER_PRODUCTS} colors={OTHER_PRODUCT_COLORS} kind="OUT" values={values} quarterRef={payload.quarterRef} monthIndex={monthIndex} canEdit={payload.canEdit} onChange={updateValue} />
        </div>
      </div>

      {payload.canEdit ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <button className="btn-obs" disabled={saving} onClick={save}>{saving ? "Salvando..." : "Salvar"}</button>
          <span className={`obs-saved${saved ? " show" : ""}`}>✓ Dados salvos</span>
        </div>
      ) : null}

      {targetEditor ? (
        <div
          className="production-target-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !targetSaving) setTargetEditor(null);
          }}
        >
          <form
            className="production-target-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="production-target-dialog-title"
            onSubmit={(event) => {
              event.preventDefault();
              void saveTarget();
            }}
          >
            <div className="production-target-dialog-kicker">Meta trimestral</div>
            <h3 id="production-target-dialog-title">{targetEditor.label}</h3>
            <p>Informe o valor planejado para o trimestre selecionado.</p>
            <input
              autoFocus
              aria-label={`Valor da ${targetEditor.label}`}
              className="field-in"
              inputMode="numeric"
              type="text"
              value={targetDraft}
              placeholder="0"
              onChange={(event) => setTargetDraft(formatAmount(parseAmount(event.target.value)))}
            />
            <div className="production-target-dialog-actions">
              <button
                type="button"
                className="btn-sm"
                disabled={targetSaving}
                onClick={() => setTargetEditor(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-sm pr" disabled={targetSaving}>
                {targetSaving ? "Salvando..." : "Salvar meta"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

export function ProductionTrackingIsland() {
  const payload = useSyncExternalStore(
    nextuberTrackingBridge.subscribe,
    nextuberTrackingBridge.getSnapshot,
    nextuberTrackingBridge.getServerSnapshot,
  );
  const container = useSyncExternalStore(
    subscribeToPortalTarget,
    getPortalTarget,
    getServerPortalTarget,
  );

  return container && payload
    ? createPortal(
        <ProductionResults
          key={`${payload.student.id}:${payload.quarterRef}:${payload.revision}`}
          payload={payload}
        />,
        container,
      )
    : null;
}

function subscribeToPortalTarget(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function getPortalTarget() {
  return document.getElementById("pResultados");
}

function getServerPortalTarget() {
  return null;
}
