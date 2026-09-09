"use client";

import { Download } from "lucide-react";

/**
 * Dispara el diálogo de impresión del navegador para guardar la vista
 * imprimible como PDF. Mismo patrón que el certificado del empleado
 * (`app/certificado/page.tsx`): sin dependencias de PDF, la hoja la arma el
 * navegador a partir del bloque `.print-only`.
 *
 * `disabled` se usa cuando el período elegido no tiene datos: exportar una
 * hoja vacía solo genera un PDF que confunde a quien lo recibe.
 */
export default function PrintButton({
  label = "Descargar PDF",
  disabledHint,
}: {
  label?: string;
  /** Si viene, el botón se deshabilita y esto explica por qué. */
  disabledHint?: string;
}) {
  const disabled = Boolean(disabledHint);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      disabled={disabled}
      title={disabledHint}
      className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft disabled:cursor-not-allowed px-5 text-white text-sm font-bold transition-colors"
    >
      <Download size={16} />
      {label}
    </button>
  );
}
