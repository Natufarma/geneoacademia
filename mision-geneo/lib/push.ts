/**
 * Helpers de Web Push del lado del navegador: suscribir el dispositivo y
 * mandar la suscripción al servidor (/api/push/subscribe). El envío de los
 * recordatorios lo hace el cron server-side.
 */

/** La clave pública VAPID viene en base64url; PushManager la quiere como bytes. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export type EnableResult = { ok: true } | { ok: false; reason: "unsupported" | "denied" | "server" };

/**
 * Pide permiso, suscribe el dispositivo con la clave VAPID y guarda la
 * suscripción en el servidor. Idempotente: si ya hay suscripción, la reusa.
 */
export async function enablePush(vapidPublicKey: string): Promise<EnableResult> {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  if (!res.ok) return { ok: false, reason: "server" };
  return { ok: true };
}
