import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { viajeComplete, academiaComplete, claimId, parseClaim } from "@/lib/prizes";
import { getProduct } from "@/lib/products";

/**
 * Reclamo de un premio por hito. El servidor recomputa la elegibilidad desde
 * mission_progress (nunca confía en el cliente) y evita doble reclamo del
 * mismo premio. No maneja puntos: los premios son por completar misiones.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { prizeId?: unknown; productSlug?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const prizeId = body?.prizeId;
  if (prizeId !== "viaje-producto" && prizeId !== "academia-kit") {
    return NextResponse.json({ error: "Premio inválido" }, { status: 400 });
  }

  // El producto elegido es obligatorio y válido solo para el premio del viaje.
  let productSlug: string | undefined;
  if (prizeId === "viaje-producto") {
    const slug = body?.productSlug;
    if (typeof slug !== "string" || !getProduct(slug)) {
      return NextResponse.json({ error: "Elegí un producto válido de la línea." }, { status: 400 });
    }
    productSlug = slug;
  }

  const admin = createAdminClient();
  const [{ data: progress }, { data: claims }] = await Promise.all([
    admin.from("mission_progress").select("mission_slug").eq("user_id", user.id),
    admin.from("redemptions").select("reward_id").eq("user_id", user.id),
  ]);

  const completed = new Set((progress ?? []).map((p) => p.mission_slug));
  const unlocked =
    prizeId === "viaje-producto" ? viajeComplete(completed) : academiaComplete(completed);
  if (!unlocked) {
    return NextResponse.json({ error: "Todavía no desbloqueaste este premio." }, { status: 400 });
  }

  const alreadyClaimed = (claims ?? []).some((c) => parseClaim(c.reward_id)?.prizeId === prizeId);
  if (alreadyClaimed) {
    return NextResponse.json({ error: "Ya reclamaste este premio." }, { status: 400 });
  }

  const rewardId = claimId(prizeId, productSlug);
  await admin.from("redemptions").insert({ user_id: user.id, reward_id: rewardId, points: 0 });

  return NextResponse.json({ prizeId, rewardId });
}
