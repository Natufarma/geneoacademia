/**
 * Farmacias mock del demo. En la fase 2 esta lista viene de la base
 * (tabla `pharmacies`) y cada farmacia entra por su QR con `code` propio.
 */

export type Pharmacy = {
  id: string;
  name: string;
  /** Puntos mock del ranking mensual (en producción: compras sell-in + misiones del equipo). */
  rankingPoints: number;
};

export const PHARMACIES: Pharmacy[] = [
  { id: "norte", name: "Farmacia Norte", rankingPoints: 12850 },
  { id: "centro", name: "Farmacia Centro", rankingPoints: 10210 },
  { id: "salud", name: "Farmacia Salud", rankingPoints: 8760 },
  { id: "vida", name: "Farmacia Vida", rankingPoints: 7600 },
  { id: "bienestar", name: "Farmacia Bienestar", rankingPoints: 6200 },
];

export function getPharmacy(id: string): Pharmacy | undefined {
  return PHARMACIES.find((p) => p.id === id);
}
