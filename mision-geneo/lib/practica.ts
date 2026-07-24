import { ACTIVES, type Active } from "@/lib/actives";

/**
 * Quiz de PRÁCTICA sobre los 9 activos (modo repaso, sin presión: no reinicia,
 * no da puntos, muestra el porqué). Se arma DETERMINÍSTICAMENTE desde
 * lib/actives.ts — nada de Math.random, así no hay mismatch de hidratación y el
 * repaso es siempre el mismo set ordenado.
 */

export type PracticeQuestion = {
  /** El activo correcto. */
  active: Active;
  /** La consigna: la descripción del activo (se pregunta "¿de cuál hablamos?"). */
  prompt: string;
  options: string[];
  correctIndex: number;
};

export function buildActivesQuiz(): PracticeQuestion[] {
  const n = ACTIVES.length;
  return ACTIVES.map((active, i) => {
    // 3 distractores determinísticos (offsets coprimos con 9 → nunca repiten ni
    // caen en el correcto): otros tres activos distintos.
    const distractors = [ACTIVES[(i + 1) % n], ACTIVES[(i + 3) % n], ACTIVES[(i + 5) % n]].map(
      (a) => a.name,
    );
    // Posición del correcto rotando con i, para que no quede siempre en el mismo lugar.
    const correctIndex = i % 4;
    const options = [...distractors];
    options.splice(correctIndex, 0, active.name);
    return {
      active,
      prompt: active.description,
      options: options.slice(0, 4),
      correctIndex,
    };
  });
}
