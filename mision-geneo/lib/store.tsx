"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { MISSIONS } from "@/lib/missions";
import { getReward } from "@/lib/rewards";

/**
 * Estado de la app respaldado en Supabase (fase 2).
 *
 * Auth: sesión ANÓNIMA (cada dispositivo = un usuario real en la base, sin
 * fricción). El perfil (nombre + farmacia) se crea al registrarse. El progreso,
 * los canjes y el certificado se guardan en la base central para que el panel
 * de administrador los pueda ver.
 *
 * La API pública `useApp()` es idéntica a la del demo con localStorage, así las
 * pantallas no cambian de lógica. La persistencia se expone vía
 * useSyncExternalStore: el snapshot del servidor es "no listo" y el cliente
 * hidrata con los datos reales de Supabase después de montar.
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

export type PharmacyOption = {
  id: string;
  name: string;
};

type Snapshot = {
  /** false hasta cargar la sesión + datos desde Supabase. */
  ready: boolean;
  user: DemoUser | null;
  /** Nombre de la farmacia del usuario (resuelto desde la base). */
  pharmacyName: string | null;
  /** Farmacias disponibles (para el selector del registro y el ranking). */
  pharmacies: PharmacyOption[];
  progress: Record<string, MissionProgress>;
  /** Puntos GANADOS (histórico): nivel, anillo, certificado. No baja al canjear. */
  points: number;
  /** Saldo CANJEABLE: ganados − gastados. */
  balance: number;
  redemptions: Redemption[];
  /** true cuando las 6 misiones core están completas. */
  isSpecialist: boolean;
};

const EMPTY_READY = (pharmacies: PharmacyOption[]): Snapshot => ({
  ready: true,
  user: null,
  pharmacyName: null,
  pharmacies,
  progress: {},
  points: 0,
  balance: 0,
  redemptions: [],
  isSpecialist: false,
});

const SERVER_SNAPSHOT: Snapshot = {
  ready: false,
  user: null,
  pharmacyName: null,
  pharmacies: [],
  progress: {},
  points: 0,
  balance: 0,
  redemptions: [],
  isSpecialist: false,
};

// ─── Estado del módulo ──────────────────────────────────────────────────────

let snapshot: Snapshot = SERVER_SNAPSHOT;
let authUserId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setSnapshot(next: Snapshot) {
  snapshot = next;
  emit();
}

// Cliente Supabase del navegador, instanciado bajo demanda (nunca en build).
let supabase: ReturnType<typeof createClient> | null = null;
function sb() {
  if (!supabase) supabase = createClient();
  return supabase;
}

function spentPoints(redemptions: Redemption[]): number {
  return redemptions.reduce((acc, r) => acc + (getReward(r.rewardId)?.points ?? 0), 0);
}

/** Arma el snapshot logueado desde las filas crudas de la base. */
function buildSnapshot(
  profile: { name: string; pharmacy_id: string | null },
  prog: { mission_slug: string; score: number; completed_at: string }[],
  reds: { reward_id: string; created_at: string }[],
  pharmacies: PharmacyOption[],
): Snapshot {
  const progress: Record<string, MissionProgress> = {};
  for (const r of prog) {
    progress[r.mission_slug] = { score: r.score, completedAt: r.completed_at };
  }
  const redemptions: Redemption[] = reds.map((r) => ({
    rewardId: r.reward_id,
    redeemedAt: r.created_at,
  }));
  const points = Object.values(progress).reduce((acc, p) => acc + p.score, 0);
  const balance = Math.max(0, points - spentPoints(redemptions));
  const isSpecialist = MISSIONS.every((m) => Boolean(progress[m.slug]));
  const pharmacyName =
    pharmacies.find((p) => p.id === profile.pharmacy_id)?.name ?? null;

  return {
    ready: true,
    user: { name: profile.name, pharmacyId: profile.pharmacy_id ?? "" },
    pharmacyName,
    pharmacies,
    progress,
    points,
    balance,
    redemptions,
    isSpecialist,
  };
}

/** Recalcula puntos/saldo/especialista tras un cambio local optimista. */
function reproject(progress: Record<string, MissionProgress>, redemptions: Redemption[]) {
  const points = Object.values(progress).reduce((acc, p) => acc + p.score, 0);
  const balance = Math.max(0, points - spentPoints(redemptions));
  const isSpecialist = MISSIONS.every((m) => Boolean(progress[m.slug]));
  setSnapshot({ ...snapshot, progress, redemptions, points, balance, isSpecialist });
  return { points, balance, isSpecialist };
}

async function loadPharmacies(): Promise<PharmacyOption[]> {
  const { data } = await sb().from("pharmacies").select("id, name").order("name");
  return data ?? [];
}

