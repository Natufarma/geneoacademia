import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDashboard } from "@/lib/admin-data";
import { Reveal } from "../_components/Reveal";
import { CertifiedBadge, EmptyState, StatCard, fmtDate } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getDashboard();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Panel de control</h1>
        <p className="text-muted text-sm">Formación de las Farmacias Aliadas Geneo en tiempo real.</p>
      </header>

      <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Empleados" value={stats.employees} hint="Registrados en la app" />
        <StatCard label="Certificados" value={stats.certified} hint="Especialistas Geneo" />
        <StatCard label="% Certificación" value={`${stats.certifiedPct}%`} hint="Completaron las 6 misiones" />
        <StatCard label="Farmacias" value={stats.pharmaciesActive} hint="Activas en el programa" />
      </Reveal>

      <Reveal className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-ink font-bold text-lg tracking-tight">Últimos registros</h2>
          <Link
            href="/admin/empleados"
            className="inline-flex items-center gap-1 min-h-11 text-geneo text-sm font-bold hover:underline active:underline"
          >
            Ver todos
            <ChevronRight size={16} />
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <EmptyState
            title="Todavía no hay empleados registrados"
            hint="Cuando una farmacia use la app, vas a verlos acá."
          />
        ) : (
          <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line overflow-hidden">
            {stats.recent.map((e) => (
              <Link
                key={e.id}
                href={`/admin/empleados/${e.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-rosa-suave/30 active:bg-rosa-suave/30 transition-colors"
              >
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-ink font-semibold text-sm leading-tight truncate">
                    {e.name}
                  </span>
                  <span className="text-muted text-xs truncate">{e.pharmacyName}</span>
                </span>
                <span className="hidden sm:block text-soft text-xs shrink-0">
                  {fmtDate(e.createdAt)}
                </span>
                <span className="text-geneo font-extrabold text-sm shrink-0 w-16 text-right">
                  {e.points} pts
                </span>
                <CertifiedBadge certified={e.certified} />
                <ChevronRight size={16} className="text-soft shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
