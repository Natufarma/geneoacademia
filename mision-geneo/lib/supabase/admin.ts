import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente Supabase SOLO PARA EL SERVIDOR del panel de admin.
 * Usa el service_role key → saltea RLS y lee TODOS los datos. NUNCA se debe
 * importar desde un Client Component (la llave quedaría expuesta al navegador).
 * Instanciado bajo demanda: no rompe el build si falta la env.
 */
let client: SupabaseClient<Database> | null = null;

export function createAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY para el panel de admin. Ver supabase/SETUP.md.",
    );
  }
  if (!client) {
    client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
