import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MISSIONS, getMission } from "@/lib/missions";
import { employeePoints } from "@/lib/ranking";

/**
 * Completar una misión: el servidor es la única fuente de verdad del
 * puntaje. El cliente manda solo el `slug`; el `pointsTotal` se resuelve
 * SIEMPRE del catálogo (lib/missions.ts), nunca de un número que mande el
 * navegador.
 *
 * El certificado de Especialista también se emite acá: después de guardar
 * el progreso, el servidor relee TODAS las misiones completadas del usuario
 * y solo emite el certificado si están las core (ni `advanced` ni
 * `campaign`) — nunca a pedido directo del cliente.
 *
 * Deuda conocida (a propósito, fuera de alcance): esto valida el VALOR de la
 * misión (que exista en el catálogo, que el puntaje sea el del catálogo),
 * NO que el usuario haya recorrido los pasos (quiz/match) de esa misión.
 * Validar paso a paso queda pendiente para una iteración futura.
 */

export const dynamic = "force-dynamic";

const CORE_MISSIONS = MISSIONS; // MISSIONS ya excluye advanced/campaign (ver lib/missions.ts)

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const slug = (body as { slug?: unknown } | null)?.slug;
  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug inválido" }, { status: 400 });
  }

  const mission = getMission(slug);
  if (!mission) {
    return NextResponse.json({ error: "Esa misión no existe" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("mission_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("mission_slug", slug)
    .maybeSingle();
  const alreadyCompleted = Boolean(existing);

  await admin.from("mission_progress").upsert(
    { user_id: user.id, mission_slug: slug, score: mission.pointsTotal },
    { onConflict: "user_id,mission_slug", ignoreDuplicates: true },
  );

  // Releer TODO el progreso del usuario (server-side) para decidir certificado y puntaje.
  const [{ data: progress }, { data: existingCert }] = await Promise.all([
    admin
      .from("mission_progress")
      .select("mission_slug, score, completed_at")
      .eq("user_id", user.id),
    admin.from("certificates").select("id").eq("user_id", user.id).eq("type", "especialista").maybeSingle(),
  ]);

  const progressRows = progress ?? [];
  const isSpecialist = CORE_MISSIONS.every((m) =>
    progressRows.some((p) => p.mission_slug === m.slug),
  );

  let certificateIssued = false;
  if (isSpecialist && !existingCert) {
    await admin
      .from("certificates")
      .upsert(
        { user_id: user.id, type: "especialista" },
        { onConflict: "user_id,type", ignoreDuplicates: true },
      );
    certificateIssued = true;
  }

  const points = employeePoints(progressRows);

  return NextResponse.json({
    slug,
    pointsAwarded: alreadyCompleted ? 0 : mission.pointsTotal,
    alreadyCompleted,
    totalPoints: points,
    isSpecialist,
    certificateIssued,
  });
}
