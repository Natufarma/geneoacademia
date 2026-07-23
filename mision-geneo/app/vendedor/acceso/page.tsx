"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

/**
 * Acceso de vendedores (login/registro). Pantalla standalone: NO usa AppShell
 * ni el store de empleados (useApp) — el panel de vendedor vive aparte del
 * de empleado. El rol se valida server-side (route de registro) y, en login,
 * se verifica contra `profiles.role` antes de dejar entrar al panel.
 */
export default function AccesoVendedor() {
  const router = useRouter();

  const [mode, setMode] = useState<"signup" | "login">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => setError("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearFeedback();
    const cleanEmail = email.trim().toLowerCase();
    const supabase = createClient();

    if (mode === "signup") {
      const cleanName = name.trim();
      if (!cleanName || !cleanEmail || password.length < 8 || !code.trim()) {
        setError("Completá nombre, email, código de vendedor y una contraseña de al menos 8 caracteres.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/vendedor/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cleanName, email: cleanEmail, password, code: code.trim() }),
        });
        const result: { ok?: boolean; error?: string } = await res.json();
        if (!res.ok || !result.ok) {
          setError(result.error ?? "No pudimos completar el registro.");
          setLoading(false);
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) {
          setError("Cuenta creada. Iniciá sesión con tu email y contraseña.");
          setMode("login");
          setLoading(false);
          return;
        }
        router.push("/vendedor/premios");
      } catch {
        setError("No pudimos completar el registro.");
        setLoading(false);
      }
      return;
    }

    // Ingreso
    if (!cleanEmail || !password) {
      setError("Completá tu email y tu contraseña para entrar.");
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) {
        setError("Email o contraseña incorrectos.");
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle();
      if (profile?.role !== "vendor") {
        await supabase.auth.signOut();
        setError("Esta cuenta no es de vendedor.");
        setLoading(false);
        return;
      }
      router.push("/vendedor/premios");
    } catch {
      setError("No pudimos iniciar sesión.");
      setLoading(false);
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
          <Image src="/img/logo-fuxia.webp" alt="Geneo" width={104} height={34} priority />
          <div className="flex flex-col gap-2">
            <h1 className="text-ink font-extrabold text-3xl leading-tight tracking-tight">
              Acceso vendedores
            </h1>
            <p className="text-muted text-base leading-relaxed">
              Panel exclusivo para el equipo de ventas Geneo.
            </p>
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
          onSubmit={onSubmit}
          className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-1 rounded-full bg-surface border border-line p-1">
            {(
              [
                ["login", "Ingresar"],
                ["signup", "Registrarme"],
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
                <span className="text-muted text-sm font-semibold">Código de vendedor</span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    clearFeedback();
                  }}
                  placeholder="Código provisto por Geneo"
                  className={inputClass}
                />
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
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
          >
            {loading ? "Un momento…" : mode === "signup" ? "Registrarme" : "Entrar"}
          </button>
        </motion.form>
      </main>
    </div>
  );
}
