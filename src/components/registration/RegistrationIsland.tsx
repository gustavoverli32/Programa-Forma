"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { StudentItem } from "@/domain/student-monitoring";
import { RegistrationSection } from "./RegistrationSection";

type ManagerItem = {
  id: string;
  nome: string;
  funcional: string;
  tipo_gestor: "ga" | "gga" | "tutor";
  permissoes?: Record<string, boolean>;
};

export function RegistrationIsland() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [isTutorOrGga, setIsTutorOrGga] = useState<boolean>(false);
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
        const res = await fetch("/api/data/bootstrap", { credentials: "same-origin" });
        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          setIsAuthorized(false);
          setLoaded(true);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;

          setIsAuthorized(true);
          setStudents((data.students as StudentItem[]) || []);
          setCanEdit(data.role === "tutora" || data.role === "gestor");
          setIsTutorOrGga(data.role === "tutora" || (data.manager && data.manager.tipo_gestor === "gga"));
        }

        // Carregar gestores cadastrados
        const managersRes = await fetch("/api/managers", { credentials: "same-origin" });
        if (managersRes.ok) {
          const mData = await managersRes.json();
          if (!cancelled && mData.managers) {
            setManagers(mData.managers as ManagerItem[]);
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

  function handleLoginClick() {
    const btnMode = document.getElementById("modeBtn");
    if (btnMode) btnMode.click();
  }

  if (!container || !loaded) return null;

  return createPortal(
    <RegistrationSection
      initialStudents={students}
      initialManagers={managers}
      canEdit={canEdit}
      isTutorOrGga={isTutorOrGga}
      isAuthorized={isAuthorized}
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
  return document.getElementById("page-cadastro");
}

function getServerPortalTarget() {
  return null;
}
