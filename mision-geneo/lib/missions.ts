/**
 * Misiones como DATOS (decisión de arquitectura del plan): el motor de la app
 * renderiza cualquier misión a partir de esta estructura. En la fase 2
 * (Academia Geneo) estas filas viven en la base y el admin crea misiones
 * nuevas sin tocar código — por eso acá no hay JSX ni lógica, solo contenido.
 *
 * Puntaje total del viaje: 980 pts (igual que el mockup de Lakhu).
 */

export type StepContent = {
  type: "content";
  title: string;
  body: string;
  bullets?: string[];
  image?: string;
};

export type QuizOption = {
  label: string;
  correct?: boolean;
};

export type StepQuiz = {
  type: "quiz";
  /** Contexto opcional arriba de la pregunta (ej. el caso de una clienta). */
  context?: string;
  question: string;
  options: QuizOption[];
  points: number;
  /** Refuerzo que se muestra al acertar. */
  feedback?: string;
};

export type MatchPair = {
  left: string;
  right: string;
};

export type StepMatch = {
  type: "match";
  prompt: string;
  pairs: MatchPair[];
  /** Puntos por CADA par unido correctamente. */
  pointsPerPair: number;
};

export type MissionStep = StepContent | StepQuiz | StepMatch;

export type Mission = {
  slug: string;
  order: number;
  title: string;
  short: string;
  description: string;
  pointsTotal: number;
  steps: MissionStep[];
  /**
   * Misión de la Academia Geneo (etapa 2): se desbloquea al ser Especialista,
   * suma puntos al histórico y al saldo, pero NO cuenta para el certificado
   * ni para TOTAL_POINTS (el viaje core sigue siendo de 980 pts).
   */
  advanced?: boolean;
  /**
   * Campaña de temporada (Academia, etapa 2): contenido rotativo que Natufarma
   * publica cada temporada. Abierta a todos (no exige ser Especialista), suma
   * puntos al histórico y al saldo, pero tampoco cuenta para el certificado.
   */
  campaign?: boolean;
  /** Rótulo de la temporada de la campaña (ej. "Beauty", "Verano"). */
  season?: string;
};

/** Suma de puntos obtenibles en un paso (0 para contenido). */
export function stepPoints(step: MissionStep): number {
  if (step.type === "quiz") return step.points;
  if (step.type === "match") return step.pointsPerPair * step.pairs.length;
  return 0;
}

