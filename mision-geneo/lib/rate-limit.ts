import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rate limit por clave. Devuelve true si el intento está permitido, false si se
 * excedió (p_max intentos por ventana de windowSeconds). Fail-OPEN: si el
 * limitador falla, NO bloquea (mejor no dejar afuera a usuarios legítimos).
 */
export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window: windowSeconds,
    });
    if (error) return true;
    return data === true;
  } catch {
    return true;
  }
}

/** Primera IP del x-forwarded-for (Vercel lo setea). "unknown" si no hay. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
