"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Gift, Store, Trophy } from "lucide-react";

/**
 * Navegación del panel de vendedor: barra inferior con íconos (mismo patrón que
 * la app del empleado). El nav superior anterior apretaba "Puntos de venta" en
 * varias líneas en mobile; la barra inferior es más clara y thumb-friendly.
 * El perfil vive en el header (arriba a la derecha), no acá.
 */
const TABS = [
  { href: "/vendedor/farmacias", label: "Puntos de venta", icon: Store },
  { href: "/vendedor/mis-farmacias", label: "Mis Farmacias", icon: Building2 },
  { href: "/vendedor/premios", label: "Premios", icon: Gift },
  { href: "/vendedor/ranking", label: "Ranking", icon: Trophy },
] as const;

export default function VendorNav() {
  const pathname = usePathname();
  const [pendingPrizes, setPendingPrizes] = useState(0);

  // Badge de premios pendientes: se ve desde cualquier pantalla del panel.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/vendedor/premios")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<{ prizes?: { status: string }[] }>;
      })
      .then((json) => {
        if (cancelled) return;
        setPendingPrizes((json.prizes ?? []).filter((p) => p.status !== "delivered").length);
      })
      .catch(() => {
        // Silencioso: sin badge si falla la carga.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav
      aria-label="Navegación del vendedor"
      className="no-print fixed bottom-0 inset-x-0 z-50 bg-paper/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          const showBadge = href === "/vendedor/premios" && pendingPrizes > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide text-center leading-tight transition-colors ${
                active ? "text-geneo" : "text-soft hover:text-muted"
              }`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-full bg-geneo px-1 text-[9px] font-bold text-white">
                    {pendingPrizes}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
