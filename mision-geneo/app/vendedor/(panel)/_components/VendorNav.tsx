"use client";

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
