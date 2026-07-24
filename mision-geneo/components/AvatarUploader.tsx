"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cropToSquareWebp } from "@/lib/image";

type Props = {
  /** Ruta actual del avatar en el bucket privado `avatars` (null = sin foto). */
  initialPath: string | null;
  /** Nombre del empleado, para el alt de la imagen. */
  name: string;
};

const SIGNED_URL_TTL_SECONDS = 3600;

/** Pide una URL firmada (vida corta) para `path` en el bucket privado `avatars`. */
async function signAvatarUrl(path: string): Promise<string | null> {
  const { data } = await createClient()
    .storage.from("avatars")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

/**
 * Avatar del empleado en "Mi perfil": muestra la foto (URL firmada, el bucket
 * es privado) o el ícono de fallback, y permite subir una nueva desde cámara
 * o galería. El recorte a cuadrado y la conversión a WebP corren en el
 * navegador (lib/image.ts) antes de subir, así el archivo que llega a
 * Storage ya es liviano y uniforme.
 */
export default function AvatarUploader({ initialPath, name }: Props) {
  const [path, setPath] = useState(initialPath);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Genera la URL firmada cuando hay path (no hay caso de "borrar foto": una
  // vez que existe path nunca vuelve a null, así que no hace falta limpiar).
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    void signAvatarUrl(path).then((url) => {
      if (!cancelled) setSignedUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa.");

      const blob = await cropToSquareWebp(file);
      const objectPath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(objectPath, blob, { upsert: true, contentType: "image/webp" });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_path: objectPath })
        .eq("id", user.id);
      if (updateError) throw updateError;

      // El path suele ser el mismo string que antes (`<uid>/avatar.webp`), así
      // que setPath no siempre dispara el efecto de arriba: regeneramos la URL
      // acá también. Cada createSignedUrl emite un token nuevo, así que la URL
      // cambia y el navegador no sirve la imagen vieja desde caché.
      const fresh = await signAvatarUrl(objectPath);
      setPath(objectPath);
      setSignedUrl(fresh);
    } catch {
      setError("No pudimos subir la foto. Probá de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <label
        aria-label="Cambiar foto de perfil"
        className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-geneo to-geneo-dark text-white cursor-pointer transition-transform active:scale-95"
      >
        {/* La foto (o el ícono) se funde al aparecer, en vez de pop de golpe. */}
        <AnimatePresence mode="wait">
          {signedUrl ? (
            <motion.img
              key="photo"
              src={signedUrl}
              alt={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute inset-0 w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <motion.span
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <User size={34} />
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {uploading && (
            <motion.span
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/50"
            >
              <Loader2 size={22} className="text-white animate-spin" />
            </motion.span>
          )}
        </AnimatePresence>

        <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-geneo text-white border-2 border-paper">
          <Camera size={12} />
        </span>

        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="text-geneo text-xs font-semibold text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
