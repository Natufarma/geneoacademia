import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guarda la suscripción Web Push del dispositivo del usuario logueado. El
 * cliente manda `subscription.toJSON()` (endpoint + keys); acá se valida la
 * sesión y se hace upsert por endpoint con el service_role (la tabla tiene RLS
 * sin policies: solo el servidor la toca).
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

  const sub = body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      user_id: user.id,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    return NextResponse.json({ error: "No pudimos guardar la suscripción" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
