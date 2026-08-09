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

      await loadScript("/legacy/security.js", "security");
      if (cancelled) return;
      await loadScript("/legacy/app.js", "legacy");
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
