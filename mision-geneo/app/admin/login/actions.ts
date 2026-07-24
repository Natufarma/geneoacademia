"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, sessionToken, verifyPassword } from "@/lib/admin-auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  if (!(await checkRateLimit(`adminlogin:${ip}`, 10, 900))) {
    return { error: "Demasiados intentos. Esperá unos minutos." };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta." };
  const token = sessionToken();
  if (!token) return { error: "Falta configurar ADMIN_PASSWORD en el servidor." };

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });
  redirect("/admin");
}
