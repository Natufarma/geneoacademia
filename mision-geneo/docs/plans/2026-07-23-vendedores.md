# Rol Vendedor — Plan de implementación

> Ejecutar con subagent-driven-development. Pasos con checkbox para tracking.

**Goal:** Agregar un rol `vendor` (vendedor de Natufarma) que se registra con su cuenta personal + un código de alta, da de alta las farmacias que suma al programa, y gestiona la entrega de premios de los empleados de sus farmacias. Todos los usuarios logueados ya pueden ver el ranking.

**Architecture:** El vendedor usa Supabase Auth (no el panel `/admin` de contraseña compartida). Su rol y sus permisos son **server-authoritative**: toda escritura sensible (registrarse como vendor, crear farmacia, marcar premio entregado) pasa por Route Handlers con la service role key (`createAdminClient`), que validan identidad + pertenencia. El área `/vendedor` se gatea por sesión Supabase + `role='vendor'`. Migración SQL nueva agrega el rol y la tabla `vendor_pharmacies`.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase (SSR + admin/service-role client), TypeScript, Tailwind v4.

## Global Constraints

- Correr TODO desde `mision-geneo/`. Verificación por tarea = `npm run lint` + `npm run build` (no hay framework de tests).
- Español rioplatense, tono cálido, matchear estilo existente.
- Commits: Conventional Commits en español, SIN atribución de IA / Co-Authored-By. `git add` solo los archivos nombrados por la tarea (nunca `git add -A`; el working tree tiene cambios no relacionados).
- **Seguridad no negociable:** el rol `vendor` y el código de alta se validan SIEMPRE server-side con `createAdminClient`. El cliente nunca setea su propio `role`. Toda acción del vendedor valida que la farmacia objetivo esté en su `vendor_pharmacies`.
- Clientes Supabase: `@/lib/supabase/server` → `await createClient()` (sesión, en route handlers/server components); `@/lib/supabase/admin` → `createAdminClient()` (service role, sync, bypassa RLS, server-only); `@/lib/supabase/client` → `createClient()` (browser).
- La tabla `pharmacies` tiene `code text unique not null` — al crear una farmacia el servidor genera un `code` único; el vendedor solo ingresa el nombre (y opcionalmente ciudad).
- `profiles` en la base viva ya tiene columnas `email` y `phone` (aunque `schema.sql` esté desactualizado).

## File Structure

**Crear:**
- `supabase/migration-004-vendedores.sql` — rol vendor + tabla vendor_pharmacies + RLS.
- `lib/vendor-auth.ts` — verificación del código de alta, resolución del vendor logueado, chequeo de pertenencia de farmacia.
- `app/api/vendedor/registro/route.ts` — alta de vendedor (valida código, crea usuario + perfil role=vendor).
- `app/api/vendedor/farmacias/route.ts` — GET mis farmacias, POST crear farmacia.
- `app/api/vendedor/premios/route.ts` — GET premios de mis farmacias, PATCH marcar entregado.
- `app/vendedor/acceso/page.tsx` — ingreso/registro del vendedor (fuera del layout gateado).
- `app/vendedor/(panel)/layout.tsx` — gate por sesión + role=vendor, shell + nav.
- `app/vendedor/(panel)/_components/VendorNav.tsx` — nav del área vendedor.
- `app/vendedor/(panel)/farmacias/page.tsx` — mis farmacias (listar + agregar).
- `app/vendedor/(panel)/premios/page.tsx` — premios pendientes + marcar entregado.
- `app/vendedor/(panel)/ranking/page.tsx` — ranking (reusa `/api/ranking`, solo lectura).

**Modificar:**
- `app/page.tsx` — agregar un enlace discreto "Soy vendedor" → `/vendedor/acceso`.

---

### Task 1: Migración SQL — rol vendor + vendor_pharmacies

**Files:**
- Create: `supabase/migration-004-vendedores.sql`

