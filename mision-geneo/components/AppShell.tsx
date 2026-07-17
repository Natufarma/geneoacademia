"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

/**
 * Marco común de las pantallas internas: exige usuario registrado (si no,
 * vuelve al registro), centra el contenido como columna de app y suma la
 * barra de navegación inferior.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const { ready, user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Image
          src="/img/logo-fuxia.webp"
          alt="Geneo"
          width={120}
          height={40}
          className="opacity-60"
          priority
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface">
      <main className="max-w-md mx-auto px-5 pt-6 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
