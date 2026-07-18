"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
      <main className="max-w-md mx-auto px-5 py-8 flex flex-col gap-5">
        {/* Hero de bienvenida (estilo lámina 1 "Inicio" de Lakhu) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="bg-paper rounded-3xl shadow-card overflow-hidden flex flex-col gap-5"
        >
          <div className="px-6 pt-6 flex flex-col gap-4">
            <Image
              src="/img/logo-fuxia.webp"
              alt="Geneo"
              width={104}
              height={34}
              priority
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-ink font-extrabold text-3xl leading-tight tracking-tight">
                ¡Bienvenida!
                <br />
                A tu misión
              </h1>
              <p className="text-muted text-base leading-relaxed">
                Convertite en{" "}
                <strong className="text-ink font-bold">Especialista Beauty Wellness</strong>.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full">
            <Image
              src="/img/bienvenida.webp"
              alt=""
              fill
              sizes="(max-width: 480px) 100vw, 420px"
              className="object-cover object-top"
              priority
            />
          </div>
        </motion.section>

        {/* Registro */}
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.12 }}
          onSubmit={onSubmit}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
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
            className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
          >
            {submitting ? "Entrando…" : "Comenzar"}
          </button>

          <p className="text-soft text-xs leading-relaxed text-center">
            Programa exclusivo para Farmacias Aliadas Geneo.
          </p>
        </motion.form>
      </main>
    </div>
  );
}
