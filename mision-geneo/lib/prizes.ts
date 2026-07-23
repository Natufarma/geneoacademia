/**
 * Premios por hitos (reemplaza la tienda de canje por puntos, lib/rewards.ts).
 * Un premio se desbloquea COMPLETANDO misiones, no juntando puntos:
 *  - viaje-producto: completar las 6 misiones core → 1 producto a elección.
 *  - academia-kit:   completar las misiones de Academia → kit de merch.
 *
 * Los claims se guardan en la tabla `redemptions` reutilizando `reward_id`:
 * "viaje-producto:<slug>" (con el producto elegido) o "academia-kit".
 */
import { MISSIONS, ADVANCED_MISSIONS, CAMPAIGN_MISSIONS } from "./missions";
import { getProduct } from "./products";

export type PrizeId = "viaje-producto" | "academia-kit";

export type Prize = {
  id: PrizeId;
  name: string;
  detail: string;
  /** true = el empleado elige un producto de la línea al reclamar. */
  requiresChoice: boolean;
};

export const PRIZES: Record<PrizeId, Prize> = {
  "viaje-producto": {
    id: "viaje-producto",
    name: "Producto a elección",
    detail: "Completá el viaje y elegí un producto de la línea Geneo.",
    requiresChoice: true,
  },
  "academia-kit": {
    id: "academia-kit",
    name: "Kit de merchandising Geneo",
    detail: "Completá la Academia: llavero + bolsa Geneo + neceser.",
    requiresChoice: false,
  },
};

/** ¿Completó el viaje principal (las 6 misiones core)? Desbloquea el producto. */
export function viajeComplete(completedSlugs: Set<string>): boolean {
  return MISSIONS.every((m) => completedSlugs.has(m.slug));
}

/** ¿Completó TODA la Academia (Ciencia de los activos + Misión Beauty)? Desbloquea el kit. */
export function academiaComplete(completedSlugs: Set<string>): boolean {
  const academia = [...ADVANCED_MISSIONS, ...CAMPAIGN_MISSIONS];
  return academia.length > 0 && academia.every((m) => completedSlugs.has(m.slug));
}

/** reward_id que se persiste en la base para un claim. */
export function claimId(prizeId: PrizeId, productSlug?: string): string {
  return productSlug ? `${prizeId}:${productSlug}` : prizeId;
}

export type ParsedClaim = { prizeId: PrizeId; productSlug: string | null };

/** Decodifica un reward_id guardado. null si no es un premio conocido. */
export function parseClaim(rewardId: string): ParsedClaim | null {
  const [prizeId, productSlug] = rewardId.split(":");
  if (prizeId !== "viaje-producto" && prizeId !== "academia-kit") return null;
  return { prizeId, productSlug: productSlug ?? null };
}

/** Etiquetas legacy de la vieja tienda de canje por puntos (lib/rewards.ts,
 * eliminado). Filas de `redemptions` viejas en producción siguen teniendo
 * estos reward_id crudos — se mapean acá para no mostrarlos como texto plano. */
const LEGACY_LABELS: Record<string, string> = {
  neceser: "Neceser Geneo",
  taza: "Taza Geneo",
  shaker: "Shaker Geneo",
};

/** Etiqueta legible de un claim (reemplaza getReward().name en las vistas). */
export function claimLabel(rewardId: string): string {
  const parsed = parseClaim(rewardId);
  if (!parsed) return LEGACY_LABELS[rewardId] ?? rewardId;
  if (parsed.prizeId === "viaje-producto") {
    const product = parsed.productSlug ? getProduct(parsed.productSlug) : undefined;
    return product ? `Producto a elección: ${product.name}` : "Producto a elección";
  }
  return "Kit de merchandising Geneo";
}
