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
  productionRef,
  productionValues,
  quarterCreditTotal,
  quarterMonths,
  resultTone,
  targetForQuarter,
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

function DistributionChart({
  labels,
  colors,
  kind,
  values,
  quarterRef,
}: {
  labels: readonly string[];
  colors: readonly string[];
  kind: "MOD" | "OUT";
  values: Record<string, number>;
  quarterRef: string;
}) {
  const items = labels.map((name, index) => ({
    name,
    color: colors[index],
    value: itemQuarterTotal(values, quarterRef, kind, index),
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--ink3)", fontStyle: "italic", padding: "10px 0" }}>
        Sem vendas registradas ainda.
      </div>
    );
  }

  const circumference = 283;
  const segmentData = items.map((item) => ({
    ...item,
    arc: (item.value / total) * circumference,
  }));
  const segments = segmentData.map((item, index) => {
    const arc = item.arc;
    const offset = segmentData
      .slice(0, index)
      .reduce((sum, previous) => sum + previous.arc, 0);
    return (
      <circle
        key={item.name}
        cx="60"
        cy="60"
        r="45"
        fill="none"
        stroke={item.color}
        strokeWidth="22"
        strokeDasharray={`${arc.toFixed(2)} ${(circumference - arc).toFixed(2)}`}
        strokeDashoffset={`-${offset.toFixed(2)}`}
        transform="rotate(-90 60 60)"
      />
    );
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
      <svg viewBox="0 0 120 120" style={{ width: 150, height: 150, flexShrink: 0 }}>
        {segments}
      </svg>
      <div style={{ flex: 1, minWidth: 140 }}>
        {items.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: "var(--ink)" }}>{item.name}</div>
              <div style={{ fontSize: 10, color: "var(--ink3)" }}>
                R$ {item.value.toLocaleString("pt-BR")} ({Math.round((item.value / total) * 100)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function ProductionResults({ payload }: { payload: ProductionTrackingPayload }) {
  const [rows, setRows] = useState<ProductionRow[]>(payload.productionRows);
  const [values, setValues] = useState(() => productionValues(payload.productionRows));
  const [target, setTarget] = useState(() => targetForQuarter(payload.productionRows, payload.quarterRef));
  const [monthIndex, setMonthIndex] = useState(() => currentQuarterMonthIndex(payload.quarterRef));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const months = quarterMonths(payload.quarterRef);
  const currentMonthIndex = currentQuarterMonthIndex(payload.quarterRef);
  const total = quarterCreditTotal(values, rows, payload.quarterRef);
  const percent = target > 0 ? Math.round(Math.min(total / target, 1) * 100) : 0;
  const tone = resultTone(percent);
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

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ background: "var(--bg)", borderRadius: "var(--r2)", padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "var(--ink3)", marginBottom: 3 }}>Alvo trimestral</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{target.toLocaleString("pt-BR")}</div>
        </div>
        <div style={{ background: "var(--bg)", borderRadius: "var(--r2)", padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "var(--ink3)", marginBottom: 3 }}>Total produzido</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: total > 0 ? tone.color : "var(--ink3)" }}>{total.toLocaleString("pt-BR")}</div>
        </div>
        <div style={{ background: tone.background, borderRadius: "var(--r2)", padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: tone.color, marginBottom: 3 }}>Atingido</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: tone.color }}>{target > 0 ? `${percent}%` : "—"}</div>
        </div>
      </div>
      <div style={{ height: 5, background: "var(--bg)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${Math.min(percent, 100)}%`, height: "100%", background: tone.color }} />
      </div>

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

      {payload.canEdit ? (
        <div className="field-grp" style={{ marginBottom: 14 }}>
          <div className="field-lbl">Alvo do trimestre</div>
          <input
            aria-label="Alvo do trimestre"
            className="field-in"
            inputMode="numeric"
            style={{ fontSize: 13 }}
            type="text"
            value={formatAmount(target)}
            placeholder="0"
            onChange={(event) => {
              setTarget(parseAmount(event.target.value));
              setSaved(false);
            }}
          />
        </div>
      ) : null}

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Equilíbrio (trimestre)</div>
          <DistributionChart labels={CREDIT_MODALITIES} colors={CREDIT_COLORS} kind="MOD" values={values} quarterRef={payload.quarterRef} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Outros Produtos (trimestre)</div>
          <DistributionChart labels={OTHER_PRODUCTS} colors={OTHER_PRODUCT_COLORS} kind="OUT" values={values} quarterRef={payload.quarterRef} />
        </div>
      </div>
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
