"use client";

import { useEffect, useState } from "react";
import {
  nextuberProductionBridge,
  type NextuberProductionBridge,
} from "@/services/production-client";
import {
  nextuberMutationBridge,
  type NextuberMutationBridge,
} from "@/services/admin-mutations-client";
import {
  nextuberReadBridge,
  type NextuberReadBridge,
} from "@/services/read-client";
import {
  nextuberAuthBridge,
  type NextuberAuthBridge,
} from "@/services/auth-client";
import {
  nextuberTrackingBridge,
  type NextuberTrackingBridge,
} from "@/services/tracking-bridge";
import { ProductionTrackingIsland } from "@/components/tracking/ProductionTrackingIsland";
import { StudentMonitoringIsland } from "@/components/tracking/StudentMonitoringIsland";
import { HomeOverviewIsland } from "@/components/overview/HomeOverviewIsland";
import { RegistrationIsland } from "@/components/registration/RegistrationIsland";
import { TrilhasIsland } from "@/components/program/TrilhasIsland";
import { AppointmentsIsland } from "@/components/program/AppointmentsIsland";
import { SettingsIsland } from "@/components/program/SettingsIsland";
import { AiAssistantIsland } from "@/components/assistant/AiAssistantIsland";

declare global {
  interface Window {
    XLSX?: typeof import("xlsx");
    loadNextuberXLSX?: () => Promise<typeof import("xlsx")>;
    nextuberProduction?: NextuberProductionBridge;
    nextuberMutations?: NextuberMutationBridge;
    nextuberReads?: NextuberReadBridge;
    nextuberAuth?: NextuberAuthBridge;
    nextuberTracking?: NextuberTrackingBridge;
  }
}

export function LegacyRuntime() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function loadScript(src: string, marker: string) {
      return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          `script[data-nextuber-runtime="${marker}"]`,
        );
        if (existing?.dataset.loaded === "true") {
          resolve();
          return;
        }
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}.`)), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.dataset.nextuberRuntime = marker;
        script.async = false;
        script.addEventListener(
          "load",
          () => {
            script.dataset.loaded = "true";
            resolve();
          },
          { once: true },
        );
        script.addEventListener("error", () => reject(new Error(`Falha ao carregar ${src}.`)), {
          once: true,
        });
        document.body.appendChild(script);
      });
    }

    async function startLegacyApplication() {
      if (cancelled) return;

      window.loadNextuberXLSX = async () => {
        if (window.XLSX) return window.XLSX;
        const xlsxModule = await import("xlsx");
        window.XLSX = xlsxModule;
        return xlsxModule;
      };
      window.nextuberProduction = nextuberProductionBridge;
      window.nextuberMutations = nextuberMutationBridge;
      window.nextuberReads = nextuberReadBridge;
      window.nextuberAuth = nextuberAuthBridge;
      window.nextuberTracking = nextuberTrackingBridge;

      await loadScript("/legacy/security.js", "security");
      if (cancelled) return;
      try {
        await loadScript("/legacy/app.js", "legacy");
      } catch (legacyErr) {
        console.warn("Script legado app.js omitido ou inativo. Executando em modo 100% React nativo:", legacyErr);
      }
    }

    startLegacyApplication().catch((reason: unknown) => {
      const msg = reason instanceof Error ? reason.message : "Falha ao inicializar runtime.";
      setError(msg);
      console.warn("Aviso ao inicializar runtime:", reason);
    });

    // Roteamento e navegacao nativos em React (desacoplados do app.js)
    function handleNativeNavigation(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-page]");
      if (!target) return;
      const pageId = target.dataset.page;
      if (!pageId) return;

      document.querySelectorAll(".page.active, .nav-item.active, .drawer-item.active").forEach((el) => {
        el.classList.remove("active");
      });

      const targetPage = document.getElementById(`page-${pageId}`);
      if (targetPage) targetPage.classList.add("active");

      document.querySelectorAll(`[data-page="${pageId}"]`).forEach((el) => {
        el.classList.add("active");
      });
    }

    document.addEventListener("click", handleNativeNavigation);

    return () => {
      cancelled = true;
      document.removeEventListener("click", handleNativeNavigation);
      nextuberTrackingBridge.close();
    };
  }, []);

  return (
    <>
      <HomeOverviewIsland />
      <ProductionTrackingIsland />
      <StudentMonitoringIsland />
      <RegistrationIsland />
      <TrilhasIsland />
      <AppointmentsIsland />
      <SettingsIsland />
      <AiAssistantIsland />
      {error ? (
        <div className="runtime-error" role="alert">
          <strong>Nextuber indisponivel</strong>
          <span>{error}</span>
        </div>
      ) : null}
    </>
  );
}
