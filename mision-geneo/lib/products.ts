/**
 * Los 4 productos de la línea Geneo. Datos tomados EXCLUSIVAMENTE de lo
 * publicado en la web:
 *  - fórmula y beneficio: landing/components/Rituales.tsx
 *  - presentación (formato) y tienda: URLs de tiendanatufarma.com.ar
 *    (landing/components/EncontraRitual.tsx)
 *
 * Los activos de cada producto NO se listan acá: se derivan de lib/actives.ts
 * (ACTIVES[].products) para tener una sola fuente de verdad. Solar no publica
 * su composición, por eso queda como próximo lanzamiento sin activos ni fórmula.
 */

export type Product = {
  slug: string;
  /** Debe coincidir con los valores de ACTIVES[].products para derivar activos. */
  name: string;
  beneficio: string;
  /** A quién recomendárselo (reformulación del beneficio publicado). */
  paraQuien: string;
  /** Fórmula publicada; null en Solar (sin composición publicada). */
  formula: string | null;
  /** Presentación/formato publicado en la tienda; null si no aplica. */
  presentacion: string | null;
  img: string;
  /** Clase de color de marca (Solar va en naranja). */
  accent: string;
  available: boolean;
  tiendaUrl: string | null;
};

export const PRODUCTS: Product[] = [
  {
    slug: "piel-saludable",
    name: "Piel Saludable",
    beneficio: "Glow, hidratación y firmeza.",
    paraQuien: "Para quien busca glow, hidratación y firmeza en la piel.",
    formula: "Colágeno + Q10",
    presentacion: "Polvo · 250 g",
    img: "/img/prod-piel.webp",
    accent: "text-geneo",
    available: true,
    tiendaUrl: "https://www.tiendanatufarma.com.ar/productos/geneo-piel-saludable-x-250-gramos/",
  },
  {
    slug: "beauty",
    name: "Beauty",
    beneficio: "Piel firme, pelo fuerte y uñas saludables.",
    paraQuien: "Para quien quiere, además de la piel, pelo más fuerte y uñas saludables.",
    formula: "L-Cistina + Hialurónico + Resveratrol + Q10 + vitaminas y minerales",
    presentacion: "30 comprimidos",
    img: "/img/prod-beauty.webp",
    accent: "text-geneo",
    available: true,
    tiendaUrl: "https://www.tiendanatufarma.com.ar/productos/geneo-beauty-x-30-comprimidos/",
  },
  {
    slug: "45",
    name: "45+",
    beneficio: "Elasticidad y renovación.",
    paraQuien: "Para acompañar la piel desde los 45, cuando busca elasticidad y renovación.",
    formula: "Isoflavonas de soja (genisteína) + Hialurónico + Vitamina C",
    presentacion: "30 comprimidos",
    img: "/img/prod-45.webp",
    accent: "text-geneo",
    available: true,
    tiendaUrl: "https://www.tiendanatufarma.com.ar/productos/geneo-45-x-30-comprimidos/",
  },
  {
    slug: "solar",
    name: "Solar",
    beneficio: "Bronceado saludable desde adentro.",
    paraQuien: "Para preparar la piel para el sol y broncear desde adentro.",
    formula: null,
    presentacion: null,
    img: "/img/prod-solar.webp",
    accent: "text-solar",
    available: false,
    tiendaUrl: null,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
