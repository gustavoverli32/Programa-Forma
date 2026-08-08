"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    XLSX?: typeof import("xlsx");
    supabase?: typeof import("@supabase/supabase-js");
    __NEXTUBER_CONFIG__?: {
      supabaseUrl: string;
      supabasePublishableKey: string;
    };
    loadNextuberXLSX?: () => Promise<typeof import("xlsx")>;
  }
}

export function LegacyRuntime() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startLegacyApplication() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const supabasePublishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

      if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error(
          "Configuracao do Supabase ausente. Consulte o arquivo .env.example.",
        );
      }

      const supabaseModule = await import("@supabase/supabase-js");

      if (cancelled) return;

      window.supabase = supabaseModule;
      window.loadNextuberXLSX = async () => {
        if (window.XLSX) return window.XLSX;
        const xlsxModule = await import("xlsx");
        window.XLSX = xlsxModule;
        return xlsxModule;
      };
      window.__NEXTUBER_CONFIG__ = {
        supabaseUrl,
        supabasePublishableKey,
      };

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
