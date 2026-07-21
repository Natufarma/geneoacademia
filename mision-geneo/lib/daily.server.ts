import "server-only";

import { argentinaDateKey } from "./timezone";
import type { PublicDailyQuestion } from "./daily";

/**
 * Pool COMPLETO de la pregunta del día, con `correctIndex` y `feedback`.
 * SERVER-ONLY: `import "server-only"` hace que Next.js rompa el build si
 * algún componente cliente llega a importar este módulo (directa o
 * transitivamente), en vez de dejar que la respuesta correcta viaje en el
 * bundle del navegador como pasaba antes.
 *
 * El contenido sale EXCLUSIVAMENTE de lo ya validado en la app (lib/actives.ts,
 * lib/ciencia.ts, lib/products.ts, lib/rituales.ts, lib/missions.ts) — nada
 * inventado.
 *
 * La selección es determinista por fecha ARGENTINA (días desde época % pool),
 * así todas las farmacias ven la MISMA pregunta el mismo día, y ese día rota
 * a la medianoche de Buenos Aires — no a la medianoche UTC del servidor.
 */

export type DailyQuestion = PublicDailyQuestion & {
  correctIndex: number;
  /** Refuerzo breve al responder (rastreable al contenido fuente). */
  feedback: string;
};

export const DAILY_POOL: DailyQuestion[] = [
  {
    id: "eje-relanzamiento",
    question: "¿Cuáles son los pilares de Geneo?",
    options: [
      "Ciencia, Ritual y Belleza",
      "Solo Ciencia",
      "Precio, promo y venta",
      "Solo Belleza",
    ],
    correctIndex: 0,
    feedback: "Ciencia con respaldo, Ritual que transforma y Belleza desde adentro.",
  },
  {
    id: "activo-compartido-piel-beauty",
    question: "¿Qué activo comparten Piel Saludable y Beauty?",
    options: ["Coenzima Q-10", "L-cistina", "Isoflavonas de soja", "Licopeno"],
    correctIndex: 0,
    feedback: "La Q10 aporta acción energizante y antioxidante en ambas fórmulas.",
  },
  {
    id: "activo-45",
    question: "¿Qué activo distingue a Geneo 45+?",
    options: [
      "Isoflavonas de soja (genisteína)",
      "Colágeno hidrolizado",
      "Resveratrol",
      "Carotenos",
    ],
    correctIndex: 0,
    feedback:
      "La genisteína mejora la estructura de la piel y estimula la producción de ácido hialurónico.",
  },
  {
    id: "formula-piel-saludable",
    question: "¿Cuál es la fórmula de Geneo Piel Saludable?",
    options: [
      "Colágeno + Q10",
      "L-cistina + Hialurónico",
      "Genisteína + Vitamina C",
      "Carotenos + Licopeno",
    ],
    correctIndex: 0,
    feedback: "Colágeno hidrolizado para la firmeza + Q10 para la energía celular.",
  },
  {
    id: "lcistina-queratina",
    question: "¿Qué activo de Beauty es el principal constituyente de la queratina?",
    options: ["L-cistina", "Ácido hialurónico", "Coenzima Q-10", "Vitamina C"],
    correctIndex: 0,
    feedback: "La L-cistina participa en la síntesis de queratina de pelo, piel y uñas.",
  },
  {
    id: "origen-resveratrol",
    question: "¿De dónde proviene el resveratrol?",
    options: [
      "De las uvas negras y el vino tinto",
      "De la soja",
      "De los cítricos",
      "Del tomate",
    ],
    correctIndex: 0,
    feedback: "Es un polifenol natural presente en las uvas negras: potente antioxidante.",
  },
  {
    id: "funcion-hialuronico",
    question: "¿Qué hace el ácido hialurónico en la piel?",
    options: [
      "Hidrata y aumenta volumen y densidad",
      "Genera melanina",
      "Exfolia la superficie",
      "Bloquea los rayos UV",
    ],
    correctIndex: 0,
    feedback: "Actúa como hidratante y lubricante de los tejidos, minimizando las arrugas.",
  },
  {
    id: "tiempos-20",
    question: "Con constancia, ¿qué aparece a los 20 días?",
    options: [
      "Primeros signos de hidratación",
      "Más firmeza y elasticidad",
      "Glow natural más visible",
      "Nada todavía",
    ],
    correctIndex: 0,
    feedback: "20 días: primeros signos de hidratación. La constancia es la clave.",
  },
  {
    id: "tiempos-90",
    question: "¿Qué se logra a los 90 días de constancia?",
    options: [
      "Más firmeza y elasticidad",
      "Primeros signos de hidratación",
      "Bronceado inmediato",
      "Solo hidratación",
    ],
    correctIndex: 0,
    feedback: "90 días: más firmeza y elasticidad. Los resultados se construyen día a día.",
  },
  {
    id: "vitamina-c-colageno",
    question: "¿En qué participa la vitamina C de Geneo 45+?",
    options: [
      "En la síntesis de colágeno",
      "En la producción de queratina",
      "En el bronceado",
      "En la digestión",
    ],
    correctIndex: 0,
    feedback: "La vitamina C participa en la síntesis de colágeno y aporta luminosidad.",
  },
  {
    id: "recomendacion-beauty",
    question: "Una clienta quiere pelo más fuerte y uñas saludables. ¿Qué le recomendás?",
    options: ["Geneo Beauty", "Geneo Solar", "Geneo 45+", "Ningún Geneo"],
    correctIndex: 0,
    feedback: "Beauty: piel firme, pelo fuerte y uñas saludables.",
  },
  {
    id: "ritual-glow",
    question: "¿Qué productos combina el Ritual Glow?",
    options: [
      "Piel Saludable + Beauty",
      "Solar + 45+",
      "Beauty + Solar",
      "Solo Piel Saludable",
    ],
    correctIndex: 0,
    feedback: "Ritual Glow: luminosidad integral con Piel Saludable + Beauty.",
  },
  {
    id: "presentacion-piel",
    question: "¿En qué presentación viene Geneo Piel Saludable?",
    options: ["Polvo · 250 g", "30 comprimidos", "Crema · 50 ml", "Cápsulas blandas"],
    correctIndex: 0,
    feedback: "Piel Saludable viene en polvo de 250 g; Beauty y 45+ en comprimidos.",
  },
  {
    id: "ritual-45",
    question: "¿Qué combina el Ritual 45+?",
    options: [
      "45+ y Piel Saludable",
      "Beauty y Solar",
      "45+ y Solar",
      "Solo 45+",
    ],
    correctIndex: 0,
    feedback: "Ritual 45+: firmeza y elasticidad combinando 45+ con Piel Saludable.",
  },
];

/**
 * Días desde la época, contados sobre la fecha ARGENTINA (no sobre el
 * instante UTC crudo). Antes se usaba `Math.floor(date.getTime()/86_400_000)`,
 * que rota a medianoche UTC (21:00 hora Argentina): entre las 21:00 y las
 * 23:59 la pregunta ya cambiaba pero `dayKey()` (hora local) todavía no, así
 * que "la pregunta del día" y "el día" no coincidían. Al derivar el índice de
 * la MISMA clave "YYYY-MM-DD" argentina que usa `dayKey`, ambos rotan juntos.
 */
function argentinaDaysSinceEpoch(date: Date): number {
  const [year, month, day] = argentinaDateKey(date).split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** La misma pregunta para todo el mundo el mismo día (argentino). */
export function questionForToday(date: Date = new Date()): DailyQuestion {
  const daysSinceEpoch = argentinaDaysSinceEpoch(date);
  return DAILY_POOL[daysSinceEpoch % DAILY_POOL.length];
}

/** Recorta una pregunta completa a la forma pública (sin respuesta). */
export function toPublicQuestion(question: DailyQuestion): PublicDailyQuestion {
  return { id: question.id, question: question.question, options: question.options };
}
