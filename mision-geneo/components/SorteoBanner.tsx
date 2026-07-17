import { Gift } from "lucide-react";

/**
 * Banner informativo de los sorteos mensuales (lámina Lakhu: "participá por
 * sorteos exclusivos cada mes"). La mecánica real llega con el backend.
 */
export default function SorteoBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="flex items-center gap-2.5 rounded-2xl bg-rosa-suave/60 px-4 py-3 text-sm">
        <Gift size={17} className="text-geneo shrink-0" />
        <span className="text-ink font-medium leading-snug">
          Cada mes, <strong className="text-geneo">sorteos exclusivos</strong> entre las
          Especialistas Geneo.
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
        <p className="text-ink font-bold text-sm leading-tight">Sorteos mensuales</p>
        <p className="text-muted text-sm leading-snug mt-1">
          Participá por sorteos exclusivos cada mes entre las Especialistas Geneo. ¡Completar
          misiones te da más chances!
        </p>
      </div>
    </div>
  );
}
