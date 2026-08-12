"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { LoginModal } from "./LoginModal";
import { nextuberReadBridge, type BootstrapPayload } from "@/services/read-client";

// Secoes
import { HomeOverviewSection } from "@/components/overview/HomeOverviewSection";
import { StudentMonitoringSection } from "@/components/tracking/StudentMonitoringSection";
import { RegistrationSection } from "@/components/registration/RegistrationSection";
import { TrilhasSection } from "@/components/program/TrilhasSection";
import { AppointmentsSection } from "@/components/program/AppointmentsSection";
import { SettingsSection } from "@/components/program/SettingsSection";
import { AiAssistantModal } from "@/components/assistant/AiAssistantModal";
import { ProductionTrackingModal } from "@/components/tracking/ProductionTrackingModal";
import type { StudentItem } from "@/domain/student-monitoring";
import type { ProductionRow } from "@/domain/production";

export function AppLayout() {
  const [activePage, setActivePage] = useState("overview");
  const [payload, setPayload] = useState<BootstrapPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await nextuberReadBridge.bootstrap();
      setPayload(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao carregar os dados.");
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  if (error) {
    return (
      <div className="runtime-error" role="alert" style={{ padding: 20, color: "red" }}>
        <strong>Nextuber indisponível</strong>
        <div>{error}</div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        Carregando...
      </div>
    );
  }

  const isTutora = payload.session?.role === "tutora";

  return (
    <div className="layout" style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        session={payload.session}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      <main className="main" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        <div className="mob-topbar" id="mobTopbar">
          <div className="mob-hamburger" id="hamburger">
            <span></span><span></span><span></span>
          </div>
          <span className="mob-topbar-title">Nextuber</span>
          <button className="mob-mode-btn" onClick={() => setIsLoginModalOpen(true)}>Login</button>
        </div>

        {/* Renderiza a view baseada na aba ativa */}
        <div style={{ padding: "20px" }}>
          {activePage === "overview" && (
            <HomeOverviewSection
              students={payload.students as any}
              productionRows={payload.production as any}
              meetings={payload.meetings as any}
              canEdit={isTutora}
              isAuthorized={!!payload.session}
              onMeetingAdded={loadData}
            />
          )}

          {activePage === "estagiarios" && (
            <StudentMonitoringSection
              students={payload.students as any}
              canEdit={isTutora}
              isAuthorized={!!payload.session}
              onLoginClick={() => setIsLoginModalOpen(true)}
              onStudentUpdated={loadData}
            />
          )}

          {activePage === "cadastro" && (
            <RegistrationSection
              initialStudents={payload.students as any}
              initialManagers={payload.managers as any}
              canEdit={isTutora}
              isTutorOrGga={isTutora} // Simplificação, GA/GGA tbm deveria
              isAuthorized={!!payload.session}
              onLoginClick={() => setIsLoginModalOpen(true)}
            />
          )}

          {activePage === "trilhas" && (
            <TrilhasSection />
          )}

          {activePage === "agendamentos" && (
            <AppointmentsSection
              canEdit={isTutora}
              isAuthorized={!!payload.session}
              onLoginClick={() => setIsLoginModalOpen(true)}
            />
          )}

          {activePage === "configuracoes" && (
            <SettingsSection
              canEdit={isTutora}
              isAuthorized={!!payload.session}
              onLoginClick={() => setIsLoginModalOpen(true)}
            />
          )}
        </div>
      </main>

      <AiAssistantModal />
      <ProductionTrackingModal />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={loadData}
      />
    </div>
  );
}
