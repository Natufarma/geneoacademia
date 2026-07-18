"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/empleados", label: "Empleados" },
  { href: "/admin/farmacias", label: "Farmacias" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
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
  );
}
