"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Rocket, ShoppingBag, Trophy, User } from "lucide-react";

const TABS = [
  { href: "/misiones", label: "Misiones", icon: Rocket },
  { href: "/recompensas", label: "Premios", icon: Gift },
  { href: "/productos", label: "Productos", icon: ShoppingBag },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/perfil", label: "Mi perfil", icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="no-print fixed bottom-0 inset-x-0 z-50 bg-paper/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                active ? "text-geneo" : "text-soft hover:text-muted"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
