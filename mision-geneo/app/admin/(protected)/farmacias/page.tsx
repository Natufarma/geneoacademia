import Link from "next/link";
import { Store } from "lucide-react";
import { getPharmacies } from "@/lib/admin-data";
import { Reveal } from "../../_components/Reveal";
import { EmptyState } from "../../_components/ui";

export const dynamic = "force-dynamic";

export default async function FarmaciasPage() {
  const pharmacies = await getPharmacies();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Farmacias</h1>
        <p className="text-muted text-sm">Desempeño de cada Farmacia Aliada y su equipo.</p>
      </header>

      {pharmacies.length === 0 ? (
        <EmptyState title="No hay farmacias cargadas" />
      ) : (
        <Reveal>
          <div className="overflow-x-auto bg-paper rounded-3xl shadow-soft">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.6fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-line text-soft text-[11px] font-bold uppercase tracking-widest">
                <span>Farmacia</span>
                <span className="text-center">Empleados</span>
                <span className="text-center">Certificados</span>
                <span className="text-right">Puntos equipo</span>
              </div>
              <div className="divide-y divide-line">
                {pharmacies.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/farmacias/${p.id}`}
                    className="grid grid-cols-[1.6fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-rosa-suave/30 active:bg-rosa-suave/30 transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                        <Store size={16} />
                      </span>
                      <span className="text-ink font-semibold text-sm truncate">{p.name}</span>
                    </span>
                    <span className="text-ink text-sm font-semibold text-center">{p.employees}</span>
                    <span className="text-ink text-sm font-semibold text-center">{p.certified}</span>
                    <span className="text-geneo font-extrabold text-sm text-right">{p.points}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
