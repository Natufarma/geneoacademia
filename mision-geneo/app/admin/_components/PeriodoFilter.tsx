"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PeriodOption = { key: string; label: string };

const selectClass =
  "min-h-11 rounded-full border border-line bg-paper px-4 pr-9 text-ink text-sm font-medium outline-none focus:border-geneo transition-colors";

/**
 * Selector de período del ranking de farmacias.
 *
 * Existe porque el ranking se REINICIA cada mes (regla publicada en las
 * Bases): sin este desplegable el panel solo muestra el mes en curso y todo
 * el histórico queda invisible — que es justo lo que hacía parecer que el
 * ranking estaba "en cero" cuando en realidad la actividad era del mes
 * anterior.
 *
 * Escribe `?periodo=YYYY-MM` en la URL; el cálculo real es server-side.
 */
export default function PeriodoFilter({
  periods,
  current,
}: {
  periods: PeriodOption[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setPeriodo(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("periodo", value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      aria-label="Elegir período del ranking"
      value={current}
      onChange={(e) => setPeriodo(e.target.value)}
      className={selectClass}
    >
      {periods.map((p) => (
        <option key={p.key} value={p.key}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
