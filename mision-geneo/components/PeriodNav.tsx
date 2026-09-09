"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { periodLabel } from "@/lib/ranking";

/**
 * Navegador de meses del ranking: ‹ Septiembre 2026 ›
 *
 * `periods` viene del server ordenado DESC (más reciente primero), así que
 * "mes anterior" es el índice siguiente y "mes siguiente" el anterior. Las
 * flechas se deshabilitan en los extremos en vez de esconderse: que el
 * control no cambie de ancho evita que el encabezado salte al navegar.
 */
export default function PeriodNav({
  periods,
  current,
  onChange,
}: {
  periods: string[];
  current: string;
  onChange: (period: string) => void;
}) {
  const i = periods.indexOf(current);
  const older = i >= 0 && i < periods.length - 1 ? periods[i + 1] : null;
  const newer = i > 0 ? periods[i - 1] : null;

  return (
    <div className="flex items-center justify-between gap-2 bg-paper rounded-full shadow-soft p-1">
      <ArrowButton
        label="Mes anterior"
        target={older}
        onChange={onChange}
        icon={<ChevronLeft size={20} />}
      />
      <span className="text-ink font-bold text-sm tracking-tight text-center flex-1 min-w-0 truncate">
        {periodLabel(current)}
      </span>
      <ArrowButton
        label="Mes siguiente"
        target={newer}
        onChange={onChange}
        icon={<ChevronRight size={20} />}
      />
    </div>
  );
}

function ArrowButton({
  label,
  target,
  onChange,
  icon,
}: {
  label: string;
  target: string | null;
  onChange: (period: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!target}
      onClick={() => target && onChange(target)}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0 text-geneo hover:bg-rosa-suave/60 active:bg-rosa-suave/60 disabled:text-line disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  );
}
