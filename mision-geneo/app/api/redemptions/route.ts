import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReward, redemptionsSpent } from "@/lib/rewards";
import { totalPoints } from "@/lib/ranking";

/**
 * Canje de un premio: el servidor recalcula el saldo (ganados − gastados)
 * SIEMPRE desde la base, nunca confía en un saldo que mande el cliente. Si
 * no alcanza, 400 antes de tocar la tabla.
 */

export const dynamic = "force-dynamic";

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

  const rewardId = (body as { rewardId?: unknown } | null)?.rewardId;
  if (typeof rewardId !== "string" || !rewardId) {
    return NextResponse.json({ error: "rewardId inválido" }, { status: 400 });
  }

  const reward = getReward(rewardId);
  if (!reward) {
    return NextResponse.json({ error: "Ese premio no existe" }, { status: 400 });
  }

  const admin = createAdminClient();

  const [{ data: progress }, { data: daily }, { data: redemptions }] = await Promise.all([
    admin.from("mission_progress").select("score").eq("user_id", user.id),
    admin.from("daily_answers").select("points").eq("user_id", user.id),
    admin.from("redemptions").select("reward_id").eq("user_id", user.id),
  ]);

  if ((redemptions ?? []).some((r) => r.reward_id === rewardId)) {
    return NextResponse.json({ error: "Ya canjeaste este premio" }, { status: 400 });
  }

  const earned = totalPoints(progress ?? [], daily ?? []);
  const spent = redemptionsSpent((redemptions ?? []).map((r) => r.reward_id));
  const balance = Math.max(0, earned - spent);

  if (balance < reward.points) {
    return NextResponse.json(
      { error: `Te faltan ${reward.points - balance} pts para este premio.` },
      { status: 400 },
    );
  }

  await admin.from("redemptions").insert({
    user_id: user.id,
    reward_id: rewardId,
    points: reward.points,
  });

  return NextResponse.json({
    rewardId,
    pointsSpent: reward.points,
    balance: balance - reward.points,
  });
}
