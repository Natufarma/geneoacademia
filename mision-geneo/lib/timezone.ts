/**
 * Huso horario de referencia para "el día" en TODA la app: el negocio es
 * argentino, así que el día de la pregunta diaria, la racha y el período del
 * ranking se anclan acá — nunca a la hora del dispositivo ni a la del
 * servidor (que en Vercel corre en UTC).
 *
 * Por qué importa: si se usara la hora del proceso, el "día" cerraría a las
 * 21:00 hora Argentina (Argentina es UTC−3), así que todo lo que pasa entre
 * las 21:00 y las 23:59 quedaría mal atribuido al día/mes siguiente. Con
 * puntos y premios de por medio (mensuales y diarios), eso no es aceptable.
 *
 * Fuente única: lib/ranking.ts y lib/daily.ts importan `argentinaDateKey` de
 * acá — no duplicar esta lógica en más archivos.
 */
export const TIMEZONE = "America/Argentina/Buenos_Aires";

/** "en-CA" produce exactamente "YYYY-MM-DD". */
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Fecha "YYYY-MM-DD" de un instante, en hora de Argentina. */
export function argentinaDateKey(date: Date = new Date()): string {
  return dateKeyFormatter.format(date);
}