**Interfaces:**
- Produces: rol `'vendor'` permitido en `profiles.role`; tabla `public.vendor_pharmacies(vendor_id, pharmacy_id, created_at)` con PK compuesta; RLS de lectura scopeada.

- [ ] **Step 1: Crear `supabase/migration-004-vendedores.sql`**

```sql
-- ----------------------------------------------------------------------------
-- migration-004-vendedores.sql
--
-- Rol VENDEDOR (representante de Natufarma). El vendedor se registra con su
-- cuenta personal + un código de alta, da de alta las farmacias que suma al
-- programa y gestiona la entrega de premios de SUS farmacias.
--
-- Esta migración NO se corre sola: pegar en el SQL Editor de Supabase.
-- Es idempotente (drop/if not exists).
--
-- Seguridad: la asignación del rol 'vendor' y toda escritura del vendedor se
-- hacen server-side con la service role key (route handlers). Acá solo se
-- amplía el rol permitido, se crea la tabla de vínculo y se habilita la
-- LECTURA scopeada por RLS. Las escrituras las hace el server (service_role
-- bypassa RLS), así que NO se agregan policies de insert/update para
-- authenticated sobre vendor_pharmacies.
-- ----------------------------------------------------------------------------

-- 1) Ampliar los roles permitidos: employee | admin | vendor
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('employee','admin','vendor'));

-- 2) Vínculo vendedor ↔ farmacias (uno a muchos)
create table if not exists public.vendor_pharmacies (
  vendor_id   uuid not null references public.profiles(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (vendor_id, pharmacy_id)
);

create index if not exists vendor_pharmacies_vendor_idx on public.vendor_pharmacies(vendor_id);
create index if not exists vendor_pharmacies_pharmacy_idx on public.vendor_pharmacies(pharmacy_id);

alter table public.vendor_pharmacies enable row level security;

-- Lectura: el vendedor ve sus propias filas; el admin ve todo.
drop policy if exists vendor_pharmacies_select_own_or_admin on public.vendor_pharmacies;
create policy vendor_pharmacies_select_own_or_admin on public.vendor_pharmacies
  for select to authenticated
  using (vendor_id = auth.uid() or public.is_admin());

-- (Sin policy de insert/update/delete para authenticated: las escrituras van por
--  route handler con service_role.)

-- ----------------------------------------------------------------------------
-- Verificación sugerida (correr después de aplicar):
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--     where conrelid = 'public.profiles'::regclass and conname = 'profiles_role_check';
--   -- debe incluir 'vendor'
--   select * from information_schema.tables where table_name = 'vendor_pharmacies';
-- ----------------------------------------------------------------------------
```

- [ ] **Step 2: Commit** (archivo `.sql`, GGA no revisa `.sql`)

```bash
git add supabase/migration-004-vendedores.sql
git commit -m "feat(vendedores): migracion rol vendor y tabla vendor_pharmacies"
```

> NOTA para el orquestador (no para el subagente): la migración se APLICA a la base por el controlador después de esta tarea (no la aplica el subagente). Ver Task 8.

---

### Task 2: `lib/vendor-auth.ts` — código de alta y autorización del vendedor

**Files:**
- Create: `lib/vendor-auth.ts`

**Interfaces:**
- Produces: `verifyVendorCode(input: string): boolean`; `getVendorUserId(): Promise<string | null>`; `vendorOwnsPharmacy(vendorId: string, pharmacyId: string): Promise<boolean>`.

- [ ] **Step 1: Crear `lib/vendor-auth.ts`**

