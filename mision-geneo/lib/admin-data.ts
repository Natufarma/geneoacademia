import { createAdminClient } from "@/lib/supabase/admin";
import { ADVANCED_MISSIONS, CAMPAIGN_MISSIONS, MISSIONS } from "@/lib/missions";
import { getLevel } from "@/lib/levels";
import { getReward } from "@/lib/rewards";

/**
 * Lecturas del panel de admin (server-only, vía service_role).
 * Las misiones viven en código (lib/missions.ts); la base guarda el progreso
 * por slug. Acá se cruza todo en JS: escala de demo, sin joins pesados.
 */

const CORE_SLUGS = new Set(MISSIONS.map((m) => m.slug));
const ADVANCED_SLUGS = new Set(ADVANCED_MISSIONS.map((m) => m.slug));
const CAMPAIGN_SLUGS = new Set(CAMPAIGN_MISSIONS.map((m) => m.slug));
const CORE_TOTAL = MISSIONS.length;

export type EmployeeSummary = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  pharmacyId: string | null;
  pharmacyName: string;
  points: number;
  levelName: string;
  levelN: number;
  coreDone: number;
  coreTotal: number;
  certified: boolean;
  certifiedAt: string | null;
  campaignsDone: number;
  advancedDone: number;
  /** Días que respondió la pregunta del día (participación). */
  dailyDays: number;
  createdAt: string;
};

type ProgressRow = { user_id: string; mission_slug: string; score: number };
type CertRow = { user_id: string; issued_at: string };
type DailyRow = { user_id: string; day: string; points: number };

type ProfileLite = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  pharmacy_id: string | null;
  created_at: string;
};

function summarize(
  profile: ProfileLite,
  pharmMap: Map<string, string>,
  progress: ProgressRow[],
  daily: DailyRow[],
  certAt: string | null,
): EmployeeSummary {
  const mine = progress.filter((p) => p.user_id === profile.id);
  const myDaily = daily.filter((d) => d.user_id === profile.id);
  // Igual que en la app: puntos = misiones + pregunta del día.
  const points =
    mine.reduce((acc, p) => acc + p.score, 0) + myDaily.reduce((acc, d) => acc + d.points, 0);
  const coreDone = mine.filter((p) => CORE_SLUGS.has(p.mission_slug)).length;
  const advancedDone = mine.filter((p) => ADVANCED_SLUGS.has(p.mission_slug)).length;
  const campaignsDone = mine.filter((p) => CAMPAIGN_SLUGS.has(p.mission_slug)).length;
  const level = getLevel(points);
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    pharmacyId: profile.pharmacy_id,
    pharmacyName: profile.pharmacy_id ? (pharmMap.get(profile.pharmacy_id) ?? "—") : "—",
    points,
    levelName: level.name,
    levelN: level.n,
    coreDone,
    coreTotal: CORE_TOTAL,
    certified: Boolean(certAt),
    certifiedAt: certAt,
    campaignsDone,
    advancedDone,
    dailyDays: myDaily.length,
    createdAt: profile.created_at,
  };
}

async function fetchAll() {
  const sb = createAdminClient();
  const [profilesRes, pharmaciesRes, progressRes, certsRes, dailyRes] = await Promise.all([
    sb.from("profiles").select("id, name, email, phone, pharmacy_id, role, created_at").order("created_at", { ascending: false }),
    sb.from("pharmacies").select("id, name, code, active").order("name"),
    sb.from("mission_progress").select("user_id, mission_slug, score"),
    sb.from("certificates").select("user_id, issued_at"),
    sb.from("daily_answers").select("user_id, day, points"),
  ]);
  const profiles = (profilesRes.data ?? []).filter((p) => p.role !== "admin");
  const pharmacies = pharmaciesRes.data ?? [];
  const progress = (progressRes.data ?? []) as ProgressRow[];
  const certs = (certsRes.data ?? []) as CertRow[];
  const daily = (dailyRes.data ?? []) as DailyRow[];
  const pharmMap = new Map(pharmacies.map((p) => [p.id, p.name]));
  const certMap = new Map<string, string>();
  for (const c of certs) if (!certMap.has(c.user_id)) certMap.set(c.user_id, c.issued_at);
  return { profiles, pharmacies, progress, daily, certMap, pharmMap };
}

export async function getEmployees(): Promise<EmployeeSummary[]> {
  const { profiles, progress, daily, certMap, pharmMap } = await fetchAll();
  return profiles.map((p) => summarize(p, pharmMap, progress, daily, certMap.get(p.id) ?? null));
}

export type DashboardStats = {
  employees: number;
  certified: number;
  certifiedPct: number;
  pharmaciesActive: number;
  recent: EmployeeSummary[];
};

