"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { login, type LoginState } from "./actions";

const initial: LoginState = { error: null };

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-5">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/img/logo-fuxia.webp" alt="Geneo" width={120} height={40} priority />
          <div className="flex flex-col gap-1">
            <h1 className="text-ink font-extrabold text-xl tracking-tight">
              Panel de administración
            </h1>
            <p className="text-muted text-sm">Acceso exclusivo de Natufarma.</p>
          </div>
        </div>

        <form action={formAction} className="bg-paper rounded-3xl shadow-card p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-ink text-sm font-semibold">Contraseña</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              autoFocus
              className="min-h-11 rounded-full border-2 border-line bg-surface px-5 text-ink text-sm outline-none focus:border-geneo transition-colors"
            />
          </label>

          {state.error && (
            <p role="alert" className="text-geneo text-sm font-medium">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="min-h-11 inline-flex items-center justify-center gap-2 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover disabled:bg-line disabled:text-soft text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
          >
            <Lock size={16} />
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
