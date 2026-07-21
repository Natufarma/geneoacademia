import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { getPharmacy } from "@/lib/admin-data";
import { getPeriodBounds } from "@/lib/ranking";
import { Reveal } from "../../../_components/Reveal";
import { CertifiedBadge, EmptyState, StatCard } from "../../../_components/ui";

export const dynamic = "force-dynamic";

export default async function FarmaciaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPharmacy(id);
  if (!data) notFound();
  const { pharmacy, employees } = data;
  const { key: period } = getPeriodBounds();
  // Los 3 empleados que hoy definen el score (top activos del período).
  const topIds = new Set(
    [...employees]
      .filter((e) => e.periodPoints > 0)
      .sort((a, b) => b.periodPoints - a.periodPoints)
      .slice(0, 3)
      .map((e) => e.id),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/farmacias"
          className="inline-flex items-center gap-1.5 py-3 text-muted hover:text-geneo active:text-geneo text-sm font-semibold transition-colors self-start"
        >
          <ArrowLeft size={16} />
          Farmacias
        </Link>

        <header className="flex items-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-rosa-suave text-geneo shrink-0">
            <Store size={26} />
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-ink font-extrabold text-2xl tracking-tight truncate">
              {pharmacy.name}
            </h1>
            <p className="text-muted text-sm">
              Código: {pharmacy.code} · {pharmacy.position}º puesto · Período {period}
            </p>
          </div>
        </header>
      </div>

      <Reveal className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Empleados" value={pharmacy.employees} />
        <StatCard label="Activos" value={pharmacy.activeCount} hint="Con puntos este mes" />
        <StatCard label="Certificados" value={pharmacy.certified} />
        <StatCard label="Score" value={pharmacy.score} hint="Promedio top-3 del período" />
        <StatCard
          label="Puntos brutos"
          value={pharmacy.totalPoints}
          hint="Suma del período, sin filtrar"
          className="sm:col-span-2 md:col-span-1"
        />
      </Reveal>

      <Reveal className="flex flex-col gap-3" delay={0.08}>
        <div className="flex flex-col gap-1">
          <h2 className="text-ink font-bold text-lg tracking-tight">Equipo</h2>
          <p className="text-muted text-xs">
            Puntos del período (mes en curso) por empleado. Los 3 marcados definen el score de la
            farmacia.
          </p>
        </div>
        {employees.length === 0 ? (
          <EmptyState title="Esta farmacia todavía no tiene empleados registrados" />
        ) : (
          <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line overflow-hidden">
            {employees.map((e) => (
              <Link
                key={e.id}
                href={`/admin/empleados/${e.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-rosa-suave/30 active:bg-rosa-suave/30 transition-colors"
              >
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-ink font-semibold text-sm leading-tight truncate">
                      {e.name}
                    </span>
                    {topIds.has(e.id) && (
                      <span className="text-xs font-bold uppercase tracking-wide bg-rosa-suave text-geneo rounded-full px-2 py-0.5 shrink-0">
                        Top 3
                      </span>
                    )}
                  </span>
                  <span className="text-muted text-xs">
                    {e.levelName} · {e.coreDone}/{e.coreTotal} misiones
                  </span>
                </span>
                <span className="flex flex-col items-end shrink-0 w-20">
                  <span className="text-geneo font-extrabold text-sm">{e.periodPoints} pts</span>
                  <span className="text-soft text-xs">{e.points} histórico</span>
                </span>
                <CertifiedBadge certified={e.certified} />
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
