import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

/**
 * TEMPORAL — diagnóstico. Muestra la config y, sobre todo, INTENTA un createUser
 * real (mismo cliente que el registro) y devuelve el error exacto de Supabase.
 * Borrar cuando termine el diagnóstico de staging.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const result: Record<string, unknown> = {
    marker: "v3-test-createuser",
    rawUrl: raw,
    normalizedUrl: raw ? normalizeSupabaseUrl(raw) : null,
  };

  try {
    const admin = createAdminClient();
    const email = `debug-${Math.round(Math.random() * 1e9)}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: "DebugTest2026",
      email_confirm: true,
    });
    if (error) {
      result.createUser = { ok: false, status: error.status, message: error.message };
    } else {
      result.createUser = { ok: true, id: data.user.id };
      await admin.auth.admin.deleteUser(data.user.id); // limpieza
    }
  } catch (e) {
    result.createUser = { ok: false, threw: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(result);
}
