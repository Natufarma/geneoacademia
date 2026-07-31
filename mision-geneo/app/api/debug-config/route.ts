import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

/** TEMPORAL — diagnóstico de config + prueba real de createUser. Borrar luego. */
export const dynamic = "force-dynamic";

function keyInfo(token: string | undefined) {
  if (!token) return { present: false };
  const info: Record<string, unknown> = {
    present: true,
    length: token.length,
    endsWith: token.slice(-6),
    hasWhitespace: /\s/.test(token),
  };
  const parts = token.split(".");
  if (parts.length === 3) {
    try {
      const p = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
      info.role = p.role;
      info.ref = p.ref;
    } catch {
      /* no jwt */
    }
  }
  return info;
}

export async function GET() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const result: Record<string, unknown> = {
    marker: "v4-key-info",
    rawUrl: raw,
    normalizedUrl: raw ? normalizeSupabaseUrl(raw) : null,
    serviceKey: keyInfo(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  try {
    const admin = createAdminClient();
    const email = `debug-${Math.round(Math.random() * 1e9)}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: "DebugTest2026",
      email_confirm: true,
    });
    if (error) result.createUser = { ok: false, status: error.status, message: error.message };
    else {
      result.createUser = { ok: true };
      await admin.auth.admin.deleteUser(data.user.id);
    }
  } catch (e) {
    result.createUser = { ok: false, threw: e instanceof Error ? e.message : String(e) };
  }
  return NextResponse.json(result);
}
