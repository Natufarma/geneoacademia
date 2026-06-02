import type { NextConfig } from "next";

/**
 * Export ESTÁTICO para hosting Apache compartido (Ferozo / Don Web).
 * - `output: "export"` → genera HTML estático en `out/` (se sube por ZIP).
 * - `images.unoptimized` → no hay optimizador de imágenes en runtime (no hay
 *   servidor Node); las imágenes ya están en WebP en /public.
 * - Los security headers y la compresión van en `.htaccess` (no hay servidor
 *   que ejecute la función `headers()` de Next).
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  trailingSlash: false,
};

export default nextConfig;
