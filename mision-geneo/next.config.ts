import type { NextConfig } from "next";

/**
 * A diferencia de la landing (export estático para Ferozo), esta app corre
 * con servidor (Vercel): sin `output: "export"`, así quedan habilitadas rutas
 * dinámicas y, en la fase 2, API routes para Supabase.
 * `images.unoptimized`: los assets ya vienen optimizados en WebP desde la
 * landing; evitamos el optimizador en runtime.
 */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
