import type { ReactNode } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "../_components/AdminNav";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/img/logo-fuxia.webp" alt="Geneo" width={92} height={30} priority />
            <span className="hidden sm:inline text-soft text-xs font-bold uppercase tracking-widest">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AdminNav />
            <a
              href="/admin/logout"
              className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full px-4 text-sm font-bold text-muted hover:bg-rosa-suave/50 active:bg-rosa-suave/50 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">{children}</main>

      <footer className="max-w-6xl mx-auto px-5 md:px-8 pb-8">
        <p className="text-soft text-xs">
          Misión Geneo · Panel de administración · Datos de Farmacias Aliadas.
        </p>
      </footer>
    </div>
  );
}
