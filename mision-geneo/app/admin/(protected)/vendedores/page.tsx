import { getVendors } from "@/lib/admin-data";
import { Reveal } from "../../_components/Reveal";
import { EmptyState } from "../../_components/ui";
import VendorsTable from "../../_components/VendorsTable";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const vendors = await getVendors();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">Vendedores</h1>
        <p className="text-muted text-sm">El equipo de ventas y los puntos de venta que sumó cada uno.</p>
      </header>

      {vendors.length === 0 ? (
        <EmptyState
          title="Todavía no hay vendedores"
          hint="Cuando alguien se registre desde el acceso de vendedores, aparece acá."
        />
      ) : (
        <Reveal>
          <VendorsTable vendors={vendors} />
        </Reveal>
      )}
    </div>
  );
}
