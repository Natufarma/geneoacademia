import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { getVendorUserId } from "@/lib/vendor-auth";
import VendorNav from "./_components/VendorNav";

export default async function VendedorPanelLayout({ children }: { children: ReactNode }) {
  const vendorId = await getVendorUserId();
  if (!vendorId) redirect("/vendedor/acceso");

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-line">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/img/logo-fuxia.webp" alt="Geneo" width={92} height={30} priority />
            <span className="text-soft text-xs font-bold uppercase tracking-widest">Vendedor</span>
          </div>
          <Link
            href="/vendedor/perfil"
            aria-label="Mi perfil"
            className="inline-flex items-center gap-2 min-h-11 rounded-full pl-1 pr-3 text-sm font-bold text-muted hover:bg-rosa-suave/50 active:bg-rosa-suave/50 transition-colors"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
              <User size={18} />
            </span>
            <span className="hidden sm:inline">Perfil</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 pt-6 pb-28">{children}</main>
      <VendorNav />
    </div>
  );
}
