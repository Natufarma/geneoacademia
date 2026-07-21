import Link from "next/link";
import { Store } from "lucide-react";
import { getPharmacies } from "@/lib/admin-data";
import { getPeriodBounds } from "@/lib/ranking";
import { Reveal } from "../../_components/Reveal";
import { EmptyState } from "../../_components/ui";

export const dynamic = "force-dynamic";

/** Delay escalonado por fila, capado para que listas largas no se sientan lentas. */
function rowDelay(i: number): number {
  return Math.min(i, 8) * 0.05;
}

export default async function FarmaciasPage() {
  const pharmacies = await getPharmacies();
  const { key: period } = getPeriodBounds();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Farmacias</h1>
        <p className="text-muted text-sm">
          Ranking del período {period} · promedio de los 3 empleados activos con más puntos.
        </p>
      </header>

      {pharmacies.length === 0 ? (
        <EmptyState title="No hay farmacias cargadas" />
      ) : (
        <div className="bg-paper rounded-3xl shadow-soft overflow-hidden">
          {/* Mobile y tablet (hasta lg, incluye iPad vertical de 768px): cards apiladas
              sin scroll horizontal táctil, reveladas en cascada. */}
          <div className="lg:hidden divide-y divide-line">
            {pharmacies.map((p, i) => (
              <Reveal key={p.id} delay={rowDelay(i)}>
                <Link
                  href={`/admin/farmacias/${p.id}`}
                  className="flex flex-col gap-3 px-5 py-4 hover:bg-rosa-suave/30 active:bg-rosa-suave/30 transition-colors"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-soft text-sm font-bold shrink-0">{p.position}º</span>
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                      <Store size={16} />
                    </span>
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-ink font-semibold text-sm truncate">{p.name}</span>
                      {!p.active && (
                        <span className="text-xs font-bold uppercase tracking-wide text-soft shrink-0">
                          Inactiva
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="grid grid-cols-2 gap-x-4 gap-y-2 pl-12">
                    <PharmacyMetric label="Empleados" value={p.employees} />
                    <PharmacyMetric label="Activos" value={p.activeCount} />
                    <PharmacyMetric label="Certificados" value={p.certified} />
                    <PharmacyMetric label="Score" value={p.score} accent />
                    <PharmacyMetric
                      label="Puntos brutos"
                      value={p.totalPoints}
                      className="col-span-2"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Desktop (lg+, 1024px en adelante): tabla completa. A partir de este
              breakpoint el input es mouse/trackpad, así que el eventual scroll
              horizontal hasta los 860px no necesita affordance táctil. */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[40px_1.6fr_96px_80px_112px_80px_128px] gap-4 px-5 py-3 border-b border-line text-soft text-xs font-bold uppercase tracking-widest">
                <span>#</span>
                <span>Farmacia</span>
                <span className="text-center">Empleados</span>
                <span className="text-center">Activos</span>
                <span className="text-center">Certificados</span>
                <span className="text-right">Score</span>
                <span className="text-right">Puntos brutos</span>
              </div>
              <div className="divide-y divide-line">
                {pharmacies.map((p, i) => (
                  <Reveal key={p.id} delay={rowDelay(i)}>
                    <Link
                      href={`/admin/farmacias/${p.id}`}
                      className="grid grid-cols-[40px_1.6fr_96px_80px_112px_80px_128px] gap-4 items-center px-5 py-3.5 hover:bg-rosa-suave/30 active:bg-rosa-suave/30 transition-colors"
                    >
                      <span className="text-soft text-sm font-bold">{p.position}º</span>
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                          <Store size={16} />
                        </span>
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="text-ink font-semibold text-sm truncate">{p.name}</span>
                          {!p.active && (
                            <span className="text-xs font-bold uppercase tracking-wide text-soft shrink-0">
                              Inactiva
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="text-ink text-sm font-semibold text-center">{p.employees}</span>
                      <span className="text-ink text-sm font-semibold text-center">{p.activeCount}</span>
                      <span className="text-ink text-sm font-semibold text-center">{p.certified}</span>
                      <span className="text-geneo font-extrabold text-sm text-right">{p.score}</span>
                      <span className="text-muted text-sm font-semibold text-right">{p.totalPoints}</span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PharmacyMetric({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: number;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex flex-col gap-0.5 ${className ?? ""}`}>
      <span className="text-soft text-xs font-bold uppercase tracking-widest">{label}</span>
      <span className={`text-sm ${accent ? "text-geneo font-extrabold" : "text-ink font-semibold"}`}>
        {value}
      </span>
    </span>
  );
}
