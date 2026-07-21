import { argentinaDateKey } from "./timezone";

/**
 * Fuente única de verdad del ranking (empleados + farmacias).
 *
 * Reglas de negocio (definidas por el cliente, MODIFICAN el .docx fuente):
 * - Período: mes calendario. Todo el ranking resetea cada mes.
 * - Puntos de un empleado en el período = mission_progress.score (completed_at
 *   en el mes) + daily_answers.points (day en el mes).
 * - Empleado activo = sumó al menos 1 punto en el período.
 * - Puntaje de una farmacia = promedio de sus 3 empleados activos con MÁS
 *   puntos del período (o menos, si tiene menos de 3). 0 activos → no rankea.
 *   (Descarta la sección 4 del .docx: "promedio de TODOS los activos" premia
 *   que los empleados flojos no participen; con top-3 el tamaño del equipo
 *   no determina quién gana.)
 * - Desempate entre farmacias: más empleados activos: si sigue empatado,
 *   alfabético por nombre (determinístico).
 *
 * Funciones PURAS: sin I/O, sin Supabase. Los llamadores (route handlers,
 * admin-data.ts) resuelven las filas de la base y le pasan arrays acá.
 */

// ─── Período ────────────────────────────────────────────────────────────────

/**
 * El período se ancla EXPLÍCITAMENTE a la hora de Argentina, no a la hora
 * local del proceso. En Vercel el servidor corre en UTC, y como Argentina es
 * UTC−3, usar la hora del servidor haría que el mes cerrara a las 21:00 del
 * último día: los puntos sumados entre las 21:00 y las 23:59 del 31 caerían
 * en el mes siguiente. Con premios mensuales de por medio, eso no es
 * aceptable.
 *
 * Además `daily_answers.day` ya se escribe con la misma clave argentina
 * (ver lib/daily.ts#dayKey, que reutiliza lib/timezone.ts), así que comparar
 * por clave de mes "YYYY-MM" mantiene ambas fuentes en el mismo huso y
 * elimina la aritmética de bordes.
 */

export type Period = {
  /** Clave estable del período, formato "YYYY-MM" (hora de Argentina). */
  key: string;
};

/** Mes calendario argentino que contiene `ref` (por defecto: ahora). */
export function getPeriodBounds(ref: Date = new Date()): Period {
  return { key: argentinaDateKey(ref).slice(0, 7) };
}

/** `completed_at` es un timestamptz ISO; se lleva a hora argentina antes de comparar. */
function isTimestampInPeriod(iso: string, period: Period): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return argentinaDateKey(d).slice(0, 7) === period.key;
}

/** `day` ya es "YYYY-MM-DD" local (ver lib/daily.ts#dayKey): se compara el mes directo. */
function isDayInPeriod(day: string, period: Period): boolean {
  return typeof day === "string" && day.slice(0, 7) === period.key;
}

// ─── Puntos ─────────────────────────────────────────────────────────────────

type ScoreLike = { score: number };
type DailyPointsLike = { points: number };
type MissionProgressLike = ScoreLike & { completed_at: string };
type DailyAnswerLike = DailyPointsLike & { day: string };

/**
 * Puntos GANADOS de todo el historial (misiones + pregunta del día), sin
 * filtro de período. Es el número que definen nivel de Especialista,
 * certificado y saldo canjeable — ACUMULATIVO, nunca resetea.
 */
export function totalPoints(
  missionProgress: ScoreLike[],
  dailyAnswers: DailyPointsLike[],
): number {
  const missionPts = missionProgress.reduce((acc, p) => acc + p.score, 0);
  const dailyPts = dailyAnswers.reduce((acc, d) => acc + d.points, 0);
  return missionPts + dailyPts;
}

/** Puntos de un empleado dentro de un período (mes calendario) — para el ranking. */
export function pointsInPeriod(
  missionProgress: MissionProgressLike[],
  dailyAnswers: DailyAnswerLike[],
  period: Period,
): number {
  const inPeriodMissions = missionProgress.filter((p) => isTimestampInPeriod(p.completed_at, period));
  const inPeriodDaily = dailyAnswers.filter((d) => isDayInPeriod(d.day, period));
  return totalPoints(inPeriodMissions, inPeriodDaily);
}

// ─── Farmacias ──────────────────────────────────────────────────────────────

export type PharmacyScoreResult = {
  /** Promedio de los top-3 empleados activos del período, redondeado a 1 decimal. */
  score: number;
  /** Cantidad de empleados con >0 puntos en el período. */
  activeCount: number;
  /** Suma bruta de los puntos del período de TODOS los empleados pasados (dato crudo para control de integridad). */
  totalPoints: number;
};

/**
 * Puntaje de una farmacia: promedio de los 3 empleados activos con más
 * puntos del período (o de los que haya, si son menos de 3). Sin piso
 * mínimo: con 1 activo la farmacia ya compite. 0 activos → score 0
 * (el llamador decide si la excluye del ranking).
 */
export function pharmacyScore(employeePoints: number[]): PharmacyScoreResult {
  const active = employeePoints.filter((p) => p > 0);
  const totalPts = employeePoints.reduce((acc, p) => acc + p, 0);
  const activeCount = active.length;
  if (activeCount === 0) return { score: 0, activeCount: 0, totalPoints: totalPts };

  const top3 = [...active].sort((a, b) => b - a).slice(0, 3);
  const avg = top3.reduce((acc, p) => acc + p, 0) / top3.length;
  const score = Math.round(avg * 10) / 10;
  return { score, activeCount, totalPoints: totalPts };
}

type PharmacyRankInput = { name: string; score: number; activeCount: number };

/** Ordena farmacias por score desc; desempata por más activos, luego alfabético. Asigna posición 1-based. */
export function rankPharmacies<T extends PharmacyRankInput>(
  pharmacies: T[],
): (T & { position: number })[] {
  return [...pharmacies]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.activeCount !== a.activeCount) return b.activeCount - a.activeCount;
      return a.name.localeCompare(b.name, "es");
    })
    .map((p, i) => ({ ...p, position: i + 1 }));
}

// ─── Empleados ──────────────────────────────────────────────────────────────

type EmployeeRankInput = { name: string; points: number };

/** Ordena empleados por puntos desc; desempata alfabético por nombre. Asigna posición 1-based. */
export function rankEmployees<T extends EmployeeRankInput>(
  employees: T[],
): (T & { position: number })[] {
  return [...employees]
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name, "es");
    })
    .map((e, i) => ({ ...e, position: i + 1 }));
}

// ─── Anonimización ──────────────────────────────────────────────────────────

/**
 * "María González" → "María G." (nombre + inicial del apellido). Sin
 * apellido, devuelve el nombre tal cual. Normaliza espacios múltiples.
 */
export function displayName(fullName: string): string {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  const [first, second] = trimmed.split(" ");
  if (!second) return first;
  return `${first} ${second[0].toUpperCase()}.`;
}
