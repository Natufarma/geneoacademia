"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { MISSIONS } from "@/lib/missions";
import { getReward } from "@/lib/rewards";
import { DAILY_POINTS, computeStreak, dayKey, questionForToday } from "@/lib/daily";

/**
 * Estado de la app respaldado en Supabase.
 *
 * Auth: email + contraseña (decisión del cliente). El registro guarda nombre,
 * email, celular y farmacia en `profiles`; si Supabase exige confirmar el
 * email antes de dar sesión, los datos del alta viajan en el user_metadata y
 * el perfil se crea en el primer login.
 *
 * La persistencia se expone vía useSyncExternalStore: el snapshot del servidor
 * es "no listo" y el cliente hidrata con los datos reales después de montar.
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

export type DailyEntry = {
  questionId: string;
  correct: boolean;
  points: number;
};

export type RegisterInput = {
  name: string;
  email: string;
  phone: string | null;
  pharmacyId: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/** "ok" = sesión creada; "confirm" = falta confirmar el email antes de entrar. */
export type RegisterResult = "ok" | "confirm";

type Snapshot = {
  /** false hasta cargar la sesión + datos desde Supabase. */
  ready: boolean;
  user: DemoUser | null;
  /** Nombre de la farmacia del usuario (resuelto desde la base). */
  pharmacyName: string | null;
  /** Farmacias disponibles (para el selector del registro y el ranking). */
  pharmacies: PharmacyOption[];
  progress: Record<string, MissionProgress>;
  /** Puntos GANADOS (misiones + pregunta del día): nivel, anillo, certificado. */
  points: number;
  /** Saldo CANJEABLE: ganados − gastados. */
  balance: number;
  redemptions: Redemption[];
  /** true cuando las 6 misiones core están completas. */
  isSpecialist: boolean;
  /** Respuestas de la pregunta del día, por día local YYYY-MM-DD. */
  daily: Record<string, DailyEntry>;
  /** Días consecutivos participando (terminando hoy o ayer). */
  streak: number;
  /** true si ya respondió la pregunta de hoy. */
  answeredToday: boolean;
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
  daily: {},
  streak: 0,
  answeredToday: false,
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
  daily: {},
  streak: 0,
  answeredToday: false,
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

function dailyPoints(daily: Record<string, DailyEntry>): number {
  return Object.values(daily).reduce((acc, d) => acc + d.points, 0);
}

/** Traduce errores comunes de Supabase Auth a mensajes en castellano. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Ese email ya tiene una cuenta. Entrá con tu contraseña desde «Ya tengo cuenta».";
  }
  if (m.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos. Revisalos e intentá de nuevo.";
  }
  if (m.includes("password should be at least")) {
    return "La contraseña es demasiado corta: usá al menos 8 caracteres.";
  }
  if (m.includes("is invalid")) {
    return "Ese email no parece válido. Revisalo e intentá de nuevo.";
  }
  if (m.includes("email not confirmed")) {
    return "Tu cuenta todavía no está confirmada: revisá tu email y tocá el enlace de confirmación.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Demasiados intentos seguidos. Esperá un momento y probá de nuevo.";
  }
  return "No pudimos completar la operación. Revisá tu conexión e intentá de nuevo.";
}

/** Arma el snapshot logueado desde las filas crudas de la base. */
function buildSnapshot(
  profile: { name: string; pharmacy_id: string | null },
  prog: { mission_slug: string; score: number; completed_at: string }[],
  reds: { reward_id: string; created_at: string }[],
  dailyRows: { day: string; question_id: string; correct: boolean; points: number }[],
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
  const daily: Record<string, DailyEntry> = {};
  for (const d of dailyRows) {
    daily[d.day] = { questionId: d.question_id, correct: d.correct, points: d.points };
  }
  const points =
    Object.values(progress).reduce((acc, p) => acc + p.score, 0) + dailyPoints(daily);
  const balance = Math.max(0, points - spentPoints(redemptions));
  const isSpecialist = MISSIONS.every((m) => Boolean(progress[m.slug]));
  const pharmacyName =
    pharmacies.find((p) => p.id === profile.pharmacy_id)?.name ?? null;
  const answeredDays = new Set(Object.keys(daily));

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
    daily,
    streak: computeStreak(answeredDays),
    answeredToday: answeredDays.has(dayKey()),
  };
}

/** Recalcula los derivados tras un cambio local optimista. */
function reproject(
  progress: Record<string, MissionProgress>,
  redemptions: Redemption[],
  daily: Record<string, DailyEntry>,
) {
  const points =
    Object.values(progress).reduce((acc, p) => acc + p.score, 0) + dailyPoints(daily);
  const balance = Math.max(0, points - spentPoints(redemptions));
  const isSpecialist = MISSIONS.every((m) => Boolean(progress[m.slug]));
  const answeredDays = new Set(Object.keys(daily));
  setSnapshot({
    ...snapshot,
    progress,
    redemptions,
    daily,
    points,
    balance,
    isSpecialist,
    streak: computeStreak(answeredDays),
    answeredToday: answeredDays.has(dayKey()),
  });
  return { points, balance, isSpecialist };
}

async function loadPharmacies(): Promise<PharmacyOption[]> {
  // Lectura pública (el selector del registro se ve antes de tener sesión).
  const { data } = await sb().from("pharmacies").select("id, name").order("name");
  return data ?? [];
}

/**
 * Garantiza que exista el perfil del usuario logueado. Si el alta se hizo con
 * confirmación de email (sin sesión), los datos vienen del user_metadata.
 */
