/**
 * Configuración central del sitio. Un solo lugar para cambiar el dominio,
 * las URLs de compra y las redes sociales cuando el cliente las confirme.
 */

// Dominio final donde se publica la landing (Ferozo / Don Web).
// El código de marca referencia geneo.natufarma.com; ajustar acá si cambia.
export const SITE_URL = "https://geneo.natufarma.com";

export const SITE_NAME = "Geneo";

// Links de navegación — fuente única compartida por Navbar y Footer.
export const NAV_LINKS = [
  { label: "Productos", href: "#rituales" },
  { label: "Rituales", href: "#ritual-finder" },
  { label: "Ciencia", href: "#ciencia" },
  { label: "Resultados", href: "#resultados" },
  { label: "Dónde comprar", href: "#donde-comprar" },
] as const;

export const SITE_TITLE = "Geneo — La belleza empieza adentro";

export const SITE_DESCRIPTION =
  "Suplementos de belleza con colágeno hidrolizado, coenzima Q10, ácido hialurónico y más. Nutrí tu piel desde adentro. Respaldado por Natufarma.";

// Tienda oficial donde se compra el producto.
export const TIENDA_URL = "https://www.tiendanatufarma.com.ar/colageno/";

// Redes sociales oficiales de Natufarma.
export const SOCIAL = {
  instagram: "https://www.instagram.com/natufarma_oficial/",
  facebook: "https://www.facebook.com/NATUFARMA/",
  linkedin: "https://www.linkedin.com/company/natufarmaoficial",
} as const;
