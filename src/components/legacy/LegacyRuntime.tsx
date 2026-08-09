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

declare global {
  interface Window {
    XLSX?: typeof import("xlsx");
    loadNextuberXLSX?: () => Promise<typeof import("xlsx")>;
    nextuberProduction?: NextuberProductionBridge;
    nextuberMutations?: NextuberMutationBridge;
    nextuberReads?: NextuberReadBridge;
  }
}

export function LegacyRuntime() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

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

      if (document.querySelector('script[data-nextuber-legacy="true"]')) return;

      const script = document.createElement("script");
      script.src = "/legacy/app.js";
      script.dataset.nextuberLegacy = "true";
      script.async = false;
      script.onerror = () => {
        setError("Nao foi possivel iniciar a plataforma.");
      };
      document.body.appendChild(script);
    }

    startLegacyApplication().catch((reason: unknown) => {
      const message =
        reason instanceof Error ? reason.message : "Falha ao iniciar a plataforma.";
      setError(message);
      console.error("Erro ao iniciar o Nextuber:", reason);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!error) return null;

  return (
    <div className="runtime-error" role="alert">
      <strong>Nextuber indisponivel</strong>
      <span>{error}</span>
    </div>
  );
}
