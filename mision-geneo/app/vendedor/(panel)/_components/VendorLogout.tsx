"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * "Cerrar sesión" del perfil del vendedor: botón + modal de confirmación de
 * marca (en vez del confirm() del navegador, sin estilo ni física). Mismo
 * patrón que el perfil del empleado.
 */
export default function VendorLogout() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/vendedor/acceso");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-line text-muted hover:border-geneo hover:text-geneo active:border-geneo active:text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>

      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={() => setConfirming(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vendor-logout-title"
              className="w-full max-w-xs bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-5 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-rosa-suave text-geneo">
                  <LogOut size={22} />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="vendor-logout-title" className="text-ink font-extrabold text-lg tracking-tight">
                    ¿Cerrar sesión?
                  </h2>
                  <p className="text-muted text-sm leading-snug">
                    Vas a volver a la pantalla de ingreso. Podés entrar de nuevo con tu email y
                    contraseña.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    void logout();
                  }}
                  className="inline-flex items-center justify-center min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
                >
                  Cerrar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="inline-flex items-center justify-center min-h-11 rounded-full text-muted hover:text-geneo active:text-geneo font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