```ts
import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Autorización del rol vendedor. Todo server-only: el código de alta vive en
 * el env (VENDOR_SIGNUP_CODE) y el rol se resuelve desde la base con la
 * service role key — nunca se confía en el cliente.
 */

/** Compara el código ingresado contra VENDOR_SIGNUP_CODE (tiempo constante). */
export function verifyVendorCode(input: string): boolean {
  const code = process.env.VENDOR_SIGNUP_CODE;
  if (!code) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(code);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** user_id del usuario logueado SI su perfil tiene role='vendor'; si no, null. */
export async function getVendorUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "vendor" ? user.id : null;
}

/** ¿La farmacia pertenece al vendedor (existe el vínculo en vendor_pharmacies)? */
export async function vendorOwnsPharmacy(vendorId: string, pharmacyId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("vendor_pharmacies")
    .select("pharmacy_id")
    .eq("vendor_id", vendorId)
    .eq("pharmacy_id", pharmacyId)
    .maybeSingle();
  return Boolean(data);
}
```

- [ ] **Step 2: Verificar** `npm run build` (puede tirar error de tipos si `Database` no conoce `vendor_pharmacies`; ver nota). 

> NOTA de tipos: `lib/supabase/*` usa `Database` de `@/lib/supabase/types`. Si el tipo generado NO incluye `vendor_pharmacies`, las queries a esa tabla darán error de tipo. Solución dentro de esta tarea: en `lib/supabase/types.ts`, agregar a mano la definición mínima de la tabla `vendor_pharmacies` (Row/Insert/Update con `vendor_id: string`, `pharmacy_id: string`, `created_at: string`) siguiendo el shape de las tablas vecinas del archivo. Si el proyecto usa `any`/tipos laxos y compila igual, no tocar. Confirmar con `npm run build`.

- [ ] **Step 3: Commit**

```bash
git add lib/vendor-auth.ts lib/supabase/types.ts
git commit -m "feat(vendedores): helpers server-side de autorizacion del vendedor"
```

---

### Task 3: Alta de vendedor — route handler + pantalla de acceso

**Files:**
- Create: `app/api/vendedor/registro/route.ts`
- Create: `app/vendedor/acceso/page.tsx`

**Interfaces:**
- Consumes: `verifyVendorCode` (Task 2); `createAdminClient`; browser `createClient` (`@/lib/supabase/client`) para login.
- Produces: `POST /api/vendedor/registro` → `{ ok: true }` o `{ error }` (400/403/500).

