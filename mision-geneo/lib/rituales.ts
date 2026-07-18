/**
 * Rituales combinados (pantalla 10 del mockup "Nuestros rituales"). Cada combo
 * sale de landing/components/EncontraRitual.tsx (rituales reales con sus
 * productos y packs publicados en la tienda). Los productos se referencian por
 * slug para reutilizar sus fotos desde lib/products.ts.
 *
 * "Verano" usa Solar, que es próximo lanzamiento: por eso queda sin compra.
 */

export type Ritual = {
  slug: string;
  nombre: string;
  /** Slugs de PRODUCTS que combina. */
  productSlugs: string[];
  /** Para qué necesidad (reformulación de lo publicado). */
  para: string;
  available: boolean;
  /** Pack combinado en la tienda; null si incluye un producto no disponible. */
  tiendaUrl: string | null;
};

export const RITUALES: Ritual[] = [
  {
    slug: "glow",
    nombre: "Ritual Glow",
    productSlugs: ["piel-saludable", "beauty"],
    para: "Luminosidad integral: piel, pelo y uñas.",
    available: true,
    tiendaUrl:
      "https://www.tiendanatufarma.com.ar/productos/geneo-piel-saludable-x-250-gramos-geneo-beauty-x-30-comprimidos-pack-promocion-x-2-unidades/",
  },
  {
    slug: "renovacion-45",
    nombre: "Ritual 45+",
    productSlugs: ["45", "piel-saludable"],
    para: "Firmeza y elasticidad para acompañar la piel desde los 45.",
    available: true,
    tiendaUrl:
      "https://www.tiendanatufarma.com.ar/productos/geneo-piel-saludable-x-250-gramos-geneo-45-x-30-comprimidos-pack-promocion-x-2-unidades/",
  },
  {
    slug: "verano",
    nombre: "Ritual Verano",
    productSlugs: ["solar", "piel-saludable"],
    para: "Preparar la piel para el sol y broncear desde adentro.",
    available: false,
    tiendaUrl: null,
  },
];
