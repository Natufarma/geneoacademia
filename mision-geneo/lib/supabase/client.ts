import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Cliente Supabase para el navegador (Client Components).
 * Se instancia bajo demanda; NO se ejecuta en tiempo de build, así el build
 * pasa aunque las envs no estén configuradas todavía.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Ver supabase/SETUP.md.",
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
