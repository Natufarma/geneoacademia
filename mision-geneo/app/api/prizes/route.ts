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
    const product = typeof slug === "string" ? getProduct(slug) : undefined;
    if (!product || product.available === false) {
      return NextResponse.json({ error: "Elegí un producto válido de la línea." }, { status: 400 });
    }
    productSlug = product.slug;
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
  const { error: insertError } = await admin
    .from("redemptions")
    .insert({ user_id: user.id, reward_id: rewardId, points: 0 });
  if (insertError) {
    const message = insertError.message?.toLowerCase() ?? "";
    if (insertError.code === "23505" || message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.json({ error: "Ya reclamaste este premio." }, { status: 400 });
    }
    return NextResponse.json({ error: "No pudimos registrar el premio." }, { status: 500 });
  }

  return NextResponse.json({ prizeId, rewardId });
}
