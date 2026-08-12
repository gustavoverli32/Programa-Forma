"use client";

import { useSyncExternalStore } from "react";
import { AiAssistantModal } from "./AiAssistantModal";

export function AiAssistantIsland() {
  const isAuthed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isAuthed) return null;

  return <AiAssistantModal />;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("nextuber-auth-changed", callback);
  const interval = setInterval(callback, 1000);
  return () => {
    window.removeEventListener("nextuber-auth-changed", callback);
    clearInterval(interval);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { editor?: boolean; modoGestor?: boolean };
  return !!(w.editor || w.modoGestor);
}

function getServerSnapshot() {
  return false;
}
