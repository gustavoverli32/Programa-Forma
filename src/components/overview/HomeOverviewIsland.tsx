"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ProductionRow } from "@/domain/production";
import type { StudentItem } from "@/domain/student-monitoring";
import { HomeOverviewSection } from "./HomeOverviewSection";

type MeetingItem = {
  id: string;
  titulo: string;
  data: string;
  descricao?: string | null;
};

export function HomeOverviewIsland() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [productionRows, setProductionRows] = useState<ProductionRow[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
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
          setProductionRows((data.production as ProductionRow[]) || []);
          setCanEdit(data.role === "tutora" || data.role === "gestor");
        }

        // Carregar reuniões/encontros
        const meetingsRes = await fetch("/api/meetings", { credentials: "same-origin" });
        if (meetingsRes.ok) {
          const mData = await meetingsRes.json();
          if (!cancelled && mData.meetings) {
            setMeetings(mData.meetings as MeetingItem[]);
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

  function handleMeetingAdded(newMeeting: MeetingItem) {
    setMeetings((prev) => [newMeeting, ...prev]);
  }

  useEffect(() => {
    const el = document.getElementById("page-overview");
    if (el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
  }, []);

  if (!container || !loaded) return null;

  return createPortal(
    <HomeOverviewSection
      students={students}
      productionRows={productionRows}
      meetings={meetings}
      canEdit={canEdit}
      isAuthorized={isAuthorized}
      onMeetingAdded={handleMeetingAdded}
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
  return document.getElementById("page-overview");
}

function getServerPortalTarget() {
  return null;
}
