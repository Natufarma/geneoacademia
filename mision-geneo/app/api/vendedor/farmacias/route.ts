import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorUserId } from "@/lib/vendor-auth";

/**
 * Farmacias del vendedor logueado. GET lista las farmacias vinculadas
 * (vendor_pharmacies); POST crea una farmacia nueva con un código único
 * generado server-side y la vincula al vendedor de la sesión — el body
 * nunca puede elegir a qué vendedor se vincula.
 */
export const dynamic = "force-dynamic";

/** Código de farmacia legible y aleatorio (sin caracteres ambiguos). */
function genPharmacyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "VE" + s;
}

export async function GET() {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: links } = await admin
    .from("vendor_pharmacies")
    .select("pharmacy_id")
    .eq("vendor_id", vendorId);
  const ids = (links ?? []).map((l) => l.pharmacy_id);
  if (!ids.length) return NextResponse.json({ pharmacies: [] });

  const { data: pharmacies } = await admin
    .from("pharmacies")
    .select("id, name, type, city, branch, created_at")
    .in("id", ids)
    .order("name");
  return NextResponse.json({ pharmacies: pharmacies ?? [] });
}

export async function POST(request: Request) {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { type?: unknown; name?: unknown; city?: unknown; branch?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const type = typeof body?.type === "string" ? body.type.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const branch = typeof body?.branch === "string" && body.branch.trim() ? body.branch.trim() : null;

  if (type !== "farmacia" && type !== "dietetica") {
    return NextResponse.json({ error: "Elegí el tipo de punto de venta." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ error: "La ciudad es obligatoria." }, { status: 400 });
  }

  const admin = createAdminClient();
  let pharmacyId: string | null = null;
  for (let attempt = 0; attempt < 5 && !pharmacyId; attempt++) {
    const code = genPharmacyCode();
    const { data, error } = await admin
      .from("pharmacies")
      .insert({ code, name, city, branch, type })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      pharmacyId = data.id;
      break;
    }
    const dup =
      String(error?.code ?? "").includes("23505") ||
      String(error?.message ?? "").toLowerCase().includes("duplicate");
    if (error && !dup) {
      return NextResponse.json({ error: "No pudimos crear el punto de venta." }, { status: 500 });
    }
  }
  if (!pharmacyId) {
    return NextResponse.json({ error: "No pudimos generar un código único. Probá de nuevo." }, { status: 500 });
  }

  const { error: linkErr } = await admin
    .from("vendor_pharmacies")
    .insert({ vendor_id: vendorId, pharmacy_id: pharmacyId });
  if (linkErr) {
    return NextResponse.json({ error: "Creamos el punto de venta pero no pudimos vincularlo. Avisá a soporte." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, pharmacyId });
}
