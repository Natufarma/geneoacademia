/**
 * Pregunta del día — parte CLIENT-SAFE. El contenido con `correctIndex`
 * (la respuesta correcta) vive exclusivamente en lib/daily.server.ts, que
 * nunca se importa desde un componente cliente: ese módulo trae
 * `import "server-only"` justamente para que un import accidental rompa el
 * build en vez de filtrar la respuesta al bundle del navegador.
 *
 * Acá solo queda lo que el cliente puede saber ANTES de responder: el tipo
 * público de la pregunta, los puntos que vale, la clave del día y el cálculo
 * de racha (que ya viene resuelto del servidor, no se inventa en el cliente).
 */

import { argentinaDateKey } from "./timezone";

export const DAILY_POINTS = 20;

/** Forma pública de la pregunta: SIN `correctIndex` ni `feedback`. */
export type PublicDailyQuestion = {
  id: string;
  question: string;
  options: string[];
};

/**
 * Clave YYYY-MM-DD anclada a hora de Argentina (ver lib/timezone.ts). Antes
 * usaba la hora local del dispositivo; se unificó con el resto de la app
 * (lib/ranking.ts) porque el servidor —que ahora es quien valida la
 * respuesta— corre en UTC y necesita una única fuente de verdad de "qué día
 * es hoy" que no dependa del reloj del teléfono ni del proceso.
 */
export function dayKey(date: Date = new Date()): string {
  return argentinaDateKey(date);
}

/**
 * Racha = días CONSECUTIVOS con respuesta, terminando hoy o ayer (si todavía
 * no respondió hoy, la racha de ayer sigue "viva").
 */
export function computeStreak(answeredDays: Set<string>, today: Date = new Date()): number {
  const cursor = new Date(today);
  if (!answeredDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (answeredDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
