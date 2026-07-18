"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Star, Gift, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";

/**
 * Bienvenida + registro. En producción se llega acá desde el QR de la
 * farmacia (la farmacia viene precargada); en el demo se elige de la lista
 * de farmacias que trae la base.
 */
export default function Bienvenida() {
  const { ready, user, pharmacies, register } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [pharmacyId, setPharmacyId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/misiones");
  }, [ready, user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || !pharmacyId) {
      setError("Completá tu nombre y elegí tu farmacia para empezar.");
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: cleanName, pharmacyId });
      router.push("/misiones");
    } catch {
      setError("No pudimos registrarte. Revisá tu conexión e intentá de nuevo.");
      setSubmitting(false);
    }
  };

  if (!ready || user) {
    return <div className="min-h-dvh bg-surface" />;
  }

  return (
    <div className="min-h-dvh bg-surface">
      <main className="max-w-md mx-auto px-5 pb-12 flex flex-col gap-6">
        {/* Hero de bienvenida */}
        <div className="relative -mx-5 overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-geneo to-geneo-dark text-white">
          <div className="anim-breathe absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="relative px-7 pt-10 pb-9 flex flex-col gap-5">
            <Image
              src="/img/logo-white.webp"
              alt="Geneo"
              width={110}
              height={36}
              priority
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="flex flex-col gap-3"
            >
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                MISIÓN
                <br />
                GENEO ✦
              </h1>
              <p className="text-white/90 text-base leading-relaxed">
                ¡Bienvenida a tu misión! Convertite en{" "}
                <strong className="font-bold">Especialista Beauty Wellness</strong>.
                Cada recomendación transforma la rutina de alguien.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Cómo funciona */}
        <motion.ul
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.15 }}
          className="flex flex-col gap-3"
        >
          {[
            { icon: Gamepad2, text: "Aprendé jugando en pocos minutos." },
            { icon: Star, text: "Sumá puntos con cada misión." },
            { icon: Gift, text: "Obtené tu certificado y participá del ranking." },
          ].map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3.5 bg-paper rounded-2xl shadow-soft px-4 py-3.5"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rosa-suave text-geneo shrink-0">
                <Icon size={20} />
              </span>
              <span className="text-ink text-[15px] font-medium leading-snug">{text}</span>
            </li>
          ))}
        </motion.ul>

        {/* Registro demo */}
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.3 }}
          onSubmit={onSubmit}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
          <h2 className="text-ink font-bold text-lg tracking-tight">Empezá tu misión</h2>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Tu nombre</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Ej: Julieta Fernández"
              autoComplete="name"
              className="rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Tu farmacia</span>
            <select
              value={pharmacyId}
              onChange={(e) => {
                setPharmacyId(e.target.value);
                setError("");
              }}
              className={`rounded-full border border-line bg-surface px-5 py-3 text-base focus:border-geneo focus:outline-none ${
                pharmacyId ? "text-ink" : "text-soft"
              }`}
            >
              <option value="" disabled>
                {pharmacies.length ? "Elegí tu farmacia" : "Cargando farmacias…"}
              </option>
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p role="alert" className="text-geneo text-sm font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
          >
            {submitting ? "Entrando…" : "¡Aceptá la misión!"}
            <ArrowRight size={18} />
          </button>

          <p className="text-soft text-xs leading-relaxed text-center">
            Programa exclusivo para Farmacias Aliadas Geneo.
          </p>
        </motion.form>
      </main>
    </div>
  );
}