export async function getDashboard(): Promise<DashboardStats> {
  const { profiles, pharmacies, progress, daily, certMap, pharmMap } = await fetchAll();
  const employees = profiles.map((p) =>
    summarize(p, pharmMap, progress, daily, certMap.get(p.id) ?? null),
  );
  const certified = employees.filter((e) => e.certified).length;
  return {
    employees: employees.length,
    certified,
    certifiedPct: employees.length ? Math.round((certified / employees.length) * 100) : 0,
    pharmaciesActive: pharmacies.filter((p) => p.active).length,
    recent: employees.slice(0, 6),
  };
}

export type PharmacySummary = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  employees: number;
  certified: number;
  points: number;
};

export async function getPharmacies(): Promise<PharmacySummary[]> {
  const { profiles, pharmacies, progress, daily, certMap, pharmMap } = await fetchAll();
  const byPharm = new Map<string, EmployeeSummary[]>();
  for (const p of profiles) {
    const e = summarize(p, pharmMap, progress, daily, certMap.get(p.id) ?? null);
    if (!e.pharmacyId) continue;
    const list = byPharm.get(e.pharmacyId) ?? [];
    list.push(e);
    byPharm.set(e.pharmacyId, list);
  }
  return pharmacies
    .map((ph) => {
      const list = byPharm.get(ph.id) ?? [];
      return {
        id: ph.id,
        name: ph.name,
        code: ph.code,
        active: ph.active,
        employees: list.length,
        certified: list.filter((e) => e.certified).length,
        points: list.reduce((acc, e) => acc + e.points, 0),
      };
    })
    .sort((a, b) => b.points - a.points);
}

export async function getPharmacy(id: string): Promise<{
  pharmacy: PharmacySummary;
  employees: EmployeeSummary[];
} | null> {
  const { profiles, pharmacies, progress, daily, certMap, pharmMap } = await fetchAll();
  const ph = pharmacies.find((p) => p.id === id);
  if (!ph) return null;
  const employees = profiles
    .filter((p) => p.pharmacy_id === id)
    .map((p) => summarize(p, pharmMap, progress, daily, certMap.get(p.id) ?? null));
  return {
    pharmacy: {
      id: ph.id,
      name: ph.name,
      code: ph.code,
      active: ph.active,
      employees: employees.length,
      certified: employees.filter((e) => e.certified).length,
      points: employees.reduce((acc, e) => acc + e.points, 0),
    },
    employees,
  };
}

export type MissionRow = {
  slug: string;
  title: string;
  group: "core" | "academia" | "campaña";
  done: boolean;
  score: number | null;
  completedAt: string | null;
  pointsTotal: number;
};

export type RedemptionDetail = {
  rewardName: string;
  points: number;
  status: string;
  createdAt: string;
};

export type EmployeeDetail = EmployeeSummary & {
  missions: MissionRow[];
  redemptions: RedemptionDetail[];
};

export async function getEmployee(id: string): Promise<EmployeeDetail | null> {
  const sb = createAdminClient();
  const [profileRes, pharmaciesRes, progressRes, certsRes, redemptionsRes, dailyRes] =
    await Promise.all([
      sb.from("profiles").select("id, name, email, phone, pharmacy_id, role, created_at").eq("id", id).maybeSingle(),
      sb.from("pharmacies").select("id, name"),
      sb.from("mission_progress").select("user_id, mission_slug, score, completed_at").eq("user_id", id),
      sb.from("certificates").select("user_id, issued_at").eq("user_id", id).limit(1),
      sb.from("redemptions").select("reward_id, points, status, created_at").eq("user_id", id).order("created_at"),
      sb.from("daily_answers").select("user_id, day, points").eq("user_id", id),
    ]);
  const profile = profileRes.data;
  if (!profile) return null;

  const pharmMap = new Map((pharmaciesRes.data ?? []).map((p) => [p.id, p.name]));
  const progress = (progressRes.data ?? []) as (ProgressRow & { completed_at: string })[];
  const daily = (dailyRes.data ?? []) as DailyRow[];
  const certAt = certsRes.data?.[0]?.issued_at ?? null;

  const summary = summarize(profile, pharmMap, progress, daily, certAt);
  const progMap = new Map(progress.map((p) => [p.mission_slug, p]));

  const groups: [typeof MISSIONS, MissionRow["group"]][] = [
    [MISSIONS, "core"],
    [ADVANCED_MISSIONS, "academia"],
    [CAMPAIGN_MISSIONS, "campaña"],
  ];
  const missions: MissionRow[] = groups.flatMap(([list, group]) =>
    list.map((m) => {
      const p = progMap.get(m.slug);
      return {
        slug: m.slug,
        title: m.title,
        group,
        done: Boolean(p),
        score: p?.score ?? null,
        completedAt: p?.completed_at ?? null,
        pointsTotal: m.pointsTotal,
      };
    }),
  );

  const redemptions: RedemptionDetail[] = (redemptionsRes.data ?? []).map((r) => ({
    rewardName: getReward(r.reward_id)?.name ?? r.reward_id,
    points: r.points,
    status: r.status,
    createdAt: r.created_at,
  }));

  return { ...summary, missions, redemptions };
}
