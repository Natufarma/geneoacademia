/**
 * Guía de activos (Academia Geneo). Los 9 compuestos con la descripción REAL
 * de la landing (landing/components/Ciencia.tsx, condensada de
 * geneo.natufarma.com/es/compuestos-activos) y sus fotos.
 *
 * `products` sale EXCLUSIVAMENTE de las fórmulas publicadas en
 * landing/components/Rituales.tsx (Piel Saludable = Colágeno + Q10;
 * Beauty = L-cistina + Hialurónico + Resveratrol + Q10 + vit. y minerales;
 * 45+ = Isoflavonas con genisteína + Hialurónico + Vit. C). Solar no publica
 * su composición en la web, por eso ningún activo lo referencia.
 */

export type Active = {
  slug: string;
  name: string;
  description: string;
  img: string;
  /** Productos que declaran este activo en su fórmula publicada. */
  products: string[];
};

export const ACTIVES: Active[] = [
  {
    slug: "colageno",
    name: "Colágeno hidrolizado",
    description:
      "Principal componente de la dermis. Su función es crear y mantener las estructuras de los tejidos, decisiva para la firmeza y la flexibilidad de la piel.",
    img: "/img/comp-colageno.webp",
    products: ["Piel Saludable"],
  },
  {
    slug: "q10",
    name: "Coenzima Q-10",
    description:
      "Compuesto que ayuda a generar energía en las células; su producción disminuye con la edad. Acción energizante y antioxidante que evita arrugas y envejecimiento prematuro.",
    img: "/img/comp-q10.webp",
    products: ["Piel Saludable", "Beauty"],
  },
  {
    slug: "acido-hialuronico",
    name: "Ácido hialurónico",
    description:
      "A partir de los 35 años la piel pierde firmeza y volumen por la caída en su producción. Actúa como hidratante y lubricante de los tejidos, aumentando volumen y densidad y minimizando las arrugas.",
    img: "/img/comp-acido.webp",
    products: ["Beauty", "45+"],
  },
  {
    slug: "isoflavonas",
    name: "Isoflavonas de soja (genisteína)",
    description:
      "Los estrógenos regulan el espesor e hidratación de la piel y caen desde los 45 años. La genisteína mejora las propiedades estructurales de la piel y estimula la producción de ácido hialurónico.",
    img: "/img/comp-isoflavonas.webp",
    products: ["45+"],
  },
  {
    slug: "l-cistina",
    name: "L-cistina",
    description:
      "Aminoácido azufrado, principal constituyente de la queratina del cabello, piel y uñas. Participa en su síntesis y se asocia a un aumento en la densidad del pelo.",
    img: "/img/comp-lcistina.webp",
    products: ["Beauty"],
  },
  {
    slug: "resveratrol",
    name: "Resveratrol",
    description:
      "Polifenol natural presente en las uvas negras y el vino tinto. Potente antioxidante: colabora en eliminar radicales libres y prevenir el envejecimiento prematuro.",
    img: "/img/comp-resveratrol.webp",
    products: ["Beauty"],
  },
  {
    slug: "vitamina-c",
    name: "Vitamina C",
    description:
      "Antioxidante esencial que participa en la síntesis de colágeno y aporta luminosidad, protegiendo la piel del daño oxidante.",
    img: "/img/comp-vitaminac.webp",
    products: ["45+"],
  },
  {
    slug: "carotenos",
    name: "Carotenos",
    description:
      "El betacaroteno se transforma en vitamina A y actúa como pigmentante natural: favorece un bronceado más rápido e intenso desde adentro.",
    img: "/img/comp-carotenos.webp",
    products: [],
  },
  {
    slug: "licopeno",
    name: "Licopeno",
    description:
      "Antioxidante que potencia el efecto del betacaroteno y ayuda a proteger la piel frente a los rayos UV.",
    img: "/img/comp-licopeno.webp",
    products: [],
  },
];
