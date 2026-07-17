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
