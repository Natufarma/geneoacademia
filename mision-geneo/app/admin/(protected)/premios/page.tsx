import Link from "next/link";
import { Gift } from "lucide-react";
import { getAllRedemptions } from "@/lib/admin-data";
import { Reveal } from "../../_components/Reveal";
import { EmptyState, StatCard, fmtDate } from "../../_components/ui";

export const dynamic = "force-dynamic";

type Estado = "todos" | "pendientes" | "entregados";

const TABS: { value: Estado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendientes", label: "Pendientes" },
  { value: "entregados", label: "Entregados" },
];

function parseEstado(value: string | undefined): Estado {
  return value === "pendientes" || value === "entregados" ? value : "todos";
}

/** PENDIENTE = todavía no lo marcó entregado el vendedor (cualquier status != "delivered"). */
function isPending(status: string): boolean {
  return status !== "delivered";
}

function statusLabel(status: string): string {
  return isPending(status) ? "Pendiente" : "Entregado";
}

/** Delay escalonado por fila, capado para que listas largas no se sientan lentas. */
function rowDelay(i: number): number {
  return Math.min(i, 8) * 0.05;
}

export default async function PremiosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado: estadoParam } = await searchParams;
  const estado = parseEstado(estadoParam);

  const redemptions = await getAllRedemptions();
  const pendingCount = redemptions.filter((r) => isPending(r.status)).length;

  const filtered = redemptions.filter((r) => {
    if (estado === "pendientes") return isPending(r.status);
    if (estado === "entregados") return !isPending(r.status);
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Premios canjeados</h1>
        <p className="text-muted text-sm">
          Todos los canjes de las Farmacias Aliadas. La entrega la confirma el vendedor, acá solo se
          visualiza el estado.
        </p>
      </header>

      <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pendientes de entrega"
          value={pendingCount}
          hint="A confirmar por el vendedor"
          className={pendingCount > 0 ? "ring-2 ring-geneo" : undefined}
        />
        <StatCard label="Total canjes" value={redemptions.length} hint="Histórico completo" />
      </Reveal>

      <nav className="flex items-center gap-1">
        {TABS.map((tab) => {
          const href = tab.value === "todos" ? "/admin/premios" : `/admin/premios?estado=${tab.value}`;
          const active = tab.value === estado;
          return (
            <Link
              key={tab.value}
              href={href}
              className={`inline-flex items-center min-h-11 rounded-full px-4 text-sm font-bold transition-colors ${
                active
                  ? "bg-rosa-suave text-geneo"
                  : "text-muted hover:bg-rosa-suave/50 active:bg-rosa-suave/50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            estado === "pendientes"
              ? "No hay premios pendientes de entrega"
              : estado === "entregados"
                ? "Todavía no se entregó ningún premio"
                : "Todavía no hay premios canjeados"
          }
          hint={estado === "todos" ? "Cuando un empleado canjee un premio, aparece acá." : undefined}
        />
      ) : (
        <div className="bg-paper rounded-3xl shadow-soft overflow-hidden">
          {/* Mobile y tablet (hasta lg): cards apiladas, sin scroll horizontal táctil. */}
          <div className="lg:hidden divide-y divide-line">
            {filtered.map((r, i) => (
              <Reveal key={r.id} delay={rowDelay(i)}>
                <div className="flex flex-col gap-2 px-5 py-4">
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
                      <Gift size={16} />
                    </span>
                    <span className="flex flex-col min-w-0 flex-1">
                      <span className="text-ink font-semibold text-sm truncate">{r.employeeName}</span>
                      <span className="text-muted text-xs truncate">{r.pharmacyName}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="flex items-center justify-between gap-2 pl-12">
                    <span className="text-ink text-sm truncate">{r.prize}</span>
                    <span className="text-soft text-xs shrink-0">{fmtDate(r.createdAt)}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Desktop (lg+): tabla completa. */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.3fr_1.1fr_1.6fr_80px_120px_100px] gap-4 px-5 py-3 border-b border-line text-soft text-xs font-bold uppercase tracking-widest">
                <span>Empleado</span>
                <span>Farmacia</span>
                <span>Premio</span>
                <span className="text-right">Puntos</span>
                <span className="text-center">Estado</span>
                <span className="text-right">Fecha</span>
              </div>
              <div className="divide-y divide-line">
                {filtered.map((r, i) => (
                  <Reveal key={r.id} delay={rowDelay(i)}>
                    <div className="grid grid-cols-[1.3fr_1.1fr_1.6fr_80px_120px_100px] gap-4 items-center px-5 py-3.5">
                      <span className="text-ink font-semibold text-sm truncate">{r.employeeName}</span>
                      <span className="text-muted text-sm truncate">{r.pharmacyName}</span>
                      <span className="text-muted text-sm truncate">{r.prize}</span>
                      <span className="text-ink text-sm font-semibold text-right">{r.points}</span>
                      <span className="flex justify-center">
                        <StatusBadge status={r.status} />
                      </span>
                      <span className="text-soft text-xs text-right">{fmtDate(r.createdAt)}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-soft text-xs">
        {filtered.length} de {redemptions.length} canjes.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const pending = isPending(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
        pending ? "bg-rosa-suave text-geneo" : "bg-line/60 text-soft"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}
