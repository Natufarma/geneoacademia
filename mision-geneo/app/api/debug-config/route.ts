import { NextResponse } from "next/server";

/**
 * TEMPORAL — diagnóstico de configuración. Muestra qué Supabase está usando el
 * deploy (URL + rol/proyecto de cada key, SIN exponer las keys). Borrar cuando
 * se termine de diagnosticar el entorno de staging.
 */
export const dynamic = "force-dynamic";

function inspect(token: string | undefined) {
  if (!token) return { present: false };
  const parts = token.split(".");
  if (parts.length !== 3) return { present: true, jwt: false, endsWith: token.slice(-8) };
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return { present: true, jwt: true, role: payload.role, ref: payload.ref, endsWith: token.slice(-8) };
  } catch {
    return { present: true, jwt: false };
  }
}

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    SUPABASE_SERVICE_ROLE_KEY: inspect(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: inspect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    VENDOR_SIGNUP_CODE_present: Boolean(process.env.VENDOR_SIGNUP_CODE),
  });
}
