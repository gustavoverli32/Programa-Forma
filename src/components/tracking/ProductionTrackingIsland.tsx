"use client";

import {
  useEffect,
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
import { nextuberReadBridge } from "@/services/read-client";
import {
  nextuberTrackingBridge,
  type ProductionTrackingPayload,
} from "@/services/tracking-bridge";

type Snapshot = {
  id?: string;
  tri_ref?: string;
  score?: number | string | null;
};

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

function ProductionHistory({ studentId }: { studentId: string }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    let active = true;
    nextuberReadBridge
      .snapshots(studentId)
      .then((result) => {
        if (active) setSnapshots(result.snapshots as Snapshot[]);
      })
      .catch(() => {
        if (active) setSnapshots([]);
      });
    return () => {
      active = false;
    };
  }, [studentId]);

  if (!snapshots.length) return null;
  const width = 200;
  const height = 80;
  const left = 22;
  const right = 8;
  const top = 10;
  const bottom = 18;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const points = snapshots.map((snapshot, index) => {
    const score = Number(snapshot.score) || 0;
    return {
      x: left + (snapshots.length > 1 ? (index * innerWidth) / (snapshots.length - 1) : innerWidth / 2),
      y: top + innerHeight - (score / 10) * innerHeight,
      score,
      quarter: snapshot.tri_ref || "",
    };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${path} L${points.at(-1)?.x},${top + innerHeight} L${points[0]?.x},${top + innerHeight} Z`;
  const gradientId = `production-history-${studentId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", marginTop: 14 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink3)", fontWeight: 500, marginBottom: 6 }}>
        Evolução da nota
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", maxHeight: 140, display: "block" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EC7000" stopOpacity=".25" />
            <stop offset="100%" stopColor="#EC7000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 2.5, 5, 7.5, 10].map((value) => {
          const y = top + innerHeight - (value / 10) * innerHeight;
          return (
            <g key={value}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#eee" strokeWidth=".25" />
              <text x={left - 2} y={y + 1.3} fontSize="3.5" fill="#999" textAnchor="end">{value}</text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke="#EC7000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => {
          const color = point.score >= 8 ? "#16A34A" : point.score >= 5 ? "#EC7000" : "#DC2626";
          const [year, quarter] = point.quarter.split("-Q");
          return (
            <g key={point.quarter}>
              <circle cx={point.x} cy={point.y} r="1.4" fill={color} stroke="#fff" strokeWidth=".6" />
              <text x={point.x} y={point.y - 2.5} fontSize="3.5" fontWeight="600" fill={color} textAnchor="middle">{point.score}</text>
              <text x={point.x} y={height - 4} fontSize="3.5" fill="#999" textAnchor="middle">{quarter && year ? `${quarter.replace("Q", "T")}/${year.slice(2)}` : ""}</text>
            </g>
          );
        })}
      </svg>
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
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await nextuberProductionBridge.saveBatch({
        studentId: payload.student.id,
        quarterRef: payload.quarterRef,
        target,
        entries: monthEntries(values, payload.quarterRef, monthIndex),
      });
      setRows(result.productionRows);
      setValues(productionValues(result.productionRows));
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

      <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--bg)", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".06em" }}>{selectedMonth} - Modalidades</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--or)", fontSize: 10, fontWeight: 600 }}>{monthIndex === currentMonthIndex ? "● Mês vigente" : "✎ Editável"}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>Total: {creditMonthTotal.toLocaleString("pt-BR")}</span>
          </div>
        </div>
        <ProductionTable labels={CREDIT_MODALITIES} colors={CREDIT_COLORS} kind="MOD" values={values} quarterRef={payload.quarterRef} monthIndex={monthIndex} canEdit={payload.canEdit} onChange={updateValue} />
      </div>

      {payload.canEdit ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <button className="btn-obs" disabled={saving} onClick={save}>{saving ? "Salvando..." : "Salvar"}</button>
          <span className={`obs-saved${saved ? " show" : ""}`}>✓ Dados salvos</span>
        </div>
      ) : null}

      <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--bg)", marginBottom: 14, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".06em" }}>{selectedMonth} - Outros Produtos</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>Total: {otherMonthTotal.toLocaleString("pt-BR")}</span>
        </div>
        <ProductionTable labels={OTHER_PRODUCTS} colors={OTHER_PRODUCT_COLORS} kind="OUT" values={values} quarterRef={payload.quarterRef} monthIndex={monthIndex} canEdit={payload.canEdit} onChange={updateValue} />
      </div>

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Equilíbrio (trimestre)</div>
        <DistributionChart labels={CREDIT_MODALITIES} colors={CREDIT_COLORS} kind="MOD" values={values} quarterRef={payload.quarterRef} />
      </div>
      <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Outros Produtos (trimestre)</div>
        <DistributionChart labels={OTHER_PRODUCTS} colors={OTHER_PRODUCT_COLORS} kind="OUT" values={values} quarterRef={payload.quarterRef} />
      </div>
      <ProductionHistory studentId={payload.student.id} />
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