export const MISSIONS: Mission[] = [
  {
    slug: "inicio",
    order: 1,
    title: "¡Bienvenida a Misión Geneo!",
    short: "Inicio",
    description: "Conocé el programa y cómo funciona.",
    pointsTotal: 100,
    steps: [
      {
        type: "content",
        title: "Convertite en Especialista Geneo",
        body: "Cada recomendación puede ayudar a una persona a sentirse mejor con su piel. Misión Geneo es un programa corto y entretenido: completás misiones, sumás puntos y obtenés tu certificado de Especialista Beauty Wellness.",
        bullets: [
          "Aprendé jugando en pocos minutos.",
          "Sumá puntos con cada misión.",
          "Obtené tu certificado y beneficios para tu farmacia.",
        ],
      },
      {
        type: "content",
        title: "Los 3 pilares de Geneo",
        body: "El nuevo Geneo se apoya en tres pilares que vas a ver en cada producto y en cada recomendación:",
        bullets: [
          "CIENCIA — con respaldo.",
          "RITUAL — constancia que transforma.",
          "BELLEZA — desde adentro, para celebrar.",
        ],
      },
      {
        type: "quiz",
        question: "¿Cuáles son los 3 pilares del nuevo Geneo?",
        options: [
          { label: "Precio, promoción y publicidad" },
          { label: "Ciencia, Ritual y Belleza", correct: true },
          { label: "Colágeno, vitaminas y minerales" },
          { label: "Piel, pelo y uñas" },
        ],
        points: 100,
        feedback: "¡Exacto! Ciencia con respaldo, ritual que transforma y belleza desde adentro.",
      },
    ],
  },
  {
    slug: "adn-geneo",
    order: 2,
    title: "Descubrí el ADN de Geneo",
    short: "ADN Geneo",
    description: "El relanzamiento, la nueva identidad y los pilares de la marca.",
    pointsTotal: 100,
    steps: [
      {
        type: "content",
        title: "La belleza empieza adentro y se celebra afuera",
        body: "Geneo se relanza con una identidad renovada: nuevos envases, nueva imagen y un mensaje claro. No es magia ni promesas vacías: es nutrición para la piel con respaldo científico, sostenida por un ritual diario.",
        image: "/img/hero-mobile.webp",
      },
      {
        type: "quiz",
        question: "¿Cuál es el eje del relanzamiento de Geneo?",
        options: [
          { label: "Ciencia" },
          { label: "Ritual" },
          { label: "Belleza" },
          { label: "Las tres anteriores", correct: true },
        ],
        points: 100,
        feedback: "¡Muy bien! El relanzamiento une ciencia, ritual y belleza en una sola identidad.",
      },
    ],
  },
  {
    slug: "recomendacion",
    order: 3,
    title: "Recomendá con confianza",
    short: "Recomendación",
    description: "Elegí el producto Geneo indicado para cada persona y situación.",
    pointsTotal: 200,
    steps: [
      {
        type: "content",
        title: "Escuchar antes de recomendar",
        body: "La recomendación empieza por la necesidad de la persona: ¿busca luminosidad, firmeza, pelo y uñas más fuertes, preparar la piel para el sol o acompañar una etapa de cambios? Cada Geneo tiene su indicación.",
        bullets: [
          "PIEL SALUDABLE — glow, hidratación y firmeza.",
          "BEAUTY — pelo fuerte y uñas saludables.",
          "45+ — nutrición para la piel en cada etapa.",
          "SOLAR — bronceado saludable desde adentro.",
        ],
      },
      {
        type: "quiz",
        context:
          "Camila, 38 años: “Quiero una piel más luminosa y mejorar la elasticidad.”",
        question: "¿Qué Geneo le recomendarías?",
        options: [
          { label: "Piel Saludable", correct: true },
          { label: "Beauty" },
          { label: "Solar" },
          { label: "45+" },
        ],
        points: 100,
        feedback: "¡Correcto! Colágeno + Q10 para glow, hidratación y firmeza.",
      },
      {
        type: "quiz",
        context:
          "Valeria, 52 años: “Desde la menopausia siento la piel más fina, con menos firmeza.”",
        question: "¿Qué Geneo le recomendarías?",
        options: [
          { label: "Beauty" },
          { label: "Solar" },
          { label: "45+", correct: true },
          { label: "Piel Saludable" },
        ],
        points: 100,
        feedback: "¡Muy bien! 45+ está formulado para acompañar los cambios de la piel en esa etapa.",
      },
    ],
  },
  {
    slug: "tiempo",
    order: 4,
    title: "Los resultados llegan con constancia",
    short: "Tiempo",
    description: "Entendé el poder del 20 → 40 → 90.",
    pointsTotal: 100,
    steps: [
      {
        type: "content",
        title: "El poder de la constancia",
        body: "Geneo es un ritual, no una solución mágica de un día. La piel se renueva por ciclos, y por eso los resultados se construyen día a día:",
        bullets: [
          "20 DÍAS — primeros cambios: la piel se siente más hidratada.",
          "40 DÍAS — se nota: más luminosidad y suavidad.",
          "90 DÍAS — transformación: firmeza y elasticidad visibles.",
        ],
      },
      {
        type: "quiz",
        question: "¿Cuándo empiezan a verse los resultados?",
        options: [
          { label: "20 días" },
          { label: "40 días" },
          { label: "90 días" },
          { label: "Los tres: es una progresión", correct: true },
        ],
        points: 100,
        feedback: "¡Exacto! +20 → +40 → +90: la constancia es la clave del ritual.",
      },
    ],
  },
  {
    slug: "ingredientes",
    order: 5,
    title: "Conocé lo que nos hace únicos",
    short: "Ingredientes",
    description: "Colágeno, Q10 y los activos que hacen la diferencia.",
    pointsTotal: 200,
    steps: [
      {
        type: "content",
        title: "Activos con respaldo",
        body: "Cada fórmula Geneo combina activos estudiados que trabajan desde adentro. Conocerlos te da seguridad para responder cualquier consulta en el mostrador.",
      },
      {
        type: "match",
        prompt: "Uní cada activo con su beneficio:",
        pairs: [
          { left: "Colágeno hidrolizado", right: "Estructura y firmeza dérmica" },
          { left: "Coenzima Q10", right: "Energía celular y acción antioxidante" },
          { left: "Ácido hialurónico", right: "Hidratación y volumen de la piel" },
          { left: "L-Cistina", right: "Queratina de pelo y uñas" },
        ],
        pointsPerPair: 50,
      },
    ],
  },
  {
    slug: "desafio-final",
    order: 6,
    title: "¡Desafío final!",
    short: "Desafío final",
    description: "Poné a prueba todo lo aprendido.",
    pointsTotal: 280,
    steps: [
      {
        type: "quiz",
        context: "Una clienta busca pelo más fuerte y uñas saludables.",
        question: "¿Qué Geneo le recomendás?",
        options: [
          { label: "Piel Saludable" },
          { label: "Beauty", correct: true },
          { label: "45+" },
          { label: "Solar" },
        ],
        points: 70,
      },
      {
        type: "quiz",
        question:
          "¿Qué activo ayuda a generar energía en las células y su producción cae con la edad?",
        options: [
          { label: "Colágeno hidrolizado" },
          { label: "Ácido hialurónico" },
          { label: "Coenzima Q10", correct: true },
          { label: "L-Cistina" },
        ],
        points: 70,
      },
      {
        type: "quiz",
        question: "¿A los cuántos días se ve la transformación completa (firmeza y elasticidad)?",
        options: [
          { label: "7 días" },
          { label: "20 días" },
          { label: "40 días" },
          { label: "90 días", correct: true },
        ],
        points: 70,
      },
      {
        type: "quiz",
        question: "Completá la frase: “La belleza empieza adentro…”",
        options: [
          { label: "…y se celebra afuera.", correct: true },
          { label: "…y se compra en la farmacia." },
          { label: "…y termina afuera." },
          { label: "…y se nota enseguida." },
        ],
        points: 70,
        feedback: "¡Eso! Ya pensás como una Especialista Geneo.",
      },
    ],
  },
];

