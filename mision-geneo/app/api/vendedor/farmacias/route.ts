import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorUserId, vendorOwnsPharmacy } from "@/lib/vendor-auth";

/**
 * Farmacias del vendedor logueado. GET lista las farmacias vinculadas
 * (vendor_pharmacies); POST crea una farmacia nueva con un código único
 * generado server-side y la vincula al vendedor de la sesión — el body
 * nunca puede elegir a qué vendedor se vincula. PATCH edita los datos y
 * DELETE la elimina (solo si no tiene empleados). Ambas verifican que la
 * farmacia sea del vendedor de la sesión antes de tocar nada.
 */
export const dynamic = "force-dynamic";

type PharmacyFields = { type: "farmacia" | "dietetica"; name: string; city: string; branch: string | null };
type ParseResult = { error: string; fields?: undefined } | { error?: undefined; fields: PharmacyFields };

/** Valida y normaliza los campos de un punto de venta (compartido por POST y PATCH). */
function parsePharmacyFields(body: { type?: unknown; name?: unknown; city?: unknown; branch?: unknown }): ParseResult {
  const type = typeof body?.type === "string" ? body.type.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const branch = typeof body?.branch === "string" && body.branch.trim() ? body.branch.trim() : null;
  if (type !== "farmacia" && type !== "dietetica") return { error: "Elegí el tipo de punto de venta." };
  if (!name) return { error: "El nombre es obligatorio." };
  if (!city) return { error: "La ciudad es obligatoria." };
  return { fields: { type, name, city, branch } };
}

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
  const parsed = parsePharmacyFields(body ?? {});
  if (!parsed.fields) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { type, name, city, branch } = parsed.fields;

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

/** Edita los datos de una farmacia del vendedor (nombre, ciudad, sucursal, tipo). */
export async function PATCH(request: Request) {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { pharmacyId?: unknown; type?: unknown; name?: unknown; city?: unknown; branch?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const pharmacyId = typeof body?.pharmacyId === "string" ? body.pharmacyId : "";
  if (!pharmacyId) return NextResponse.json({ error: "pharmacyId inválido" }, { status: 400 });

  // Autorizar ANTES de validar el body: la propiedad del recurso se verifica
  // primero, así los mensajes de validación no sondean el sistema.
  if (!(await vendorOwnsPharmacy(vendorId, pharmacyId))) {
    return NextResponse.json({ error: "Ese punto de venta no es tuyo." }, { status: 403 });
  }

  const parsed = parsePharmacyFields(body ?? {});
  if (!parsed.fields) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("pharmacies").update(parsed.fields).eq("id", pharmacyId);
  if (error) return NextResponse.json({ error: "No pudimos guardar los cambios." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Elimina una farmacia del vendedor. Bloquea el borrado si ya tiene empleados registrados. */
export async function DELETE(request: Request) {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { pharmacyId?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const pharmacyId = typeof body?.pharmacyId === "string" ? body.pharmacyId : "";
  if (!pharmacyId) return NextResponse.json({ error: "pharmacyId inválido" }, { status: 400 });

  if (!(await vendorOwnsPharmacy(vendorId, pharmacyId))) {
    return NextResponse.json({ error: "Ese punto de venta no es tuyo." }, { status: 403 });
  }

  const admin = createAdminClient();

  // Protección: no se puede borrar una farmacia que ya tiene empleados jugando.
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("pharmacy_id", pharmacyId);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "No podés borrar esta farmacia: ya tiene empleados registrados." },
      { status: 409 },
    );
  }

  // Sin empleados → desvincular y eliminar la farmacia por completo.
  await admin.from("vendor_pharmacies").delete().eq("pharmacy_id", pharmacyId).eq("vendor_id", vendorId);
  const { error } = await admin.from("pharmacies").delete().eq("id", pharmacyId);
  if (error) return NextResponse.json({ error: "No pudimos eliminar el punto de venta." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
