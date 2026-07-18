"use client";

import { useSyncExternalStore } from "react";
import { MISSIONS } from "@/lib/missions";
import { getReward } from "@/lib/rewards";

/**
 * Estado del demo: usuario + progreso, persistido en localStorage y expuesto
 * como store externo vía useSyncExternalStore (sin mismatch de hidratación:
 * el snapshot del servidor es "vacío, no listo" y React re-renderiza con el
 * snapshot real del cliente después de montar).
 *
 * Toda la persistencia pasa por load/save de este módulo, así en la fase 2
 * se reemplaza por Supabase sin tocar las pantallas.
 */

export type DemoUser = {
  name: string;
  pharmacyId: string;
};

export type MissionProgress = {
  score: number;
  completedAt: string; // ISO
};

export type Redemption = {
  rewardId: string;
  redeemedAt: string; // ISO
};

type PersistedState = {
  v: 1;
  user: DemoUser | null;
  progress: Record<string, MissionProgress>;
  /** Canjes de premios (ausente en datos guardados viejos: migra a []). */
  redemptions: Redemption[];
};

type Snapshot = {
  /** false hasta hidratar desde localStorage (evita mismatch SSR/cliente). */
  ready: boolean;
  user: DemoUser | null;
  progress: Record<string, MissionProgress>;
  /**
   * Puntos GANADOS (acumulado histórico): define nivel, anillo de progreso y
   * certificado. No baja nunca, ni al canjear premios.
   */
  points: number;
  /** Saldo CANJEABLE: ganados − gastados en canjes. Define qué se puede canjear. */
  balance: number;
  redemptions: Redemption[];
  /** true cuando las 6 misiones están completas. */
  isSpecialist: boolean;
};

const STORAGE_KEY = "mision-geneo:v1";

const EMPTY: PersistedState = { v: 1, user: null, progress: {}, redemptions: [] };

const SERVER_SNAPSHOT: Snapshot = {
  ready: false,
  user: null,
  progress: {},
  points: 0,
  balance: 0,
  redemptions: [],
  isSpecialist: false,
};

function load(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed?.v !== 1) return EMPTY;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function save(state: PersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage lleno o bloqueado: el demo sigue funcionando en memoria.
  }
}

function spentPoints(redemptions: Redemption[]): number {
  return redemptions.reduce((acc, r) => acc + (getReward(r.rewardId)?.points ?? 0), 0);
}

function computeSnapshot(state: PersistedState): Snapshot {
  const points = Object.values(state.progress).reduce((acc, p) => acc + p.score, 0);
  const balance = Math.max(0, points - spentPoints(state.redemptions));
  const isSpecialist = MISSIONS.every((m) => Boolean(state.progress[m.slug]));
  return {
    ready: true,
    user: state.user,
    progress: state.progress,
    points,
    balance,
    redemptions: state.redemptions,
    isSpecialist,
  };
}

let persisted: PersistedState = EMPTY;
let snapshot: Snapshot = SERVER_SNAPSHOT;

// Hidratación única al cargar el módulo en el navegador (antes del primer render).
if (typeof window !== "undefined") {
  persisted = load();
  snapshot = computeSnapshot(persisted);
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function mutate(updater: (prev: PersistedState) => PersistedState) {
  persisted = updater(persisted);
  save(persisted);
  snapshot = computeSnapshot(persisted);
  listeners.forEach((l) => l());
}

export function register(user: DemoUser) {
  mutate((prev) => ({ ...prev, user }));
}

export function completeMission(slug: string, score: number) {
  mutate((prev) => {
    // Idempotente: una misión ya completada no vuelve a sumar puntos.
    if (prev.progress[slug]) return prev;
    return {
      ...prev,
      progress: {
        ...prev.progress,
        [slug]: { score, completedAt: new Date().toISOString() },
      },
    };
  });
}

/**
 * Canjea un premio si el saldo alcanza y no fue canjeado antes.
 * Devuelve true si el canje se concretó.
 */
export function redeem(rewardId: string): boolean {
  const reward = getReward(rewardId);
  if (!reward) return false;
  let ok = false;
  mutate((prev) => {
    if (prev.redemptions.some((r) => r.rewardId === rewardId)) return prev;
    const earned = Object.values(prev.progress).reduce((acc, p) => acc + p.score, 0);
    if (earned - spentPoints(prev.redemptions) < reward.points) return prev;
    ok = true;
    return {
      ...prev,
      redemptions: [...prev.redemptions, { rewardId, redeemedAt: new Date().toISOString() }],
    };
  });
  return ok;
}

/**
 * Cierra la sesión: vuelve al registro pero CONSERVA el progreso y los canjes
 * guardados (como un logout real: si volvés a entrar, seguís donde estabas).
 * Para borrar todo, usar reset().
 */
export function logout() {
  mutate((prev) => ({ ...prev, user: null }));
}

/** Reinicia el demo completo: usuario, progreso y canjes. */
export function reset() {
  mutate(() => EMPTY);
}

export type AppState = Snapshot & {
  register: typeof register;
  completeMission: typeof completeMission;
  redeem: typeof redeem;
  logout: typeof logout;
  reset: typeof reset;
};

export function useApp(): AppState {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...snap, register, completeMission, redeem, logout, reset };
}
