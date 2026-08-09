"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SettingsSection } from "./SettingsSection";

export function SettingsIsland() {
  const [activeDeadline, setActiveDeadline] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  const container = useSyncExternalStore(
    subscribeToPortalTarget,
    getPortalTarget,
    getServerPortalTarget,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const bootstrapRes = await fetch("/api/data/bootstrap", { credentials: "same-origin" });
        if (cancelled) return;

        if (bootstrapRes.status === 401 || bootstrapRes.status === 403) {
          setIsAuthorized(false);
          setLoaded(true);
          return;
        }

        if (bootstrapRes.ok) {
          const bData = await bootstrapRes.json();
          if (cancelled) return;

          setIsAuthorized(true);
          setCanEdit(bData.role === "tutora" || bData.role === "gestor");
          if (bData.settings && bData.settings.prazo_producao) {
            setActiveDeadline(String(bData.settings.prazo_producao));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleDeadlineUpdated(newDeadline: string) {
    setActiveDeadline(newDeadline);
  }

  function handleLoginClick() {
    const btnMode = document.getElementById("modeBtn");
    if (btnMode) btnMode.click();
  }

  if (!container || !loaded) return null;

  return createPortal(
    <SettingsSection
      activeDeadline={activeDeadline}
      canEdit={canEdit}
      isAuthorized={isAuthorized}
      onDeadlineUpdated={handleDeadlineUpdated}
      onLoginClick={handleLoginClick}
    />,
    container,
  );
}

function subscribeToPortalTarget(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function getPortalTarget() {
  return document.getElementById("page-configuracoes");
}

function getServerPortalTarget() {
  return null;
}