/**
 * Academia Geneo — misiones avanzadas post-certificado. Todo el contenido
 * está tomado de los textos reales de la landing (Ciencia.tsx: mecanismos de
 * los 9 activos; Rituales.tsx: fórmulas por producto; EncontraRitual.tsx:
 * combos de rituales). No inventar datos que no estén en la web.
 */
export const ADVANCED_MISSIONS: Mission[] = [
  {
    slug: "activos-avanzado",
    order: 7,
    advanced: true,
    title: "Ciencia de los activos",
    short: "Activos",
    description: "Nivel experto: fórmulas, mecanismos y combinaciones.",
    pointsTotal: 300,
    steps: [
      {
        type: "content",
        title: "Bienvenida al nivel experto",
        body: "Este es el nivel experto. Acá no alcanza con saber qué hace cada producto: vas a demostrar qué activo lo hace posible y por qué. Repasá las tres fórmulas antes de empezar:",
        bullets: [
          "PIEL SALUDABLE — Colágeno hidrolizado + Coenzima Q10.",
          "BEAUTY — L-cistina + Ácido hialurónico + Resveratrol + Q10 + vitaminas y minerales.",
          "45+ — Isoflavonas de soja enriquecidas en genisteína + Ácido hialurónico + Vitamina C.",
        ],
      },
      {
        type: "quiz",
        question: "¿Qué activo diferencia la fórmula de 45+ de la de Piel Saludable?",
        options: [
          { label: "Isoflavonas de soja (genisteína)", correct: true },
          { label: "Colágeno hidrolizado" },
          { label: "Coenzima Q10" },
          { label: "L-cistina" },
        ],
        points: 50,
        feedback:
          "45+ suma genisteína, ácido hialurónico y vitamina C; Piel Saludable se apoya en colágeno + Q10.",
      },
      {
        type: "quiz",
        question: "¿Por qué la genisteína es clave a partir de los 45 años?",
        options: [
          {
            label:
              "Los estrógenos que regulan la piel caen desde los 45: la genisteína mejora su estructura y estimula el ácido hialurónico",
            correct: true,
          },
          { label: "Aporta colágeno directo a la dermis" },
          { label: "Actúa como pigmentante natural de la piel" },
          { label: "Es el principal componente de la queratina" },
        ],
        points: 50,
        feedback:
          "Exacto: compensa la caída de estrógenos mejorando las propiedades estructurales de la piel.",
      },
      {
        type: "match",
        prompt: "Nivel experto: uní cada activo con su mecanismo real:",
        pairs: [
          { left: "Resveratrol", right: "Polifenol de las uvas negras: elimina radicales libres" },
          { left: "Vitamina C", right: "Participa en la síntesis de colágeno y da luminosidad" },
          { left: "Licopeno", right: "Potencia el betacaroteno y protege frente a los rayos UV" },
          { left: "Ácido hialurónico", right: "Hidratante y lubricante: aporta volumen y densidad" },
        ],
        pointsPerPair: 25,
      },
      {
        type: "quiz",
        context: "Una clienta busca firmeza y elasticidad, y quiere el ritual completo.",
        question: "Según el ritual Firmeza, ¿qué combinación le recomendás?",
        options: [
          { label: "Piel Saludable + 45+", correct: true },
          { label: "Piel Saludable + Beauty" },
          { label: "Beauty + Solar" },
          { label: "Solo Beauty" },
        ],
        points: 50,
        feedback:
          "El ritual Firmeza combina Piel Saludable + 45+. Piel Saludable + Beauty es el ritual Glow.",
      },
      {
        type: "quiz",
        question: "¿Qué activo comparten las fórmulas de Piel Saludable y Beauty?",
        options: [
          { label: "Coenzima Q10", correct: true },
          { label: "Colágeno hidrolizado" },
          { label: "Ácido hialurónico" },
          { label: "Resveratrol" },
        ],
        points: 50,
        feedback:
          "La Q10 está en ambas: energía celular y acción antioxidante. El colágeno es exclusivo de Piel Saludable.",
      },
    ],
  },
];