async function loadUser(userId: string, pharmacies: PharmacyOption[]): Promise<Snapshot> {
  const client = sb();
  const [{ data: profile }, { data: prog }, { data: reds }] = await Promise.all([
    client.from("profiles").select("name, pharmacy_id").eq("id", userId).maybeSingle(),
    client.from("mission_progress").select("mission_slug, score, completed_at").eq("user_id", userId),
    client.from("redemptions").select("reward_id, created_at").eq("user_id", userId),
  ]);
  if (!profile) return EMPTY_READY(pharmacies);
  return buildSnapshot(profile, prog ?? [], reds ?? [], pharmacies);
}

// ─── Boot ───────────────────────────────────────────────────────────────────

let initStarted = false;

async function init() {
  try {
    const client = sb();
    // Aseguramos una sesión anónima para poder listar farmacias (RLS exige auth).
    let {
      data: { session },
    } = await client.auth.getSession();
    if (!session) {
      const { data } = await client.auth.signInAnonymously();
      session = data.session;
    }
    const pharmacies = await loadPharmacies();
    if (!session) {
      setSnapshot(EMPTY_READY(pharmacies));
      return;
    }
    authUserId = session.user.id;
    setSnapshot(await loadUser(authUserId, pharmacies));
  } catch {
    // Ante cualquier fallo (red, config), abrimos en registro sin colgar la app.
    setSnapshot(EMPTY_READY(snapshot.pharmacies));
  }
}

function ensureInit() {
  if (initStarted || typeof window === "undefined") return;
  initStarted = true;
  void init();
}

// ─── Acciones ────────────────────────────────────────────────────────────────

export async function register(user: DemoUser) {
  const client = sb();
  let {
    data: { session },
  } = await client.auth.getSession();
  if (!session) {
    const { data } = await client.auth.signInAnonymously();
    session = data.session;
  }
  if (!session) return;
  authUserId = session.user.id;
  await client.from("profiles").upsert({
    id: authUserId,
    name: user.name,
    pharmacy_id: user.pharmacyId,
  });
  const pharmacies = snapshot.pharmacies.length ? snapshot.pharmacies : await loadPharmacies();
  setSnapshot(await loadUser(authUserId, pharmacies));
}

export function completeMission(slug: string, score: number) {
  if (!authUserId || snapshot.progress[slug]) return; // idempotente
  // Actualización local optimista (la UI no espera la red).
  const progress = {
    ...snapshot.progress,
    [slug]: { score, completedAt: new Date().toISOString() },
  };
  const { isSpecialist } = reproject(progress, snapshot.redemptions);

  // Persistencia (fire-and-forget; la tabla es idempotente por unique).
  const client = sb();
  void client
    .from("mission_progress")
    .upsert(
      { user_id: authUserId, mission_slug: slug, score },
      { onConflict: "user_id,mission_slug", ignoreDuplicates: true },
    );
  if (isSpecialist) {
    void client
      .from("certificates")
      .upsert(
        { user_id: authUserId, type: "especialista" },
        { onConflict: "user_id,type", ignoreDuplicates: true },
      );
  }
}

export function redeem(rewardId: string): boolean {
  const reward = getReward(rewardId);
  if (!reward || !authUserId) return false;
  if (snapshot.redemptions.some((r) => r.rewardId === rewardId)) return false;
  if (snapshot.balance < reward.points) return false;

  const redemptions = [
    ...snapshot.redemptions,
    { rewardId, redeemedAt: new Date().toISOString() },
  ];
  reproject(snapshot.progress, redemptions);
  void sb()
    .from("redemptions")
    .insert({ user_id: authUserId, reward_id: rewardId, points: reward.points });
  return true;
}

/**
 * Cierra la sesión en este dispositivo. Con auth anónima NO se puede volver a
 * la misma sesión: el progreso queda guardado en la base (lo ve el admin) pero
 * esa persona no vuelve a entrar como el mismo usuario. Vuelve al registro.
 */
export async function logout() {
  await sb().auth.signOut();
  authUserId = null;
  initStarted = false;
  setSnapshot(EMPTY_READY(snapshot.pharmacies));
  ensureInit(); // nueva sesión anónima para el próximo registro
}

/** Borra los datos del usuario actual y vuelve al registro (helper de demo). */
export async function reset() {
  const client = sb();
  if (authUserId) {
    await Promise.all([
      client.from("mission_progress").delete().eq("user_id", authUserId),
      client.from("redemptions").delete().eq("user_id", authUserId),
      client.from("certificates").delete().eq("user_id", authUserId),
    ]);
    await client.from("profiles").delete().eq("id", authUserId);
  }
  await client.auth.signOut();
  authUserId = null;
  initStarted = false;
  setSnapshot(EMPTY_READY(snapshot.pharmacies));
  ensureInit();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function subscribe(listener: () => void): () => void {
  ensureInit();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
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