- [ ] **Step 1: Crear `app/api/vendedor/registro/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyVendorCode } from "@/lib/vendor-auth";

/**
 * Alta de vendedor. TODO server-side: valida el código de alta y crea el
 * usuario + perfil con role='vendor' usando la service role key. El cliente
 * nunca setea su propio rol.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; password?: unknown; code?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const code = typeof body?.code === "string" ? body.code : "";

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Completá nombre, email y una contraseña de al menos 8 caracteres." },
      { status: 400 },
    );
  }
  if (!verifyVendorCode(code)) {
    return NextResponse.json({ error: "El código de vendedor no es válido." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createErr || !created?.user) {
    const already = (createErr?.message ?? "").toLowerCase().includes("already");
    return NextResponse.json(
      { error: already ? "Ese email ya tiene una cuenta." : "No pudimos crear la cuenta." },
      { status: 400 },
    );
  }

  const { error: profErr } = await admin.from("profiles").upsert({
    id: created.user.id,
    name,
    email,
    role: "vendor",
    pharmacy_id: null,
  });
  if (profErr) {
    return NextResponse.json({ error: "No pudimos completar el registro." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Crear `app/vendedor/acceso/page.tsx`** (client component, dos modos: Ingresar / Registrarme)

Estructura requerida (seguí el estilo visual de `app/page.tsx` — mismos inputs, botones, mensajes de error en español; NO uses `AppShell` ni el store `useApp`, esta pantalla es standalone):

- `"use client"`. Import `createClient` desde `@/lib/supabase/client` y `useRouter` de `next/navigation`.
- Estado: modo (`"login" | "signup"`), campos (`name`, `email`, `password`, `code`), `loading`, `error`.
- **Registro** (`signup`): `POST /api/vendedor/registro` con `{name,email,password,code}`. Si `ok`, hacer `await supabase.auth.signInWithPassword({email,password})` y `router.push("/vendedor/premios")`. Si error, mostrarlo.
- **Login** (`login`): `await supabase.auth.signInWithPassword({email,password})`; si error → mostrar "Email o contraseña incorrectos."; si ok, verificar rol antes de entrar:

```tsx
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from("profiles").select("role").eq("id", user!.id).maybeSingle();
if (profile?.role !== "vendor") {
  await supabase.auth.signOut();
  setError("Esta cuenta no es de vendedor.");
  return;
}
router.push("/vendedor/premios");
```

- Header con el logo (`/img/logo-fuxia.webp`, como otras pantallas) y título "Acceso vendedores".
- El campo "Código de vendedor" solo aparece en modo `signup`.

- [ ] **Step 3: Verificar** `npm run lint && npm run build`.

- [ ] **Step 4: Commit**

```bash
git add app/api/vendedor/registro/route.ts app/vendedor/acceso/page.tsx
git commit -m "feat(vendedores): alta de vendedor con codigo y pantalla de acceso"
```

---

### Task 4: Layout gateado del área vendedor + nav

**Files:**
- Create: `app/vendedor/(panel)/layout.tsx`
- Create: `app/vendedor/(panel)/_components/VendorNav.tsx`

**Interfaces:**
- Consumes: `getVendorUserId` (Task 2).
- Produces: shell server-gateado; cualquier ruta bajo `app/vendedor/(panel)/` exige sesión + role=vendor.

- [ ] **Step 1: Crear `app/vendedor/(panel)/layout.tsx`** (server component; gatea con `getVendorUserId`, redirige a `/vendedor/acceso` si no es vendor). Espejar la estructura de `app/admin/(protected)/layout.tsx` (header con logo + nav + salir), pero:
  - El gate es `const vendorId = await getVendorUserId(); if (!vendorId) redirect("/vendedor/acceso");`
  - "Salir" hace logout de Supabase. Como el logout de Supabase es client-side, poné el botón "Salir" dentro de `VendorNav` (client) usando `createClient()` del browser → `await supabase.auth.signOut(); router.push("/vendedor/acceso")`.

```tsx
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
```

- [ ] **Step 2: Crear `app/vendedor/(panel)/_components/VendorNav.tsx`** (client): links a `/vendedor/farmacias`, `/vendedor/premios`, `/vendedor/ranking` (marca activo con `usePathname`), + botón "Salir" que hace `supabase.auth.signOut()` y `router.push("/vendedor/acceso")`. Estilo similar a `AdminNav`.

- [ ] **Step 3: Verificar** `npm run lint && npm run build`. (Las páginas hijas aún no existen; si el build exige rutas, creá placeholders mínimos o dejá que Task 5/6/7 las agreguen — confirmá que layout y nav compilan solos.)

- [ ] **Step 4: Commit**

```bash
git add "app/vendedor/(panel)/layout.tsx" "app/vendedor/(panel)/_components/VendorNav.tsx"
git commit -m "feat(vendedores): layout gateado del area vendedor y navegacion"
```

---

### Task 5: Mis farmacias — route + pantalla

**Files:**
- Create: `app/api/vendedor/farmacias/route.ts`
- Create: `app/vendedor/(panel)/farmacias/page.tsx`

**Interfaces:**
- Consumes: `getVendorUserId` (Task 2), `createAdminClient`.
- Produces: `GET /api/vendedor/farmacias` → `{ pharmacies: {id,name,city,created_at}[] }`; `POST` con `{name, city?}` → `{ ok:true, pharmacyId }` o `{ error }`.

- [ ] **Step 1: Crear `app/api/vendedor/farmacias/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorUserId } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

/** Código de farmacia legible y aleatorio (sin caracteres ambiguos). */
function genPharmacyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "VE" + s;
}

