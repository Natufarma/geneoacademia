"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Lock, Trash2, TriangleAlert, UserRound } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Card, SectionHeader } from "@/components/ui";

const inputClass =
  "w-full rounded-full border border-line bg-surface px-5 py-3 text-base text-ink placeholder:text-soft focus:border-geneo focus:outline-none";

/** Estados de un formulario que guarda contra Supabase. */
type SaveState = "idle" | "saving" | "ok" | "error";

export default function Cuenta() {
  return (
    <AppShell>
      <CuentaContent />
    </AppShell>
  );
}

function CuentaContent() {
  const { user } = useApp();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight">
          Mi <span className="text-geneo">cuenta</span>
        </h1>
        <p className="text-muted text-sm">
          Actualizá tus datos, cambiá tu contraseña o gestioná tu privacidad.
        </p>
      </header>

      <EditarDatos initialName={user?.name ?? ""} />
      <CambiarContrasena />
      <EliminarCuenta />
    </div>
  );
}

// ─── a. Editar datos ─────────────────────────────────────────────────────────

function EditarDatos({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  // El store solo expone name/farmacia/foto, no el teléfono: lo traemos del
  // perfil una vez al montar (name también, para arrancar con el valor fresco).
  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (!alive || !data) return;
      setName(data.name ?? "");
      setPhone(data.phone ?? "");
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanName = name.trim();
    if (!cleanName) {
      setState("error");
      setError("Tu nombre no puede quedar vacío.");
      return;
    }
    setState("saving");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setState("error");
      setError("Tu sesión expiró. Volvé a entrar e intentá de nuevo.");
      return;
    }
    // La RLS (profiles_update_own) y el trigger 007 garantizan que solo se
    // puedan tocar name/phone del propio usuario, nunca role ni pharmacy_id.
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ name: cleanName, phone: phone.trim() || null })
      .eq("id", user.id);
    if (dbError) {
      setState("error");
      setError("No pudimos guardar tus datos. Probá de nuevo.");
      return;
    }
    setState("ok");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="flex flex-col gap-3"
    >
      <SectionHeader eyebrow="Tus datos" subtitle="Podés actualizar tu nombre y tu teléfono.">
        Editar datos
      </SectionHeader>
      <Card as="form" variant="feature" onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Nombre y apellido</span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setState("idle");
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
              setState("idle");
            }}
            placeholder="Ej: 11 5555 5555"
            autoComplete="tel"
            className={inputClass}
          />
        </label>

        {state === "error" && error && (
          <p role="alert" className="text-geneo text-sm font-medium">
            {error}
          </p>
        )}
        {state === "ok" && (
          <p
            role="status"
            className="flex items-center gap-2 text-geneo text-sm font-semibold"
          >
            <CheckCircle2 size={16} />
            ¡Datos guardados!
          </p>
        )}

        <button
          type="submit"
          disabled={state === "saving"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
        >
          {state === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <UserRound size={16} />
              Guardar cambios
            </>
          )}
        </button>
      </Card>
    </motion.section>
  );
}

// ─── b. Cambiar contraseña ───────────────────────────────────────────────────

function CambiarContrasena() {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setState("error");
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== repeat) {
      setState("error");
      setError("Las contraseñas no coinciden. Revisalas e intentá de nuevo.");
      return;
    }
    setState("saving");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setState("error");
      setError("No pudimos cambiar tu contraseña. Probá de nuevo en unos minutos.");
      return;
    }
    setState("ok");
    setPassword("");
    setRepeat("");
  };

  const onChange = (setter: (v: string) => void) => (e: { target: { value: string } }) => {
    setter(e.target.value);
    setState("idle");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.04 }}
      className="flex flex-col gap-3"
    >
      <SectionHeader eyebrow="Seguridad" subtitle="Elegí una contraseña nueva de al menos 8 caracteres.">
        Cambiar contraseña
      </SectionHeader>
      <Card as="form" variant="feature" onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Nueva contraseña</span>
          <input
            type="password"
            value={password}
            onChange={onChange(setPassword)}
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-muted text-sm font-semibold">Repetir contraseña</span>
          <input
            type="password"
            value={repeat}
            onChange={onChange(setRepeat)}
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
          />
        </label>

        {state === "error" && error && (
          <p role="alert" className="text-geneo text-sm font-medium">
            {error}
          </p>
        )}
        {state === "ok" && (
          <p role="status" className="flex items-center gap-2 text-geneo text-sm font-semibold">
            <CheckCircle2 size={16} />
            ¡Contraseña actualizada!
          </p>
        )}

        <button
          type="submit"
          disabled={state === "saving"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-4 transition-colors"
        >
          {state === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Lock size={16} />
              Cambiar contraseña
            </>
          )}
        </button>
      </Card>
    </motion.section>
  );
}

// ─── c. Eliminar cuenta (zona de peligro) ────────────────────────────────────

function EliminarCuenta() {
  const { logout } = useApp();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Cerrar el modal con Escape (además del backdrop y "Cancelar"). Mientras se
  // está borrando no se permite cerrar, para no dejar la acción a medias.
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, deleting]);

  const onDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/perfil/eliminar", { method: "POST" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(
          (payload as { error?: string }).error ??
            "No pudimos eliminar tu cuenta. Probá de nuevo.",
        );
        setDeleting(false);
        return;
      }
    } catch {
      setError("No pudimos conectar con el servidor. Revisá tu conexión.");
      setDeleting(false);
      return;
    }
    // Cuenta borrada del servidor: cerramos la sesión local y volvemos al inicio.
    await logout();
    router.replace("/");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
      className="flex flex-col gap-3"
    >
      <SectionHeader
        eyebrow="Zona de peligro"
        subtitle="Esta acción es permanente y no se puede deshacer."
      >
        Eliminar cuenta
      </SectionHeader>
      <Card variant="base" className="p-6 flex flex-col gap-4 border-2 border-rosa-suave">
        <p className="text-muted text-sm leading-relaxed">
          Si eliminás tu cuenta se borran de forma permanente tus datos, tu foto de perfil, tu
          progreso, tus puntos y tus premios. No vas a poder recuperarlos.
        </p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setConfirmOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full border-2 border-geneo text-geneo hover:bg-geneo hover:text-white active:bg-geneo active:text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
        >
          <Trash2 size={16} />
          Eliminar mi cuenta
        </button>
        {error && !confirmOpen && (
          <p role="alert" className="text-geneo text-sm font-medium">
            {error}
          </p>
        )}
      </Card>

      {/* Modal de confirmación de marca (no el confirm() del navegador). */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={() => {
              if (!deleting) setConfirmOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              className="w-full max-w-xs bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-5 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-rosa-suave text-geneo">
                  <TriangleAlert size={22} />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="delete-title" className="text-ink font-extrabold text-lg tracking-tight">
                    ¿Eliminar tu cuenta?
                  </h2>
                  <p className="text-muted text-sm leading-snug">
                    Esta acción es <strong className="text-ink font-bold">permanente</strong>. Se
                    borran tus datos, tu foto de perfil, tu progreso y tus premios. No se pueden
                    recuperar.
                  </p>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-geneo text-sm font-medium">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Eliminando…
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Sí, eliminar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                  className="inline-flex items-center justify-center min-h-11 rounded-full text-muted hover:text-geneo active:text-geneo disabled:text-soft font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
