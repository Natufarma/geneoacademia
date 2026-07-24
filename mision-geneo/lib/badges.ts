import { LEVELS } from "@/lib/levels";

/**
 * Logros DERIVADOS: no se guardan en ningún lado, se calculan al vuelo desde el
 * estado que ya tiene la app (misiones, puntos, racha, respuestas del día,
 * posición en el ranking). Ventaja: retroactivo (si ya cumpliste el hito, lo
 * tenés) y nada que un usuario pueda falsear.
 */

export type BadgeFamily = "progreso" | "constancia" | "competencia";

export type BadgeInput = {
  /** Misiones core (viaje de 6) completadas. */
  completedMissions: number;
  /** Puntos ganados (solo misiones). */
  points: number;
  /** Las 6 misiones del viaje completas. */
  isSpecialist: boolean;
  /** Las dos misiones de Academia completas. */
  academiaDone: boolean;
  /** Días consecutivos de pregunta del día. */
  streak: number;
  /** Respuestas correctas acumuladas en la pregunta del día. */
  correctDailies: number;
  /** Posición en el ranking del mes; null si no se pudo leer o no está rankeada. */
  rankingPosition: number | null;
};

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  /** Cómo se consigue (se muestra siempre, también como pista si está bloqueado). */
  hint: string;
  family: BadgeFamily;
  earned: (i: BadgeInput) => boolean;
};

export const BADGES: Badge[] = [
  // Progreso / maestría
  {
    id: "primeros-pasos",
    emoji: "🌱",
    name: "Primeros pasos",
    hint: "Completá tu primera misión.",
    family: "progreso",
    earned: (i) => i.completedMissions >= 1,
  },
  {
    id: "asesora",
    emoji: "🌟",
    name: "Asesora Geneo",
    hint: `Alcanzá el nivel 2 (${LEVELS[1].min} puntos).`,
    family: "progreso",
    earned: (i) => i.points >= LEVELS[1].min,
  },
  {
    id: "especialista",
    emoji: "🎓",
    name: "Especialista Geneo",
    hint: "Completá las 6 misiones del viaje.",
    family: "progreso",
    earned: (i) => i.isSpecialist,
  },
  {
    id: "sabia-activos",
    emoji: "📚",
    name: "Sabia de activos",
    hint: "Completá las dos misiones de la Academia.",
    family: "progreso",
    earned: (i) => i.academiaDone,
  },
  // Constancia
  {
    id: "en-racha",
    emoji: "🔥",
    name: "En racha",
    hint: "Respondé la pregunta del día 3 días seguidos.",
    family: "constancia",
    earned: (i) => i.streak >= 3,
  },
  {
    id: "imparable",
    emoji: "⚡",
    name: "Imparable",
    hint: "Llegá a 7 días seguidos de racha.",
    family: "constancia",
    earned: (i) => i.streak >= 7,
  },
  {
    id: "aplicada",
    emoji: "🎯",
    name: "Aplicada",
    hint: "Sumá 15 respuestas correctas en la pregunta del día.",
    family: "constancia",
    earned: (i) => i.correctDailies >= 15,
  },
  // Competencia
  {
    id: "podio",
    emoji: "🏆",
    name: "Podio",
    hint: "Terminá el mes entre las 3 primeras del ranking.",
    family: "competencia",
    earned: (i) => i.rankingPosition !== null && i.rankingPosition <= 3,
  },
  {
    id: "numero-uno",
    emoji: "👑",
    name: "La número uno",
    hint: "Sé la número 1 del ranking del mes.",
    family: "competencia",
    earned: (i) => i.rankingPosition === 1,
  },
];

export function evaluateBadges(input: BadgeInput): { badge: Badge; earned: boolean }[] {
  return BADGES.map((badge) => ({ badge, earned: badge.earned(input) }));
}
