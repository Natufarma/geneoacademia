import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChevronRight,
  Gift,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import AvatarUploader from "@/components/AvatarUploader";
import InstallButton from "@/components/InstallButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorUserId } from "@/lib/vendor-auth";
import VendorLogout from "../_components/VendorLogout";

export const dynamic = "force-dynamic";

/** Métricas del equipo del vendedor (farmacias, empleados, puntos, premios). */
async function getVendorProfile(vendorId: string) {
  const admin = createAdminClient();

  const [{ data: profile }, { data: authData }, { data: links }] = await Promise.all([
    admin.from("profiles").select("name, email, avatar_path").eq("id", vendorId).maybeSingle(),
    admin.auth.admin.getUserById(vendorId),
    admin.from("vendor_pharmacies").select("pharmacy_id").eq("vendor_id", vendorId),
  ]);

  const pharmacyIds = (links ?? []).map((l) => l.pharmacy_id);
  let employeeCount = 0;
  let teamPoints = 0;
  let prizesDelivered = 0;

  if (pharmacyIds.length) {
    const { data: employees } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "employee")
      .in("pharmacy_id", pharmacyIds);
    const empIds = (employees ?? []).map((e) => e.id);
    employeeCount = empIds.length;

    if (empIds.length) {
      const [{ data: progress }, { data: reds }] = await Promise.all([
        admin.from("mission_progress").select("score").in("user_id", empIds),
        admin.from("redemptions").select("id").eq("status", "delivered").in("user_id", empIds),
      ]);
      teamPoints = (progress ?? []).reduce((sum, p) => sum + (p.score ?? 0), 0);
      prizesDelivered = (reds ?? []).length;
    }
  }

  return {
    name: profile?.name ?? "Vendedor",
    email: authData?.user?.email ?? profile?.email ?? "",
    avatarPath: profile?.avatar_path ?? null,
    pharmacyCount: pharmacyIds.length,
    employeeCount,
    teamPoints,
    prizesDelivered,
  };
}

export default async function PerfilVendedor() {
  const vendorId = await getVendorUserId();
  if (!vendorId) redirect("/vendedor/acceso");

  const p = await getVendorProfile(vendorId);

  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Puntos de venta", value: p.pharmacyCount.toLocaleString("es-AR"), icon: Building2 },
    { label: "Empleados", value: p.employeeCount.toLocaleString("es-AR"), icon: Users },
    { label: "Premios entregados", value: p.prizesDelivered.toLocaleString("es-AR"), icon: Gift },
    { label: "Puntos del equipo", value: p.teamPoints.toLocaleString("es-AR"), icon: Sparkles },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Identidad */}
      <section className="bg-paper rounded-3xl shadow-card p-6 flex flex-col items-center text-center gap-3">
        <AvatarUploader initialPath={p.avatarPath} name={p.name} />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-ink font-extrabold text-xl tracking-tight">{p.name}</h1>
          {p.email && <p className="text-muted text-sm break-all">{p.email}</p>}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-geneo text-geneo font-bold text-xs uppercase tracking-wide px-4 py-1.5">
          Vendedor
        </span>
      </section>

      {/* Stats del equipo */}
      <section className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-paper rounded-2xl shadow-soft px-4 py-4 flex flex-col gap-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rosa-suave text-geneo">
              <Icon size={16} />
            </span>
            <p className="text-geneo font-extrabold text-xl leading-none mt-1">{value}</p>
            <p className="text-muted text-[11px] font-semibold uppercase tracking-wide leading-tight">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* La app */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-ink font-bold text-base tracking-tight">La app</h2>
          <p className="text-muted text-xs leading-snug">
            Instalala en tu teléfono para entrar más rápido, como una app más.
          </p>
        </div>
        <div className="bg-paper rounded-3xl shadow-soft p-5">
          <InstallButton />
        </div>
      </section>

      {/* Cuenta y ayuda */}
      <section className="flex flex-col gap-3">
        <h2 className="text-ink font-bold text-base tracking-tight">Cuenta y ayuda</h2>
        <div className="bg-paper rounded-3xl shadow-soft divide-y divide-line">
          <SettingsRow
            href="/recuperar"
            icon={KeyRound}
            label="Cambiar contraseña"
            hint="Te enviamos un enlace a tu email"
          />
          <SettingsRow href="/privacidad" icon={ShieldCheck} label="Política de privacidad" />
          <SettingsRow href="/bases" icon={ScrollText} label="Bases y condiciones" />
        </div>
      </section>

      {/* Sesión */}
      <div className="flex flex-col items-center">
        <VendorLogout />
      </div>
    </div>
  );
}

function SettingsRow({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-rosa-suave/40 active:bg-rosa-suave/40 transition-colors"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rosa-suave text-geneo shrink-0">
        <Icon size={17} />
      </span>
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="block text-ink font-bold text-sm leading-tight">{label}</span>
        {hint && <span className="block text-soft text-xs leading-snug">{hint}</span>}
      </span>
      <ChevronRight size={17} className="text-soft shrink-0" />
    </Link>
  );
}
