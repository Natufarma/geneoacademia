import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Gate del panel de admin por contraseña (server-only).
 * La cookie NO guarda la contraseña: guarda un HMAC-SHA256 de un texto fijo
 * firmado CON la contraseña como clave. Sin la contraseña no se puede forjar.
 * La contraseña vive solo en el servidor (env ADMIN_PASSWORD).
 */

export const ADMIN_COOKIE = "geneo_admin";
const PAYLOAD = "geneo-admin-session-v1";

/** El token esperado para la sesión (o null si no hay ADMIN_PASSWORD). */
export function sessionToken(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  return createHmac("sha256", pass).update(PAYLOAD).digest("hex");
}

/** Compara la contraseña ingresada contra ADMIN_PASSWORD (tiempo constante). */
export function verifyPassword(input: string): boolean {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pass);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sameToken(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** ¿La cookie actual es una sesión de admin válida? */
export async function isAuthed(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(cookie) && sameToken(cookie as string, token);
}

/** Exige sesión de admin; si no, redirige al login. Usar en el layout protegido. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin/login");
}
