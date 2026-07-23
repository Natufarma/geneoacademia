import { Gift } from "lucide-react";

/**
 * Banner informativo del premio mensual de farmacia (lámina Lakhu: "participá
 * por sorteos exclusivos cada mes"). La farmacia mejor rankeada del mes se
 * lleva un kit Geneo (bolsa + 2 productos); responder la pregunta del día
 * suma puntos al ranking de la farmacia (no al puntaje personal del empleado).
 */
export default function SorteoBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="flex items-center gap-2.5 rounded-2xl bg-rosa-suave/60 px-4 py-3 text-sm">
        <Gift size={17} className="text-geneo shrink-0" />
        <span className="text-ink font-medium leading-snug">
          La farmacia mejor rankeada del mes se lleva un{" "}
          <strong className="text-geneo">kit Geneo</strong>. ¡La pregunta del día suma!
        </span>
      </p>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-3xl bg-rosa-suave/60 px-5 py-4">
      <span className="flex items-center justify-center w-11 h-11 rounded-full bg-paper text-geneo shrink-0">
        <Gift size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-ink font-bold text-sm leading-tight">Premio mensual de farmacia</p>
        <p className="text-muted text-sm leading-snug mt-1">
          Cada mes, la farmacia mejor rankeada se lleva un kit Geneo (bolsa + 2 productos).
          ¡Completar misiones y responder la pregunta del día todos los días suma para tu farmacia!
        </p>
      </div>
    </div>
  );
}
