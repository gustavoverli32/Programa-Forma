"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { TrilhasSection } from "./TrilhasSection";

export function TrilhasIsland() {
  const container = useSyncExternalStore(
    subscribeToPortalTarget,
    getPortalTarget,
    getServerPortalTarget,
  );

  if (!container) return null;

  return createPortal(<TrilhasSection />, container);
}

function subscribeToPortalTarget(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function getPortalTarget() {
  return document.getElementById("page-trilhas");
}

function getServerPortalTarget() {
  return null;
}
