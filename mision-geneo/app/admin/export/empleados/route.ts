import { NextResponse } from "next/server";
import { getEmployees } from "@/lib/admin-data";
import { isAuthed } from "@/lib/admin-auth";

function cell(value: string | number): string {
  let s = String(value);
  // Anti inyección de fórmulas: si la celda arranca con = + - @ (o tab/CR),
  // Excel/Sheets la ejecutaría como fórmula. El empleado controla nombre,
  // email y celular, así que se antepone un apóstrofo para forzar texto.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAuthed())) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const employees = await getEmployees();
  const header = [
    "Nombre",
    "Email",
    "Celular",
    "Farmacia",
    "Nivel",
    "Puntos",
    "Misiones",
    "Certificado",
    "Fecha certificado",
    "Campañas",
    "Días pregunta del día",
  ];
  const rows = employees.map((e) => [
    e.name,
    e.email ?? "",
    e.phone ?? "",
    e.pharmacyName,
    e.levelName,
    e.points,
    `${e.coreDone}/${e.coreTotal}`,
    e.certified ? "Sí" : "No",
    e.certifiedAt ? new Date(e.certifiedAt).toLocaleDateString("es-AR") : "",
    e.campaignsDone,
    e.dailyDays,
  ]);

  // BOM (﻿) para que Excel abra bien los acentos.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="empleados-geneo.csv"',
    },
  });
}
