import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorUserId, vendorOwnsPharmacy } from "@/lib/vendor-auth";
import { claimLabel } from "@/lib/prizes";

/**
 * Premios reclamados por empleados de las farmacias del vendedor logueado.
 * GET lista y agrega los datos (empleado, farmacia, premio, estado). PATCH
 * marca un premio como entregado, verificando que sea de una farmacia del
 * vendedor de la sesión — el body nunca puede elegir a qué vendedor se valida.
 */
export const dynamic = "force-dynamic";

/** Premios reclamados por los empleados de las farmacias del vendedor. */
export async function GET() {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: links } = await admin
    .from("vendor_pharmacies")
    .select("pharmacy_id")
    .eq("vendor_id", vendorId);
  const pharmacyIds = (links ?? []).map((l) => l.pharmacy_id);
  if (!pharmacyIds.length) return NextResponse.json({ prizes: [] });

  const [{ data: employees }, { data: pharmacies }] = await Promise.all([
    admin.from("profiles").select("id, name, pharmacy_id").in("pharmacy_id", pharmacyIds),
    admin.from("pharmacies").select("id, name").in("id", pharmacyIds),
  ]);
  const empMap = new Map((employees ?? []).map((e) => [e.id, e]));
  const pharmMap = new Map((pharmacies ?? []).map((p) => [p.id, p.name]));
  const empIds = (employees ?? []).map((e) => e.id);
  if (!empIds.length) return NextResponse.json({ prizes: [] });

  const { data: reds } = await admin
    .from("redemptions")
    .select("id, user_id, reward_id, status, created_at")
    .in("user_id", empIds)
    .order("created_at", { ascending: false });

  const prizes = (reds ?? []).map((r) => {
    const emp = empMap.get(r.user_id);
    return {
      id: r.id,
      employeeName: emp?.name ?? "—",
      pharmacyName: emp ? pharmMap.get(emp.pharmacy_id ?? "") ?? "—" : "—",
      prize: claimLabel(r.reward_id),
      status: r.status,
      createdAt: r.created_at,
    };
  });
  return NextResponse.json({ prizes });
}

/** Marca un premio como entregado, validando que sea de una farmacia del vendedor. */
export async function PATCH(request: Request) {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { redemptionId?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const redemptionId = typeof body?.redemptionId === "string" ? body.redemptionId : "";
  if (!redemptionId) return NextResponse.json({ error: "redemptionId inválido" }, { status: 400 });

  const admin = createAdminClient();
  const { data: red } = await admin
    .from("redemptions")
    .select("id, user_id")
    .eq("id", redemptionId)
    .maybeSingle();
  if (!red) return NextResponse.json({ error: "Premio no encontrado" }, { status: 404 });

  const { data: emp } = await admin
    .from("profiles")
    .select("pharmacy_id")
    .eq("id", red.user_id)
    .maybeSingle();
  if (!emp?.pharmacy_id || !(await vendorOwnsPharmacy(vendorId, emp.pharmacy_id))) {
    return NextResponse.json({ error: "Ese premio no es de una de tus farmacias." }, { status: 403 });
  }

  const { error } = await admin
    .from("redemptions")
    .update({ status: "delivered" })
    .eq("id", redemptionId);
  if (error) return NextResponse.json({ error: "No pudimos actualizar el premio." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
