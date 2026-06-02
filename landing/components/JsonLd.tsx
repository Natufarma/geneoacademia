import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  TIENDA_URL,
  SOCIAL,
} from "@/lib/site";

/**
 * Structured data (schema.org) para rich results en Google.
 * Organization + WebSite + Product. Sin bloque `offers` con precio: Google
 * marca "ficha de comerciante no válida" si falta el `price` (lección
 * aprendida en Vitaneral). La compra real vive en la tienda externa.
 */
export default function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Geneo by Natufarma",
        url: SITE_URL,
        logo: `${SITE_URL}/img/isotipo.png`,
        description: SITE_DESCRIPTION,
        sameAs: [SOCIAL.instagram, SOCIAL.facebook, SOCIAL.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "es-AR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Product",
        name: "Geneo — Suplementos de belleza",
        brand: { "@type": "Brand", name: "Geneo" },
        description:
          "Línea de suplementos de belleza con colágeno hidrolizado, coenzima Q10, ácido hialurónico, resveratrol y más. Nutrición de la piel desde adentro.",
        image: `${SITE_URL}/img/prod-colageno.webp`,
        url: TIENDA_URL,
        category: "Suplementos de belleza",
        manufacturer: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // El contenido es estático y propio (no input de usuario): seguro.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
