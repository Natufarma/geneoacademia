"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

/**
 * Pedido de recuperación de contraseña (empleados y vendedores comparten
 * Supabase Auth, así que esta pantalla sirve para ambos). Standalone: NO
 * usa AppShell. Siempre muestra el mismo mensaje de confirmación exista o
 * no la cuenta, para no filtrar qué emails están registrados.
 */
export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Ingresá tu email para continuar.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Ese email no parece válido. Revisalo e intentá de nuevo.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Mismo mensaje exista o no la cuenta: evita enumeración de emails.
      setSent(true);
    } catch {
      setError("No pudimos procesar el pedido. Intentá de nuevo en unos minutos.");
    } finally {
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
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-muted text-base leading-relaxed">
              Ingresá tu email y te mandamos un enlace para restablecerla.
            </p>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
          {sent ? (
            <p
              role="status"
              className="flex items-start gap-2.5 rounded-2xl bg-rosa-suave/60 text-ink text-sm font-medium leading-snug px-4 py-3"
            >
              <MailCheck size={18} className="text-geneo shrink-0" />
              <span>
                Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu
                contraseña. Revisá tu casilla (y el spam).
              </span>
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-muted text-sm font-semibold">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Ej: julieta@email.com"
                  autoComplete="email"
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
                {submitting ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>
          )}

          <Link
            href="/"
            className="text-soft text-xs underline underline-offset-2 text-center block py-2"
          >
            Volver a ingresar
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
