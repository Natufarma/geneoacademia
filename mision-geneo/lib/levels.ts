import { TOTAL_POINTS } from "@/lib/missions";

/**
 * Niveles de Especialista Geneo por puntos acumulados.
 * El último nivel coincide con completar el viaje entero (980 pts).
 */

export type Level = {
  n: number;
  name: string;
  min: number;
  /** Qué representa el nivel y qué desbloquea. */
  blurb: string;
};

export const LEVELS: Level[] = [
  {
    n: 1,
    name: "Aprendiz Geneo",
    min: 0,
    blurb: "Arrancaste tu formación. Cada misión te acerca al certificado.",
  },
  {
    n: 2,
    name: "Asesora Geneo",
    min: 500,
    blurb: "Ya recomendás con criterio la línea Geneo. Vas por buen camino.",
  },
  {
    n: 3,
    name: "Especialista Geneo",
    min: TOTAL_POINTS,
    blurb: "Completaste el viaje: certificado digital + beneficios para tu farmacia.",
  },
];

export function getLevel(points: number): Level {
  return [...LEVELS].reverse().find((l) => points >= l.min) ?? LEVELS[0];
}

/** Próximo nivel a alcanzar, o null si ya está en el máximo. */
export function getNextLevel(points: number): Level | null {
  return LEVELS.find((l) => points < l.min) ?? null;
}
