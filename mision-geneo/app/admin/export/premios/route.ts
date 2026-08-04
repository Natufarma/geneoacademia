import { NextResponse } from "next/server";
import { getAllRedemptions } from "@/lib/admin-data";
import { isAuthed } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function cell(value: string | number): string {
  let s = String(value);
  // Anti inyección de fórmulas (=, +, -, @): se antepone un apóstrofo para
  // forzar texto en Excel/Sheets. Luego el escapeo estándar de CSV.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-AR") : "");
const isPending = (status: string) => status !== "delivered";

/** Descarga CSV del historial de premios, respetando los filtros (estado/vendedor/farmacia). */
export async function GET(request: Request) {
  if (!(await isAuthed())) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const url = new URL(request.url);
  const estado = url.searchParams.get("estado");
  const vendedor = url.searchParams.get("vendedor");
  const farmacia = url.searchParams.get("farmacia");

  const all = await getAllRedemptions();
  const rows = all.filter((r) => {
    if (estado === "pendientes" && !isPending(r.status)) return false;
    if (estado === "entregados" && isPending(r.status)) return false;
    if (vendedor && r.vendorId !== vendedor) return false;
    if (farmacia && r.pharmacyId !== farmacia) return false;
    return true;
  });

  const header = [
    "Empleado",
    "Farmacia",
    "Vendedor",
    "Premio",
    "Puntos",
    "Estado",
    "Fecha de reclamo",
    "Fecha de entrega",
  ];
  const data = rows.map((r) => [
    r.employeeName,
    r.pharmacyName,
    r.vendorName ?? "",
    r.prize,
    r.points,
    isPending(r.status) ? "Pendiente" : "Entregado",
    fmt(r.createdAt),
    fmt(r.deliveredAt),
  ]);

  // BOM para que Excel abra bien los acentos.
  const csv = "﻿" + [header, ...data].map((r) => r.map(cell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="premios-geneo.csv"',
    },
  });
}
