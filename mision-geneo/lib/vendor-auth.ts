import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Autorización del rol vendedor. Todo server-only: el código de alta vive en
 * el env (VENDOR_SIGNUP_CODE) y el rol se resuelve desde la base con la
 * service role key — nunca se confía en el cliente.
 */

/** Compara el código ingresado contra VENDOR_SIGNUP_CODE (tiempo constante). */
export function verifyVendorCode(input: string): boolean {
  if (typeof input !== "string") return false;
  const code = process.env.VENDOR_SIGNUP_CODE;
  if (!code) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(code);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** user_id del usuario logueado SI su perfil tiene role='vendor'; si no, null. */
export async function getVendorUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "vendor" ? user.id : null;
}

/** ¿La farmacia pertenece al vendedor (existe el vínculo en vendor_pharmacies)? */
export async function vendorOwnsPharmacy(vendorId: string, pharmacyId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_pharmacies")
    .select("pharmacy_id")
    .eq("vendor_id", vendorId)
    .eq("pharmacy_id", pharmacyId)
    .maybeSingle();
  return Boolean(data);
}
