"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthed } from "@/lib/admin-auth";

export type VendorActionResult = { ok: true } | { ok: false; error: string };

/**
 * Da de baja (active=false) o reactiva (active=true) a un vendedor. Reversible.
 * Usa el "ban" nativo de Supabase Auth: un vendedor dado de baja no puede
 * iniciar sesión (el login devuelve code "user_banned"). Solo admin.
 */
export async function setVendorActive(vendorId: string, active: boolean): Promise<VendorActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "No autorizado." };
  if (typeof vendorId !== "string" || !vendorId) return { ok: false, error: "Vendedor inválido." };

  const admin = createAdminClient();
  // Verificar que la cuenta sea efectivamente un vendedor (no un empleado/admin).
  const { data: prof } = await admin.from("profiles").select("role").eq("id", vendorId).maybeSingle();
  if (prof?.role !== "vendor") return { ok: false, error: "Esa cuenta no es un vendedor." };

  const { error } = await admin.auth.admin.updateUserById(vendorId, {
    ban_duration: active ? "none" : "876000h",
  });
  if (error) return { ok: false, error: "No pudimos actualizar el vendedor." };

  revalidatePath("/admin/vendedores");
  return { ok: true };
}
