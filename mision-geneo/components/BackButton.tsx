"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Botón "Volver" que regresa a la pantalla anterior real (historial), en vez de
 * mandar siempre a "/". Importa para páginas compartidas entre la app de
 * empleado y el panel de vendedor (bases, privacidad): un vendedor debe volver
 * a SU perfil, no caer en la app de empleado. Si no hay historial (deep link),
 * cae al `fallback`.
 */
export default function BackButton({
  label = "Volver",
  fallback = "/",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1.5 min-h-11 -my-2 self-start text-muted hover:text-geneo active:text-geneo text-sm font-semibold transition-colors"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