export async function GET() {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: links } = await admin
    .from("vendor_pharmacies")
    .select("pharmacy_id")
    .eq("vendor_id", vendorId);
  const ids = (links ?? []).map((l) => l.pharmacy_id);
  if (!ids.length) return NextResponse.json({ pharmacies: [] });

  const { data: pharmacies } = await admin
    .from("pharmacies")
    .select("id, name, city, created_at")
    .in("id", ids)
    .order("name");
  return NextResponse.json({ pharmacies: pharmacies ?? [] });
}

export async function POST(request: Request) {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { name?: unknown; city?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const city = typeof body?.city === "string" && body.city.trim() ? body.city.trim() : null;
  if (!name) {
    return NextResponse.json({ error: "El nombre de la farmacia es obligatorio." }, { status: 400 });
  }

  const admin = createAdminClient();
  let pharmacyId: string | null = null;
  for (let attempt = 0; attempt < 5 && !pharmacyId; attempt++) {
    const code = genPharmacyCode();
    const { data, error } = await admin
      .from("pharmacies")
      .insert({ code, name, city })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      pharmacyId = data.id;
      break;
    }
    const dup =
      String(error?.code ?? "").includes("23505") ||
      String(error?.message ?? "").toLowerCase().includes("duplicate");
    if (error && !dup) {
      return NextResponse.json({ error: "No pudimos crear la farmacia." }, { status: 500 });
    }
  }
  if (!pharmacyId) {
    return NextResponse.json({ error: "No pudimos generar un código único. Probá de nuevo." }, { status: 500 });
  }

  const { error: linkErr } = await admin
    .from("vendor_pharmacies")
    .insert({ vendor_id: vendorId, pharmacy_id: pharmacyId });
  if (linkErr) {
    return NextResponse.json({ error: "Creamos la farmacia pero no pudimos vincularla. Avisá a soporte." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, pharmacyId });
}
```

- [ ] **Step 2: Crear `app/vendedor/(panel)/farmacias/page.tsx`** (client component):
  - Al montar, `GET /api/vendedor/farmacias` → lista. Mostrar cada farmacia (nombre + ciudad si hay).
  - Form "Agregar farmacia": input nombre (obligatorio) + input ciudad (opcional) + botón. Al enviar, `POST` y refrescar la lista. Deshabilitar el botón mientras envía; mostrar error si falla.
  - Estado vacío: "Todavía no agregaste farmacias. Sumá la primera cuando visites una farmacia que se une al programa."
  - Estilo: cards `bg-paper rounded-3xl shadow-*`, consistente con el resto.

- [ ] **Step 3: Verificar** `npm run lint && npm run build`.

- [ ] **Step 4: Commit**

```bash
git add app/api/vendedor/farmacias/route.ts "app/vendedor/(panel)/farmacias/page.tsx"
git commit -m "feat(vendedores): alta y listado de farmacias del vendedor"
```

---

### Task 6: Premios — route (listar + marcar entregado) + pantalla

**Files:**
- Create: `app/api/vendedor/premios/route.ts`
- Create: `app/vendedor/(panel)/premios/page.tsx`

**Interfaces:**
- Consumes: `getVendorUserId`, `vendorOwnsPharmacy` (Task 2), `createAdminClient`, `claimLabel` (`@/lib/prizes`).
- Produces: `GET /api/vendedor/premios` → `{ prizes: {id, employeeName, pharmacyName, prize, status, createdAt}[] }`; `PATCH` con `{redemptionId}` → `{ ok:true }` o `{ error }`.

- [ ] **Step 1: Crear `app/api/vendedor/premios/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorUserId, vendorOwnsPharmacy } from "@/lib/vendor-auth";
import { claimLabel } from "@/lib/prizes";

export const dynamic = "force-dynamic";

