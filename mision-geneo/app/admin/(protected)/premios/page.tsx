import { Download, Gift } from "lucide-react";
import { getAllRedemptions } from "@/lib/admin-data";
import PremiosFilters from "../../_components/PremiosFilters";
import { Reveal } from "../../_components/Reveal";
import { EmptyState, StatCard, fmtDate } from "../../_components/ui";

export const dynamic = "force-dynamic";

type Estado = "todos" | "pendientes" | "entregados";
type Option = { id: string; name: string };

function parseEstado(value: string | undefined): Estado {
  return value === "pendientes" || value === "entregados" ? value : "todos";
}

/** Opciones únicas por id, ordenadas alfabéticamente (para los desplegables). */
function uniqueOptions(items: Option[]): Option[] {
  const map = new Map(items.map((o) => [o.id, o]));
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
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
  searchParams: Promise<{ estado?: string; vendedor?: string; farmacia?: string }>;
}) {
  const { estado: estadoParam, vendedor, farmacia } = await searchParams;
  const estado = parseEstado(estadoParam);

  const redemptions = await getAllRedemptions();
  const pendingCount = redemptions.filter((r) => isPending(r.status)).length;

  // Opciones de los desplegables: vendedores y farmacias presentes en los canjes.
  const vendorOptions = uniqueOptions(
    redemptions.flatMap((r) => (r.vendorId ? [{ id: r.vendorId, name: r.vendorName ?? "—" }] : [])),
  );
  const pharmacyOptions = uniqueOptions(
    redemptions.flatMap((r) => (r.pharmacyId ? [{ id: r.pharmacyId, name: r.pharmacyName }] : [])),
  );

  const filtered = redemptions.filter((r) => {
    if (estado === "pendientes" && !isPending(r.status)) return false;
    if (estado === "entregados" && isPending(r.status)) return false;
    if (vendedor && r.vendorId !== vendedor) return false;
    if (farmacia && r.pharmacyId !== farmacia) return false;
    return true;
  });

  const exportParams = new URLSearchParams();
  if (estado !== "todos") exportParams.set("estado", estado);
  if (vendedor) exportParams.set("vendedor", vendedor);
  if (farmacia) exportParams.set("farmacia", farmacia);
  const exportHref = `/admin/export/premios${exportParams.toString() ? `?${exportParams}` : ""}`;

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PremiosFilters vendors={vendorOptions} pharmacies={pharmacyOptions} />
        {redemptions.length > 0 && (
          <a
            href={exportHref}
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold text-sm px-5 transition-colors"
          >
            <Download size={16} />
            Descargar CSV
          </a>
        )}
      </div>

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
                      <span className="text-muted text-xs truncate">
                        {r.pharmacyName}
                        {r.vendorName ? ` · ${r.vendorName}` : ""}
                      </span>
                    </span>
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="flex items-center justify-between gap-2 pl-12">
                    <span className="text-ink text-sm truncate">{r.prize}</span>
                    <span className="text-soft text-xs shrink-0">
                      {!isPending(r.status) && r.deliveredAt
                        ? `Entregado ${fmtDate(r.deliveredAt)}`
                        : fmtDate(r.createdAt)}
                    </span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Desktop (lg+): tabla completa. */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1.3fr_70px_110px_120px] gap-4 px-5 py-3 border-b border-line text-soft text-xs font-bold uppercase tracking-widest">
                <span>Empleado</span>
                <span>Farmacia</span>
                <span>Vendedor</span>
                <span>Premio</span>
                <span className="text-right">Puntos</span>
                <span className="text-center">Estado</span>
                <span className="text-right">Fecha</span>
              </div>
              <div className="divide-y divide-line">
                {filtered.map((r, i) => (
                  <Reveal key={r.id} delay={rowDelay(i)}>
                    <div className="grid grid-cols-[1.2fr_1fr_1fr_1.3fr_70px_110px_120px] gap-4 items-center px-5 py-3.5">
                      <span className="text-ink font-semibold text-sm truncate">{r.employeeName}</span>
                      <span className="text-muted text-sm truncate">{r.pharmacyName}</span>
                      <span className="text-muted text-sm truncate">{r.vendorName ?? "—"}</span>
                      <span className="text-muted text-sm truncate">{r.prize}</span>
                      <span className="text-ink text-sm font-semibold text-right">{r.points}</span>
                      <span className="flex justify-center">
                        <StatusBadge status={r.status} />
                      </span>
                      <span className="text-soft text-xs text-right">
                        {!isPending(r.status) && r.deliveredAt
                          ? `Entregado ${fmtDate(r.deliveredAt)}`
                          : fmtDate(r.createdAt)}
                      </span>
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
