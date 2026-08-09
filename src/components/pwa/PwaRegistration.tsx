"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let reloading = false;
    let lastUpdateCheck = 0;
    const alreadyControlled = Boolean(navigator.serviceWorker.controller);

    const reportFailure = (error: unknown) => {
      console.error("Falha ao atualizar o aplicativo instalavel:", error);
    };

    const checkForUpdate = (force = false) => {
      if (!registration || disposed) return;
      const now = Date.now();
      if (!force && now - lastUpdateCheck < 60 * 60 * 1000) return;
      lastUpdateCheck = now;
      registration.update().catch(reportFailure);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };

    const handleFocus = () => checkForUpdate();

    const handleControllerChange = () => {
      if (!alreadyControlled || reloading || disposed) return;
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registered) => {
        registration = registered;
        checkForUpdate(true);
      })
      .catch(reportFailure);

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}
