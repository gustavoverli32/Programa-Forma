"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { StudentItem } from "@/domain/student-monitoring";
import { StudentMonitoringSection } from "./StudentMonitoringSection";

export function StudentMonitoringIsland() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [scores, setScores] = useState<Record<string, number>>({});
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
        const res = await fetch("/api/data/bootstrap", {
          credentials: "same-origin",
        });
        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          setIsAuthorized(false);
          setLoaded(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Falha ao carregar dados de acompanhamento.");
        }

        const data = await res.json();
        if (cancelled) return;

        setIsAuthorized(true);
        setStudents((data.students as StudentItem[]) || []);
        setCanEdit(data.role === "tutora" || data.role === "gestor");
        
        // Mapear scores se houver nos dados
        if (data.scores && typeof data.scores === "object") {
          setScores(data.scores as Record<string, number>);
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

  function handleStudentUpdated(updated: StudentItem) {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
    );
  }

  function handleLoginClick() {
    const btnMode = document.getElementById("modeBtn");
    if (btnMode) btnMode.click();
  }

  if (!container || !loaded) return null;

  return createPortal(
    <StudentMonitoringSection
      students={students}
      scores={scores}
      onStudentUpdated={handleStudentUpdated}
      canEdit={canEdit}
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
  return document.getElementById("page-estagiarios");
}

function getServerPortalTarget() {
  return null;
}
