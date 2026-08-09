"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { AppointmentItem } from "@/domain/program";
import type { StudentItem } from "@/domain/student-monitoring";
import { AppointmentsSection } from "./AppointmentsSection";

export function AppointmentsIsland() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
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
          setStudents((bData.students as StudentItem[]) || []);
          setCanEdit(bData.role === "tutora" || bData.role === "gestor");
        }

        const appRes = await fetch("/api/appointments", { credentials: "same-origin" });
        if (appRes.ok) {
          const aData = await appRes.json();
          if (!cancelled && aData.appointments) {
            setAppointments(aData.appointments as AppointmentItem[]);
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

  function handleCreated(newApp: AppointmentItem) {
    setAppointments((prev) => [newApp, ...prev]);
  }

  function handleUpdated(updated: AppointmentItem) {
    setAppointments((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  function handleDeleted(id: string) {
    setAppointments((prev) => prev.filter((item) => item.id !== id));
  }

  function handleLoginClick() {
    const btnMode = document.getElementById("modeBtn");
    if (btnMode) btnMode.click();
  }

  if (!container || !loaded) return null;

  return createPortal(
    <AppointmentsSection
      appointments={appointments}
      students={students}
      canEdit={canEdit}
      isAuthorized={isAuthorized}
      onAppointmentCreated={handleCreated}
      onAppointmentUpdated={handleUpdated}
      onAppointmentDeleted={handleDeleted}
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
  return document.getElementById("page-agendamentos");
}

function getServerPortalTarget() {
  return null;
}
