"use client";

import { useSyncExternalStore } from "react";
import { AiAssistantModal } from "./AiAssistantModal";

export function AiAssistantIsland() {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) return null;

  return <AiAssistantModal />;
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}
