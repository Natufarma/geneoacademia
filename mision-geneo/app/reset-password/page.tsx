"use client";

// IMPORTANT: la URL de redirección "/reset-password" debe estar en la
// allowlist de Supabase → Auth → URL Configuration → Redirect URLs, si no
// el enlace del email de recuperación no va a funcionar.

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

type Phase = "checking" | "ready" | "invalid" | "done";

/**
 * Landing del enlace de recuperación de contraseña. El cliente Supabase
 * detecta automáticamente los tokens de recovery en el hash de la URL al
 * cargar la página y establece una sesión temporal, disparando
 * onAuthStateChange con el evento "PASSWORD_RECOVERY". Standalone: NO usa
 * AppShell.
 */
export default function ResetPassword() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setPhase("ready");
      }
    });

    // Por si la sesión de recovery ya se estableció antes de suscribirnos.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPhase("ready");
    });

    // Fallback: si en ~3s no llegó el evento ni hay sesión, el enlace no es válido.
    const timeout = setTimeout(() => {
      setPhase((current) => (current === "checking" ? "invalid" : current));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "No pudimos actualizar tu contraseña.");
        setSubmitting(false);
        return;
      }
      await supabase.auth.signOut();
      setPhase("done");
    } catch {
      setError("No pudimos actualizar tu contraseña. Intentá de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface">
      <main className="max-w-md mx-auto px-5 py-8 flex flex-col gap-5">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-ink font-extrabold text-3xl leading-tight tracking-tight">
              Nueva contraseña
            </h1>
            <p className="text-muted text-base leading-relaxed">
              Elegí una contraseña nueva para tu cuenta.
            </p>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
          {phase === "checking" && (
            <p className="text-muted text-sm text-center py-4">Verificando el enlace…</p>
          )}

          {phase === "invalid" && (
            <div className="flex flex-col gap-4">
              <p role="alert" className="text-geneo text-sm font-medium">
                Este enlace no es válido o ya venció.
              </p>
              <Link
                href="/recuperar"
                className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
              >
                Pedir un enlace nuevo
              </Link>
            </div>
          )}

          {phase === "ready" && (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-muted text-sm font-semibold">
                  Contraseña nueva (mínimo 8 caracteres)
                </span>
                <span className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`${inputClass} pr-14`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-1.5 flex items-center justify-center w-11 h-11 rounded-full text-soft hover:text-geneo active:text-geneo transition-colors"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-muted text-sm font-semibold">Repetí la contraseña</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </label>

              {error && (
                <p role="alert" className="text-geneo text-sm font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
              >
                {submitting ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          )}

          {phase === "done" && (
            <div className="flex flex-col gap-4">
              <p
                role="status"
                className="text-ink text-sm font-medium leading-snug rounded-2xl bg-rosa-suave/60 px-4 py-3"
              >
                ¡Contraseña actualizada! Ya podés iniciar sesión.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
              >
                Ingresar
              </Link>
              <p className="text-soft text-xs leading-relaxed text-center">
                (Si sos vendedor, entrá desde «Soy vendedor».)
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