async function ensureProfile(userId: string): Promise<void> {
  const client = sb();
  const { data: existing } = await client
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (existing) return;

  const {
    data: { user },
  } = await client.auth.getUser();
  const meta = (user?.user_metadata ?? {}) as {
    name?: string;
    phone?: string;
    pharmacy_id?: string;
  };
  await client.from("profiles").upsert({
    id: userId,
    name: meta.name ?? user?.email?.split("@")[0] ?? "Sin nombre",
    pharmacy_id: meta.pharmacy_id ?? null,
    email: user?.email ?? null,
    phone: meta.phone ?? null,
  });
}

async function loadUser(userId: string, pharmacies: PharmacyOption[]): Promise<Snapshot> {
  const client = sb();
  const [{ data: profile }, { data: prog }, { data: reds }, { data: daily }] =
    await Promise.all([
      client.from("profiles").select("name, pharmacy_id").eq("id", userId).maybeSingle(),
      client
        .from("mission_progress")
        .select("mission_slug, score, completed_at")
        .eq("user_id", userId),
      client.from("redemptions").select("reward_id, created_at").eq("user_id", userId),
      client
        .from("daily_answers")
        .select("day, question_id, correct, points")
        .eq("user_id", userId),
    ]);
  if (!profile) return EMPTY_READY(pharmacies);
  return buildSnapshot(profile, prog ?? [], reds ?? [], daily ?? [], pharmacies);
}

// ─── Boot ───────────────────────────────────────────────────────────────────

let initStarted = false;

async function init() {
  try {
    const client = sb();
    const [
      {
        data: { session },
      },
      pharmacies,
    ] = await Promise.all([client.auth.getSession(), loadPharmacies()]);
    if (!session) {
      setSnapshot(EMPTY_READY(pharmacies));
      return;
    }
    authUserId = session.user.id;
    await ensureProfile(authUserId);
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

/**
 * Alta con email + contraseña. Los datos del perfil viajan también en el
 * user_metadata: si Supabase pide confirmar el email (sin sesión inmediata),
 * el perfil se crea en el primer login. Lanza Error con mensaje amigable.
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const client = sb();
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        phone: input.phone,
        pharmacy_id: input.pharmacyId,
      },
    },
  });
  if (error) throw new Error(friendlyAuthError(error.message));

  if (!data.session) return "confirm"; // confirmación de email activada

  authUserId = data.session.user.id;
  await client.from("profiles").upsert({
    id: authUserId,
    name: input.name,
    pharmacy_id: input.pharmacyId,
    email: input.email,
    phone: input.phone,
  });
  const pharmacies = snapshot.pharmacies.length ? snapshot.pharmacies : await loadPharmacies();
  setSnapshot(await loadUser(authUserId, pharmacies));
  return "ok";
}

/** Ingreso con email + contraseña. Lanza Error con mensaje amigable. */
export async function login(input: LoginInput): Promise<void> {
  const client = sb();
  const { data, error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  authUserId = data.session.user.id;
  await ensureProfile(authUserId);
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
  const { isSpecialist } = reproject(progress, snapshot.redemptions, snapshot.daily);

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

/**
 * Responde la pregunta del día (un intento por día). Participar mantiene la
 * racha; acertar suma DAILY_POINTS. Devuelve el resultado para la UI, o null
 * si ya respondió hoy.
 */
export function answerDaily(optionIndex: number): { correct: boolean; points: number } | null {
  if (!authUserId || snapshot.answeredToday) return null;
  const question = questionForToday();
  const correct = optionIndex === question.correctIndex;
  const points = correct ? DAILY_POINTS : 0;
  const today = dayKey();

  const daily = {
    ...snapshot.daily,
    [today]: { questionId: question.id, correct, points },
  };
  reproject(snapshot.progress, snapshot.redemptions, daily);

  // unique(user_id, day) hace inocuo el doble submit.
  void sb().from("daily_answers").upsert(
    { user_id: authUserId, day: today, question_id: question.id, correct, points },
    { onConflict: "user_id,day", ignoreDuplicates: true },
  );
  return { correct, points };
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
  reproject(snapshot.progress, redemptions, snapshot.daily);
  void sb()
    .from("redemptions")
    .insert({ user_id: authUserId, reward_id: rewardId, points: reward.points });
  return true;
}

/** Cierra la sesión. Con email+contraseña se puede volver a entrar cuando quiera. */
export async function logout() {
  await sb().auth.signOut();
  authUserId = null;
  setSnapshot(EMPTY_READY(snapshot.pharmacies));
}

/** Borra los datos del usuario actual y vuelve al inicio (helper de demo). */
export async function reset() {
  const client = sb();
  if (authUserId) {
    await Promise.all([
      client.from("mission_progress").delete().eq("user_id", authUserId),
      client.from("redemptions").delete().eq("user_id", authUserId),
      client.from("certificates").delete().eq("user_id", authUserId),
      client.from("daily_answers").delete().eq("user_id", authUserId),
    ]);
    await client.from("profiles").delete().eq("id", authUserId);
  }
  await client.auth.signOut();
  authUserId = null;
  setSnapshot(EMPTY_READY(snapshot.pharmacies));
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
  login: typeof login;
  completeMission: typeof completeMission;
  answerDaily: typeof answerDaily;
  redeem: typeof redeem;
  logout: typeof logout;
  reset: typeof reset;
};

export function useApp(): AppState {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...snap, register, login, completeMission, answerDaily, redeem, logout, reset };
}
