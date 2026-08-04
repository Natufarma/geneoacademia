"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Botón "Salir" del header del panel de vendedor (cierra la sesión de Supabase). */
export default function VendorLogout() {
  const router = useRouter();

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/vendedor/acceso");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full px-4 text-sm font-bold text-muted hover:bg-rosa-suave/50 active:bg-rosa-suave/50 transition-colors"
    >
      <LogOut size={16} />
      Salir
    </button>
  );
}