/**
 * Campañas de temporada — Academia Geneo (etapa 2). Contenido rotativo que
 * demuestra que la plataforma escala: cada temporada Natufarma publica una
 * campaña nueva. Abiertas a todos (no exigen ser Especialista) y suman puntos,
 * pero no afectan el certificado ni TOTAL_POINTS. Contenido tomado de la
 * landing: fórmula Beauty (Rituales.tsx) y mecanismos de sus activos
 * (Ciencia.tsx). No inventar datos que no estén publicados.
 */
export const CAMPAIGN_MISSIONS: Mission[] = [
  {
    slug: "campana-beauty",
    order: 8,
    campaign: true,
    season: "Beauty",
    title: "Misión Beauty: pelo y uñas",
    short: "Beauty",
    description: "Nueva campaña: reforzá lo que sabés de la línea Beauty.",
    pointsTotal: 250,
    steps: [
      {
        type: "content",
        title: "Geneo Beauty, de adentro hacia afuera",
        body: "Beauty está pensado para quienes buscan pelo más fuerte y uñas saludables. Su fórmula combina activos que trabajan la queratina, la hidratación y la protección antioxidante:",
        bullets: [
          "L-cistina — constituyente de la queratina del pelo, piel y uñas.",
          "Ácido hialurónico — hidratación, volumen y densidad.",
          "Resveratrol + Coenzima Q10 — acción antioxidante.",
          "Vitaminas y minerales — complemento de la fórmula.",
        ],
      },
      {
        type: "quiz",
        context: "Una clienta te dice que se le cae el pelo y tiene las uñas quebradizas.",
        question: "¿Para qué necesidad está pensado Geneo Beauty?",
        options: [
          { label: "Pelo más fuerte y uñas saludables", correct: true },
          { label: "Preparar la piel para el sol" },
          { label: "Acompañar los cambios de la piel en la menopausia" },
          { label: "Un bronceado más intenso" },
        ],
        points: 60,
        feedback: "¡Exacto! Beauty apunta a la fuerza del pelo y la salud de las uñas.",
      },
      {
        type: "quiz",
        question:
          "¿Qué activo de Beauty es el principal constituyente de la queratina del pelo, la piel y las uñas?",
        options: [
          { label: "L-cistina", correct: true },
          { label: "Resveratrol" },
          { label: "Coenzima Q10" },
          { label: "Ácido hialurónico" },
        ],
        points: 60,
        feedback:
          "¡Bien! La L-cistina es un aminoácido azufrado que participa en la síntesis de la queratina y se asocia a mayor densidad del pelo.",
      },
      {
        type: "match",
        prompt: "Uní cada activo de la fórmula Beauty con su función:",
        pairs: [
          { left: "L-cistina", right: "Queratina del pelo, piel y uñas" },
          { left: "Ácido hialurónico", right: "Hidratación, volumen y densidad" },
          { left: "Resveratrol", right: "Antioxidante: elimina radicales libres" },
          { left: "Coenzima Q10", right: "Energía celular y acción antioxidante" },
        ],
        pointsPerPair: 25,
      },
      {
        type: "quiz",
        context: "Tu clienta quiere pelo y uñas fuertes y, además, más luminosidad en la piel.",
        question: "¿Qué ritual le armás?",
        options: [
          { label: "Ritual Glow: Piel Saludable + Beauty", correct: true },
          { label: "Ritual Firmeza: Piel Saludable + 45+" },
          { label: "Solo Solar" },
          { label: "Solo 45+" },
        ],
        points: 30,
        feedback:
          "¡Eso! El ritual Glow combina Piel Saludable + Beauty: luminosidad de la piel más fuerza del pelo y las uñas.",
      },
    ],
  },
];

export const TOTAL_POINTS = MISSIONS.reduce((acc, m) => acc + m.pointsTotal, 0);

export function getMission(slug: string): Mission | undefined {
  return (
    MISSIONS.find((m) => m.slug === slug) ??
    ADVANCED_MISSIONS.find((m) => m.slug === slug) ??
    CAMPAIGN_MISSIONS.find((m) => m.slug === slug)
  );
}
