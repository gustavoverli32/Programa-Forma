import type { ProductionRow } from "@/domain/production";

export type ProductionTrackingInput = {
  student: { id: string; name: string };
  quarterRef: string;
  productionRows: ProductionRow[];
  canEdit: boolean;
};

export type ProductionTrackingPayload = ProductionTrackingInput & {
  revision: number;
};

type Listener = () => void;

let currentPayload: ProductionTrackingPayload | null = null;
let revision = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const nextuberTrackingBridge = {
  open(payload: ProductionTrackingInput) {
    revision += 1;
    currentPayload = { ...payload, revision };
    emit();
  },
  close() {
    currentPayload = null;
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return currentPayload;
  },
  getServerSnapshot() {
    return null;
  },
};

export type NextuberTrackingBridge = typeof nextuberTrackingBridge;
