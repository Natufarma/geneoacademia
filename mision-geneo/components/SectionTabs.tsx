"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Selector superior compartido por las tres secciones de conocimiento de
 * producto (agrupadas bajo la pestaña "Productos" del bottom nav):
 * Productos · Rituales · Ciencia. La ficha /productos/[slug] resalta "Productos".
 */

const TABS = [
  { href: "/productos", label: "Productos", match: "/productos" },
  { href: "/rituales", label: "Rituales", match: "/rituales" },
  { href: "/ciencia", label: "Ciencia", match: "/ciencia" },
] as const;

export default function SectionTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones de producto"
      className="flex gap-1 bg-paper rounded-full shadow-soft p-1"
    >
      {TABS.map((t) => {
        const active = pathname === t.match || pathname.startsWith(`${t.match}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 inline-flex items-center justify-center min-h-11 rounded-full text-sm font-bold tracking-tight transition-colors ${
              active
                ? "bg-geneo text-white"
                : "text-muted hover:bg-rosa-suave/60 hover:text-geneo active:bg-rosa-suave/60 active:text-geneo"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
