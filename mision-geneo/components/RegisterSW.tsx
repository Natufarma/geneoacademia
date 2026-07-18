"use client";

import { useEffect } from "react";

/**
 * Registra el service worker (public/sw.js) una vez montada la página.
 * Silencioso: si el navegador no lo soporta o falla, la app sigue igual.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker: la app funciona igual, solo no es instalable.
      });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
