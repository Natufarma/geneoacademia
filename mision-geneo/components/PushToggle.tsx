"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Check, Loader2 } from "lucide-react";
import { enablePush, pushSupported } from "@/lib/push";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type State = "checking" | "idle" | "loading" | "on" | "denied" | "unsupported";

/**
 * Toggle para activar los recordatorios de racha (Web Push). Si la app no tiene
 * configurada la clave VAPID todavía, el componente NO se renderiza (return
 * null): así no aparece un botón roto hasta que esté el setup.
 */
export default function PushToggle() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    if (!VAPID) return; // sin configurar: no mostramos nada (ver render)
    let cancelled = false;
    // Toda la detección va detrás de un await para no setear estado de forma
    // sincrónica dentro del efecto (usa APIs solo-cliente: Notification, SW).
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!pushSupported()) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setState(sub && Notification.permission === "granted" ? "on" : "idle");
      } catch {
        if (!cancelled) setState("idle");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sin VAPID configurada, la feature no existe todavía para el usuario.
  if (!VAPID || state === "checking") return null;

  const onEnable = async () => {
    setState("loading");
    const res = await enablePush(VAPID);
    if (res.ok) setState("on");
    else if (res.reason === "denied") setState("denied");
    else if (res.reason === "unsupported") setState("unsupported");
    else setState("idle");
  };

  if (state === "on") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-rosa-suave/60 px-4 py-3">
        <BellRing size={20} className="text-geneo shrink-0" />
        <span className="flex-1 text-ink text-sm font-semibold leading-snug">
          Recordatorios de racha activados
        </span>
        <Check size={18} strokeWidth={3} className="text-geneo shrink-0" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-muted text-sm leading-snug">
        Bloqueaste las notificaciones. Para recibir el recordatorio de racha, activalas desde los
        ajustes del navegador para este sitio.
      </p>
    );
  }

  if (state === "unsupported") {
    return (
      <p className="text-muted text-sm leading-snug">
        Tu navegador no soporta notificaciones. En iPhone, primero instalá la app en tu teléfono.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onEnable}
      disabled={state === "loading"}
      className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
    >
      {state === "loading" ? (
        <Loader2 size={17} className="animate-spin" />
      ) : (
        <Bell size={17} />
      )}
      {state === "loading" ? "Activando…" : "Activar recordatorios de racha"}
    </button>
  );
}
