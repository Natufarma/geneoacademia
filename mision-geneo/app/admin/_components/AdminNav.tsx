"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/empleados", label: "Empleados" },
  { href: "/admin/vendedores", label: "Vendedores" },
  { href: "/admin/farmacias", label: "Farmacias" },
  { href: "/admin/premios", label: "Premios" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    // Scroll horizontal en pantallas angostas: con 5+ ítems el nav no cabe en la
    // fila del header en mobile. `scrollbar-hide` + `shrink-0` evitan que se
    // desborde o tape el botón "Salir"; en desktop entra todo sin scroll.
    <nav className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-hide">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`inline-flex shrink-0 items-center min-h-11 rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors ${
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
  );
}
