import type { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
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
            <span className="hidden sm:inline text-soft text-xs font-bold uppercase tracking-widest">
              Vendedor
            </span>
          </div>
          <VendorNav />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
