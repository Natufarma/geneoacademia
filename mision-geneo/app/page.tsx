"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Star, Gift, Eye, EyeOff, MailCheck } from "lucide-react";
import { useApp } from "@/lib/store";

const inputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

/**
 * Bienvenida + alta/ingreso con email y contraseña (decisión del cliente).
 * El hero calca la lámina 1 "Inicio" de Lakhu.
 */
export default function Bienvenida() {
  const { ready, user, pharmacies, register, login } = useApp();
  const router = useRouter();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pharmacyId, setPharmacyId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/misiones");
  }, [ready, user, router]);

  const clearFeedback = () => {
    setError("");
    setNotice("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const cleanEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      const cleanName = name.trim();
      if (!cleanName || !cleanEmail || !pharmacyId || !password) {
        setError("Completá tu nombre, email, farmacia y una contraseña para empezar.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        setError("Ese email no parece válido. Revisalo e intentá de nuevo.");
        return;
      }
      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      setSubmitting(true);
      try {
        const result = await register({
          name: cleanName,
          email: cleanEmail,
          phone: phone.trim() || null,
          pharmacyId,
          password,
        });
        if (result === "confirm") {
          setSubmitting(false);
          setMode("login");
          setNotice(
            "¡Cuenta creada! Revisá tu email para confirmarla y después entrá con tu contraseña.",
          );
          return;
        }
        router.push("/misiones");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos registrarte.");
        setSubmitting(false);
      }
      return;
    }

    // Ingreso
    if (!cleanEmail || !password) {
      setError("Completá tu email y tu contraseña para entrar.");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: cleanEmail, password });
      router.push("/misiones");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
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

        {/* Cómo funciona */}
        <motion.ul
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
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

        {/* Alta / ingreso */}
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.12 }}
          onSubmit={onSubmit}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
          {/* Selector de modo */}
          <div className="grid grid-cols-2 gap-1 rounded-full bg-surface border border-line p-1">
            {(
              [
                ["signup", "Crear cuenta"],
                ["login", "Ya tengo cuenta"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  clearFeedback();
                }}
                className={`min-h-11 rounded-full text-sm font-bold tracking-tight transition-colors ${
                  mode === value
                    ? "bg-geneo text-white"
                    : "text-muted hover:text-geneo active:text-geneo"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {notice && (
            <p
              role="status"
              className="flex items-start gap-2.5 rounded-2xl bg-rosa-suave/60 text-ink text-sm font-medium leading-snug px-4 py-3"
            >
              <MailCheck size={18} className="text-geneo shrink-0" />
              <span>{notice}</span>
            </p>
          )}

          {mode === "signup" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-muted text-sm font-semibold">Nombre y apellido</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFeedback();
                  }}
                  placeholder="Ej: Julieta Fernández"
                  autoComplete="name"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-muted text-sm font-semibold">Celular (opcional)</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFeedback();
                  }}
                  placeholder="Ej: 11 5555 5555"
                  autoComplete="tel"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-muted text-sm font-semibold">Tu farmacia</span>
                <select
                  value={pharmacyId}
                  onChange={(e) => {
                    setPharmacyId(e.target.value);
                    clearFeedback();
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
            </>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFeedback();
              }}
              placeholder="Ej: julieta@email.com"
              autoComplete="email"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted text-sm font-semibold">
              Contraseña{mode === "signup" ? " (mínimo 8 caracteres)" : ""}
            </span>
            <span className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFeedback();
                }}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
            {submitting ? "Entrando…" : mode === "signup" ? "Comenzar" : "Entrar"}
          </button>

          <p className="text-soft text-xs leading-relaxed text-center">
            Programa exclusivo para Farmacias Aliadas Geneo.
          </p>
        </motion.form>
      </main>
    </div>
  );
}
