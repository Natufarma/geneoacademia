/**
 * Catálogo de premios canjeables del demo (mockup pantalla 7 de Lakhu).
 * En la fase 2 esta lista viene de la base (tabla `rewards`, con stock).
 * Data pura: los íconos se resuelven en la UI por `id`.
 */

export type Reward = {
  id: string;
  name: string;
  points: number;
};

export const REWARDS: Reward[] = [
  { id: "neceser", name: "Neceser Geneo", points: 600 },
  { id: "taza", name: "Taza Geneo", points: 400 },
  { id: "shaker", name: "Shaker Geneo", points: 300 },
];

export function getReward(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id);
}

/**
 * Puntos ya gastados dado un listado de reward_id canjeados (uno por fila de
 * `redemptions`). Usado tanto en el cliente (UI optimista) como en el
 * servidor (app/api/redemptions) para recalcular el saldo canjeable — misma
 * fórmula en los dos lados, ninguna duplicada.
 */
export function redemptionsSpent(rewardIds: string[]): number {
  return rewardIds.reduce((acc, id) => acc + (getReward(id)?.points ?? 0), 0);
}
