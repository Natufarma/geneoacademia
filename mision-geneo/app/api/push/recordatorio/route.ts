import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { argentinaDateKey } from "@/lib/timezone";

/**
 * Cron diario: le manda un recordatorio de racha a cada dispositivo suscripto
 * cuyo dueño TODAVÍA no respondió la pregunta del día (para no molestar a quien
 * ya la hizo). Lo dispara Vercel Cron (ver vercel.json) una vez a la tarde,
 * hora Argentina.
 *
 * Seguridad: exige el header `Authorization: Bearer $CRON_SECRET` (Vercel lo
 * agrega automáticamente cuando CRON_SECRET está seteado). Sin ese secreto, el
 * endpoint rechaza todo.
 *
 * Requiere las envs: CRON_SECRET, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 * y (opcional) VAPID_SUBJECT.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "VAPID no configurado" }, { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:fabianapeculo@natufarma.com.ar",
    publicKey,
    privateKey,
  );

  const admin = createAdminClient();
  const today = argentinaDateKey();

  // Quiénes ya respondieron hoy (para no recordarles).
  const { data: answered } = await admin.from("daily_answers").select("user_id").eq("day", today);
  const answeredSet = new Set((answered ?? []).map((r) => r.user_id as string));

  // Suscripciones y filtrado.
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, user_id, p256dh, auth");
  const targets = (subs ?? []).filter((s) => !answeredSet.has(s.user_id as string));

  const payload = JSON.stringify({
    title: "¡No pierdas tu racha! 🔥",
    body: "Respondé la pregunta del día y sumá un día más a tu racha.",
    url: "/misiones",
  });

  let sent = 0;
  const stale: string[] = [];
  await Promise.all(
    targets.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint as string, keys: { p256dh: s.p256dh as string, auth: s.auth as string } },
          payload,
        );
        sent += 1;
      } catch (err) {
        // 404/410 = suscripción muerta (el usuario desinstaló / revocó): limpiar.
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) stale.push(s.endpoint as string);
      }
    }),
  );

  if (stale.length > 0) {
    await admin.from("push_subscriptions").delete().in("endpoint", stale);
  }

  return NextResponse.json({ ok: true, candidates: targets.length, sent, cleaned: stale.length });
}
