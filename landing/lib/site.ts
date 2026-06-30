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

// Tienda oficial de Natufarma en Mercado Libre.
export const MERCADOLIBRE_URL =
  "https://listado.mercadolibre.com.ar/tienda/natufarma/listado/salud-equipamiento-medico/?tracking_id=e534b9ce-fa7c-4b2f-a7af-7841773a5db2#client=HOME&component_id=menu_corridors&component=menu_corridors&label=Salud+y+Equipamiento+M%C3%A9dico&global_position=1";

// Redes sociales oficiales de Natufarma.
export const SOCIAL = {
  instagram: "https://www.instagram.com/natufarma_oficial/",
  facebook: "https://www.facebook.com/NATUFARMA/",
  linkedin: "https://www.linkedin.com/company/natufarmaoficial",
} as const;
