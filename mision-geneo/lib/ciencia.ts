/**
 * Contenido de la sección Ciencia ("Con respaldo de ciencia", lámina 4).
 * Textos tomados de la landing:
 *  - intro y enfoque: landing/components/Ciencia.tsx
 *  - pilares (Ciencia / Ritual / Belleza): láminas de Lakhu + la landing
 *  - tiempos 20/40/90: landing/components/EncontraRitual.tsx
 */

export const CIENCIA_INTRO =
  "Fórmulas nutricosméticas avanzadas, desarrolladas sobre evidencia científica para cuidar tu belleza desde adentro.";

export type Pilar = {
  slug: string;
  titulo: string;
  bajada: string;
};

export const PILARES: Pilar[] = [
  {
    slug: "ciencia",
    titulo: "Ciencia con respaldo",
    bajada: "Cada fórmula se apoya en activos con función comprobada sobre la piel.",
  },
  {
    slug: "ritual",
    titulo: "Ritual que transforma",
    bajada: "La constancia es la clave: los resultados se construyen día a día.",
  },
  {
    slug: "belleza",
    titulo: "Belleza desde adentro",
    bajada: "Nutrir la piel desde adentro para celebrarla afuera.",
  },
];

export type Hito = {
  dias: string;
  desc: string;
};

/** Progresión de resultados con constancia (EncontraRitual.tsx). */
export const TIEMPOS: Hito[] = [
  { dias: "20", desc: "Primeros signos de hidratación." },
  { dias: "40", desc: "Glow natural más visible." },
  { dias: "90", desc: "Más firmeza y elasticidad." },
];
