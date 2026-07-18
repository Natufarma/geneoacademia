import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { getPharmacy } from "@/lib/admin-data";
import { Reveal } from "../../../_components/Reveal";
import { CertifiedBadge, EmptyState, StatCard } from "../../../_components/ui";

export const dynamic = "force-dynamic";

export default async function FarmaciaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPharmacy(id);
  if (!data) notFound();
  const { pharmacy, employees } = data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/farmacias"
          className="inline-flex items-center gap-1.5 min-h-11 -my-2 text-muted hover:text-geneo active:text-geneo text-sm font-semibold transition-colors self-start"
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
            <p className="text-muted text-sm">Código: {pharmacy.code}</p>
          </div>
        </header>
      </div>

      <Reveal className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Empleados" value={pharmacy.employees} />
        <StatCard label="Certificados" value={pharmacy.certified} />
        <StatCard label="Puntos equipo" value={pharmacy.points} />
      </Reveal>

      <Reveal className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-lg tracking-tight">Equipo</h2>
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
                  <span className="text-ink font-semibold text-sm leading-tight truncate">
                    {e.name}
                  </span>
                  <span className="text-muted text-xs">
                    {e.levelName} · {e.coreDone}/{e.coreTotal} misiones
                  </span>
                </span>
                <span className="text-geneo font-extrabold text-sm shrink-0 w-16 text-right">
                  {e.points} pts
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
