"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { EmployeeSummary } from "@/lib/admin-data";
import { CertifiedBadge } from "./ui";

export default function EmployeesTable({ employees }: { employees: EmployeeSummary[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter(
      (e) => e.name.toLowerCase().includes(term) || e.pharmacyName.toLowerCase().includes(term),
    );
  }, [q, employees]);

  return (
    <div className="flex flex-col gap-4">
      <label className="relative flex items-center">
        <Search size={16} className="absolute left-4 text-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o farmacia…"
          className="w-full min-h-11 rounded-full border-2 border-line bg-paper pl-10 pr-5 text-ink text-sm outline-none focus:border-geneo transition-colors"
        />
      </label>

      <div className="overflow-x-auto bg-paper rounded-3xl shadow-soft">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.5fr_1.2fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-line text-soft text-[11px] font-bold uppercase tracking-widest">
            <span>Empleado</span>
            <span>Farmacia</span>
            <span>Nivel</span>
            <span className="text-right">Puntos</span>
            <span className="text-center">Misiones</span>
            <span className="text-center">Estado</span>
          </div>

          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-muted text-sm text-center">Sin resultados para “{q}”.</p>
          ) : (
            <div className="divide-y divide-line">
              {filtered.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/empleados/${e.id}`}
                  className="grid grid-cols-[1.5fr_1.2fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-rosa-suave/30 active:bg-rosa-suave/30 transition-colors"
                >
                  <span className="text-ink font-semibold text-sm truncate">{e.name}</span>
                  <span className="text-muted text-sm truncate">{e.pharmacyName}</span>
                  <span className="text-muted text-sm truncate">{e.levelName}</span>
                  <span className="text-geneo font-extrabold text-sm text-right">{e.points}</span>
                  <span className="text-ink text-sm font-semibold text-center">
                    {e.coreDone}/{e.coreTotal}
                  </span>
                  <span className="flex justify-center">
                    <CertifiedBadge certified={e.certified} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-soft text-xs">
        {filtered.length} de {employees.length} empleados.
      </p>
    </div>
  );
}