/** Premios reclamados por los empleados de las farmacias del vendedor. */
export async function GET() {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: links } = await admin
    .from("vendor_pharmacies")
    .select("pharmacy_id")
    .eq("vendor_id", vendorId);
  const pharmacyIds = (links ?? []).map((l) => l.pharmacy_id);
  if (!pharmacyIds.length) return NextResponse.json({ prizes: [] });

  const [{ data: employees }, { data: pharmacies }] = await Promise.all([
    admin.from("profiles").select("id, name, pharmacy_id").in("pharmacy_id", pharmacyIds),
    admin.from("pharmacies").select("id, name").in("id", pharmacyIds),
  ]);
  const empMap = new Map((employees ?? []).map((e) => [e.id, e]));
  const pharmMap = new Map((pharmacies ?? []).map((p) => [p.id, p.name]));
  const empIds = (employees ?? []).map((e) => e.id);
  if (!empIds.length) return NextResponse.json({ prizes: [] });

  const { data: reds } = await admin
    .from("redemptions")
    .select("id, user_id, reward_id, status, created_at")
    .in("user_id", empIds)
    .order("created_at", { ascending: false });

  const prizes = (reds ?? []).map((r) => {
    const emp = empMap.get(r.user_id);
    return {
      id: r.id,
      employeeName: emp?.name ?? "—",
      pharmacyName: emp ? pharmMap.get(emp.pharmacy_id ?? "") ?? "—" : "—",
      prize: claimLabel(r.reward_id),
      status: r.status,
      createdAt: r.created_at,
    };
  });
  return NextResponse.json({ prizes });
}

