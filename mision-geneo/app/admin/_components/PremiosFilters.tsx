"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Option = { id: string; name: string };

const selectClass =
  "min-h-11 rounded-full border border-line bg-paper px-4 pr-9 text-ink text-sm font-medium outline-none focus:border-geneo transition-colors";

/**
 * Filtros del tablero de premios del admin: estado, vendedor y farmacia.
 * Cada desplegable actualiza su parámetro en la URL (preservando los otros);
 * el filtrado real se hace server-side en la página.
 */
export default function PremiosFilters({
  vendors,
  pharmacies,
}: {
  vendors: Option[];
  pharmacies: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const estado = params.get("estado") ?? "todos";
  const vendedor = params.get("vendedor") ?? "";
  const farmacia = params.get("farmacia") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filtrar por estado"
        value={estado}
        onChange={(e) => setParam("estado", e.target.value === "todos" ? "" : e.target.value)}
        className={selectClass}
      >
        <option value="todos">Todos los estados</option>
        <option value="pendientes">Pendientes</option>
        <option value="entregados">Entregados</option>
      </select>

      <select
        aria-label="Filtrar por vendedor"
        value={vendedor}
        onChange={(e) => setParam("vendedor", e.target.value)}
        className={selectClass}
      >
        <option value="">Todos los vendedores</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por farmacia"
        value={farmacia}
        onChange={(e) => setParam("farmacia", e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las farmacias</option>
        {pharmacies.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
