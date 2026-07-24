import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Eliminar la cuenta del usuario logueado. Feature sensible: el borrado se hace
 * SIEMPRE del lado del servidor con el service_role; el cliente solo dispara el
 * POST. La service_role NUNCA se expone al navegador (createAdminClient vive en
 * server-only, ver lib/supabase/admin.ts).
 *
 * Orden del borrado:
 *   1) Autenticación: se resuelve el usuario desde la cookie de sesión con el
 *      cliente anon. Nunca se confía en un id que mande el cliente: se borra
 *      EXCLUSIVAMENTE la cuenta del `user.id` de la sesión.
 *   2) Foto de perfil: si el profile tiene `avatar_path`, se borra el objeto del
 *      bucket privado `avatars`. Storage NO participa del cascade de la base
 *      (no hay FK desde storage.objects hacia el usuario), así que hay que
 *      borrarlo a mano ANTES de eliminar al usuario, o quedaría huérfano.
 *   3) Usuario de Auth: admin.auth.admin.deleteUser(user.id). Esto dispara el
 *      CASCADE de la base de datos:
 *        auth.users ─ON DELETE CASCADE→ public.profiles
 *        public.profiles ─ON DELETE CASCADE→ mission_progress, daily_answers,
 *                                            redemptions, certificates,
 *                                            vendor_pharmacies
 *      Verificado en supabase/schema.sql (l.47,63,78,92),
 *      migration-002 (daily_answers) y migration-004 (vendor_pharmacies): TODAS
 *      referencian con `on delete cascade`, por eso NO hace falta borrar esas
 *      tablas de gamificación explícitamente.
 */

export const dynamic = "force-dynamic";

export async function POST() {
  // 1) Auth: el usuario a borrar es SIEMPRE el de la sesión, nunca uno arbitrario.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 2) Borrar la foto de perfil del Storage (no la cubre el cascade de la base).
  //    Se lee el avatar_path con el admin client (service_role) para no depender
  //    de RLS. Si el borrado del objeto falla, seguimos igual: preferimos dejar
  //    (a lo sumo) un archivo huérfano antes que bloquear la baja de la cuenta.
  const { data: profile } = await admin
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.avatar_path) {
    await admin.storage.from("avatars").remove([profile.avatar_path]);
  }

  // 3) Borrar el usuario de Auth → cascada a profiles y a toda la gamificación.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json(
      { error: "No pudimos eliminar tu cuenta. Probá de nuevo en unos minutos." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
