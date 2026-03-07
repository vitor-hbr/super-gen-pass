"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.isSecureContext ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Offline support is optional; registration failures should not break the app.
      }
    };

    if (document.readyState === "complete") {
      register().catch(() => undefined);
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => {
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
