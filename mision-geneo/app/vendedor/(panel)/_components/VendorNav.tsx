"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/vendedor/farmacias", label: "Puntos de venta" },
  { href: "/vendedor/premios", label: "Premios" },
  { href: "/vendedor/ranking", label: "Ranking" },
];

export default function VendorNav() {
  const path = usePathname();
  const router = useRouter();
  const [pendingPrizes, setPendingPrizes] = useState(0);

  // Badge de premios pendientes: se ve desde cualquier pantalla del panel sin
  // bloquear el render del nav. Si falla el fetch, no se muestra el badge.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/vendedor/premios")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<{ prizes?: { status: string }[] }>;
      })
      .then((json) => {
        if (cancelled) return;
        const pending = (json.prizes ?? []).filter((p) => p.status !== "delivered").length;
        setPendingPrizes(pending);
      })
      .catch(() => {
        // Silencioso: sin badge si falla la carga.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/vendedor/acceso");
  }

  return (
    <div className="flex items-center gap-2">
      <nav className="flex items-center gap-1">
        {LINKS.map((l) => {
          const active = path.startsWith(l.href);
          const showBadge = l.href === "/vendedor/premios" && pendingPrizes > 0;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex items-center min-h-11 rounded-full px-4 text-sm font-bold transition-colors ${
                active
                  ? "bg-rosa-suave text-geneo"
                  : "text-muted hover:bg-rosa-suave/50 active:bg-rosa-suave/50"
              }`}
            >
              {l.label}
              {showBadge && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-geneo px-1 text-[10px] font-bold text-white">
                  {pendingPrizes}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full px-4 text-sm font-bold text-muted hover:bg-rosa-suave/50 active:bg-rosa-suave/50 transition-colors"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
