import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyVendorCode } from "@/lib/vendor-auth";

/**
 * Alta de vendedor. TODO server-side: valida el código de alta y crea el
 * usuario + perfil con role='vendor' usando la service role key. El cliente
 * nunca setea su propio rol.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; password?: unknown; code?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Completá nombre, email y una contraseña de al menos 8 caracteres." },
      { status: 400 },
    );
  }
  if (!verifyVendorCode(code)) {
    return NextResponse.json({ error: "El código de vendedor no es válido." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createErr || !created?.user) {
    const already = (createErr?.message ?? "").toLowerCase().includes("already");
    return NextResponse.json(
      { error: already ? "Ese email ya tiene una cuenta." : "No pudimos crear la cuenta." },
      { status: 400 },
    );
  }

  const { error: profErr } = await admin.from("profiles").upsert({
    id: created.user.id,
    name,
    email,
    role: "vendor",
    pharmacy_id: null,
  });
  if (profErr) {
    return NextResponse.json({ error: "No pudimos completar el registro." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
