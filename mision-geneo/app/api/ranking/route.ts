import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  displayName,
  getPeriodBounds,
  pharmacyScore,
  pointsInPeriod,
  rankEmployees,
  rankPharmacies,
} from "@/lib/ranking";

/**
 * Ranking nacional (empleados + farmacias) del período en curso.
 *
 * Exige sesión de Supabase (la RLS de la app no permite leer el progreso de
 * OTROS usuarios desde el navegador, así que el agregado se resuelve acá con
 * service_role). La respuesta es 100% agregada/anonimizada: nunca viaja
 * email, teléfono ni el id de otro usuario — solo nombre mostrable, puntos y
 * posición.
 */

export const dynamic = "force-dynamic";

type ProfileRow = { id: string; name: string; pharmacy_id: string | null; role: string };
type PharmacyRow = { id: string; name: string; city: string | null };
type ProgressRow = { user_id: string; score: number; completed_at: string };
type DailyRow = { user_id: string; day: string; points: number };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const period = getPeriodBounds();

  const [profilesRes, pharmaciesRes, progressRes, dailyRes] = await Promise.all([
    admin.from("profiles").select("id, name, pharmacy_id, role"),
    admin.from("pharmacies").select("id, name, city").eq("active", true),
    admin.from("mission_progress").select("user_id, score, completed_at"),
    admin.from("daily_answers").select("user_id, day, points"),
  ]);

  const profiles = ((profilesRes.data ?? []) as ProfileRow[]).filter((p) => p.role !== "admin");
  const pharmacies = (pharmaciesRes.data ?? []) as PharmacyRow[];
  const progress = (progressRes.data ?? []) as ProgressRow[];
  const daily = (dailyRes.data ?? []) as DailyRow[];

  // Puntos del período por usuario, resuelto una sola vez y reutilizado tanto
  // para el ranking de empleados como para el score de cada farmacia.
  const pointsByUser = new Map<string, number>();
  for (const p of profiles) {
    const mine = progress.filter((r) => r.user_id === p.id);
    const myDaily = daily.filter((r) => r.user_id === p.id);
    pointsByUser.set(p.id, pointsInPeriod(mine, myDaily, period));
  }

  // Empleados: solo quienes sumaron al menos 1 punto en el período (activos)
  // entran al ranking nacional.
  const activeEmployees = profiles
    .filter((p) => (pointsByUser.get(p.id) ?? 0) > 0)
    .map((p) => ({ id: p.id, name: displayName(p.name), points: pointsByUser.get(p.id) ?? 0 }));

  const employees = rankEmployees(activeEmployees).map((e) => ({
    position: e.position,
    displayName: e.name,
    points: e.points,
    isCurrentUser: e.id === user.id,
  }));

  // Farmacias: top-3 activos del período. 0 activos → no entra al ranking.
  const pharmacyCandidates = pharmacies
    .map((ph) => {
      const employeePoints = profiles
        .filter((p) => p.pharmacy_id === ph.id)
        .map((p) => pointsByUser.get(p.id) ?? 0);
      const { score, activeCount } = pharmacyScore(employeePoints);
      return { name: ph.name, city: ph.city, score, activeCount };
    })
    .filter((p) => p.activeCount > 0);

  const pharmacyRanking = rankPharmacies(pharmacyCandidates).map((p) => ({
    position: p.position,
    name: p.name,
    city: p.city,
    score: p.score,
    activeCount: p.activeCount,
  }));

  return NextResponse.json({
    period: period.key,
    employees,
    pharmacies: pharmacyRanking,
  });
}
