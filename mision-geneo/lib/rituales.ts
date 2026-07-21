/**
 * Rituales combinados (pantalla 10 del mockup "Nuestros rituales"). Cada combo
 * sale de landing/components/EncontraRitual.tsx (rituales reales con sus
 * productos). Los productos se referencian por slug para reutilizar sus fotos
 * y sus fichas (lib/products.ts) desde la propia app.
 *
 * Esta app es material de consulta para el mostrador: cada ritual enlaza a
 * las fichas internas de sus productos, no a la tienda online.
 *
 * "Verano" usa Solar, que es próximo lanzamiento: por eso queda sin fichas
 * disponibles para recomendar todavía.
 */

export type Ritual = {
  slug: string;
  nombre: string;
  /** Slugs de PRODUCTS que combina. */
  productSlugs: string[];
  /** Para qué necesidad (reformulación de lo publicado). */
  para: string;
  available: boolean;
};

export const RITUALES: Ritual[] = [
  {
    slug: "glow",
    nombre: "Ritual Glow",
    productSlugs: ["piel-saludable", "beauty"],
    para: "Luminosidad integral: piel, pelo y uñas.",
    available: true,
  },
  {
    slug: "renovacion-45",
    nombre: "Ritual 45+",
    productSlugs: ["45", "piel-saludable"],
    para: "Firmeza y elasticidad para acompañar la piel desde los 45.",
    available: true,
  },
  {
    slug: "verano",
    nombre: "Ritual Verano",
    productSlugs: ["solar", "piel-saludable"],
    para: "Preparar la piel para el sol y broncear desde adentro.",
    available: false,
  },
];
