import { PRODUCTS, type Product } from "@/lib/products";
import { ACTIVES } from "@/lib/actives";

/**
 * Buscador de la consulta de mostrador: matchea lo que pide el cliente (en sus
 * palabras) con el producto Geneo indicado. Los datos salen de lib/products.ts
 * (incluidos los `needs` curados) y los activos de lib/actives.ts.
 */

/** minúsculas + sin tildes, para comparar sin que importen acentos ni mayúsculas. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// Palabras vacías: no aportan al match y romperían el AND de términos.
const STOPWORDS = new Set([
  "y", "de", "la", "el", "los", "las", "un", "una", "para", "con", "que",
  "mi", "tu", "su", "algo", "busca", "quiere", "necesita", "cliente", "en", "por",
]);

/** Activos que declara un producto (derivados de las fórmulas publicadas). */
export function productActives(product: Product): string[] {
  return ACTIVES.filter((a) => a.products.includes(product.name)).map((a) => a.name);
}

/**
 * Devuelve los productos que matchean la consulta. Todos los términos
 * significativos deben aparecer (AND) en el "texto buscable" del producto.
 * Query vacía → sin resultados (la UI muestra los chips y una ayuda).
 */
export function searchProducts(query: string): Product[] {
  const q = normalize(query);
  if (!q) return [];

  const terms = q.split(/\s+/).filter((t) => t.length > 0 && !STOPWORDS.has(t));
  if (terms.length === 0) return [];

  return PRODUCTS.filter((product) => {
    const haystack = normalize(
      [
        product.name,
        product.beneficio,
        product.paraQuien,
        product.formula ?? "",
        ...product.needs,
        ...productActives(product),
      ].join(" · "),
    );
    return terms.every((t) => haystack.includes(t));
  });
}

/** Chips de acceso rápido para las necesidades más comunes del mostrador. */
export const QUICK_NEEDS: { label: string; query: string }[] = [
  { label: "Firmeza", query: "firmeza" },
  { label: "Glow", query: "glow" },
  { label: "Pelo y uñas", query: "pelo" },
  { label: "+45 / menopausia", query: "menopausia" },
  { label: "Sol", query: "sol" },
];