/** Marca un premio como entregado, validando que sea de una farmacia del vendedor. */
export async function PATCH(request: Request) {
  const vendorId = await getVendorUserId();
  if (!vendorId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { redemptionId?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const redemptionId = typeof body?.redemptionId === "string" ? body.redemptionId : "";
  if (!redemptionId) return NextResponse.json({ error: "redemptionId inválido" }, { status: 400 });

  const admin = createAdminClient();
  const { data: red } = await admin
    .from("redemptions")
    .select("id, user_id")
    .eq("id", redemptionId)
    .maybeSingle();
  if (!red) return NextResponse.json({ error: "Premio no encontrado" }, { status: 404 });

  const { data: emp } = await admin
    .from("profiles")
    .select("pharmacy_id")
    .eq("id", red.user_id)
    .maybeSingle();
  if (!emp?.pharmacy_id || !(await vendorOwnsPharmacy(vendorId, emp.pharmacy_id))) {
    return NextResponse.json({ error: "Ese premio no es de una de tus farmacias." }, { status: 403 });
  }

  const { error } = await admin
    .from("redemptions")
    .update({ status: "delivered" })
    .eq("id", redemptionId);
  if (error) return NextResponse.json({ error: "No pudimos actualizar el premio." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Crear `app/vendedor/(panel)/premios/page.tsx`** (client component):
  - Al montar, `GET /api/vendedor/premios`. Mostrar cada premio: empleado, farmacia, premio (`prize`), fecha, y un badge de estado. Ordenar/priorizar los pendientes (status distinto de `delivered`) arriba.
  - Cada premio pendiente tiene botón **"Marcar entregado"** → `PATCH` con `{redemptionId}`; al éxito, actualizar el estado localmente a `delivered`. Deshabilitar mientras procesa; mostrar error si falla.
  - Los ya `delivered` se muestran con un check "Entregado" (sin botón).
  - Estado vacío: "Todavía no hay premios reclamados en tus farmacias."
  - Estilo consistente con `app/recompensas/page.tsx`.

- [ ] **Step 3: Verificar** `npm run lint && npm run build`.

- [ ] **Step 4: Commit**

```bash
git add app/api/vendedor/premios/route.ts "app/vendedor/(panel)/premios/page.tsx"
git commit -m "feat(vendedores): gestion de premios (listar y marcar entregado)"
```

---

### Task 7: Ranking del vendedor + enlace de entrada

**Files:**
- Create: `app/vendedor/(panel)/ranking/page.tsx`
- Modify: `app/page.tsx` (agregar enlace "Soy vendedor")

**Interfaces:**
- Consumes: `GET /api/ranking` (endpoint existente que ya usa `app/ranking/page.tsx`).

- [ ] **Step 1: Crear `app/vendedor/(panel)/ranking/page.tsx`** (client component, solo lectura):
  - Al montar, `fetch("/api/ranking")` (mismo endpoint que la pantalla de empleados). Renderizar el ranking de **farmacias** (y opcionalmente el de empleados) en una tabla simple: posición, nombre, puntaje. Reusar el shape que devuelve `/api/ranking` — ANTES de codear, leer `app/ranking/page.tsx` y `app/api/ranking/route.ts` para copiar el shape exacto de la respuesta y no inventar campos.
  - No reusar `AppShell` (trae la bottom-nav de empleados): esta página vive dentro del layout del vendedor.
  - Encabezado: "Ranking del mes" + el período que ya devuelve el endpoint.

- [ ] **Step 2: Modificar `app/page.tsx`** — agregar, al pie del formulario (cerca del switch login/registro), un enlace discreto:

```tsx
<Link href="/vendedor/acceso" className="text-soft text-xs underline underline-offset-2 text-center block py-2">
  Soy vendedor
</Link>
```

(Importar `Link` de `next/link` si no está ya importado.)

- [ ] **Step 3: Verificar** `npm run lint && npm run build` — el build completo debe pasar (0 errores).

- [ ] **Step 4: Commit**

```bash
git add "app/vendedor/(panel)/ranking/page.tsx" app/page.tsx
git commit -m "feat(vendedores): ranking del vendedor y acceso desde el inicio"
```

---

### Task 8: Migración, env, QA y preview (controlador)

**Files:** ninguno (operación + verificación; la hace el orquestador, no un subagente)

- [ ] **Step 1: Aplicar la migración 004 a la base** (vía la connection string de `CREDENCIALES-GENEO-ACADEMIA.md`, con `psql`, o pegando el SQL en el editor de Supabase). Correr la verificación del final del archivo: confirmar que `profiles_role_check` incluye `vendor` y que existe `vendor_pharmacies`.

- [ ] **Step 2: Setear `VENDOR_SIGNUP_CODE`** en Vercel (todos los entornos) con `vercel env add VENDOR_SIGNUP_CODE`. Anotar el valor para el usuario.

- [ ] **Step 3: Build final** `npm run build` (0 errores).

- [ ] **Step 4: Push de la rama** `git push -u origin feat/vendedores` → Vercel genera preview. Confirmar Ready.

- [ ] **Step 5: QA manual en el preview** (con el código de alta): registrarse como vendedor → agregar una farmacia → registrar un empleado en esa farmacia (desde el flujo normal) → que el empleado reclame un premio → el vendedor lo ve en Premios y lo marca entregado → verificar en la base que `status='delivered'`. Confirmar que un empleado NO puede entrar a `/vendedor` (lo redirige a `/vendedor/acceso`).

- [ ] **Step 6:** Restaurar GGA si se desactivó. NO mergear a `main` — dejar para revisión del usuario.

---

## Self-Review

- **Cobertura del spec:** rol vendor + código de alta (T1,T2,T3) ✓; el vendedor crea farmacias (T5) ✓; gestiona premios / marca entregado (T6) ✓; ve ranking (T7) ✓; área propia gateada por sesión+rol, no el panel admin (T4) ✓; seguridad server-side y pertenencia validada (T2,T5,T6) ✓.
- **Riesgo principal:** el rol se setea server-side (T3) — un cliente no puede auto-promoverse. La pertenencia farmacia↔vendedor se valida en cada escritura (T5,T6).
- **A verificar en ejecución:** (a) el tipo `Database` conoce `vendor_pharmacies` (Task 2 nota); (b) el shape real de `/api/ranking` (Task 7 lee el endpoint antes de codear); (c) `pharmacies` requiere `code` único — cubierto por `genPharmacyCode` con reintento.
- **Fuera de alcance (confirmado):** adoptar farmacias ajenas, gestionar empleados, estados intermedios de premio, borrado de farmacias de prueba.
