/**
 * Normaliza el valor de NEXT_PUBLIC_SUPABASE_URL.
 *
 * supabase-js espera la URL BASE del proyecto (https://xxx.supabase.co) y le
 * agrega él mismo los paths (/rest/v1, /auth/v1, /storage/v1, ...). Un error de
 * copy-paste muy común es pegar la URL del endpoint REST
 * (https://xxx.supabase.co/rest/v1/) o dejar una barra final: eso rompe TODAS
 * las llamadas (auth admin, rest, etc.). Acá lo toleramos: sacamos un sufijo
 * /<servicio>/v<n> y las barras finales, dejando la base limpia.
 */
export function normalizeSupabaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/(rest|auth|storage|realtime|functions)\/v\d+\/?$/i, "")
    .replace(/\/+$/, "");
}
