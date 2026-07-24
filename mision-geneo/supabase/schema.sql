-- ============================================================================
-- Misión Geneo — Esquema de base de datos + seguridad (RLS)
-- ----------------------------------------------------------------------------
-- Idempotente: se puede correr varias veces sin romper nada.
-- Ejecutar en Supabase → SQL Editor. Después correr seed.sql.
--
-- Modelo (fase 2 del plan): la app del empleado deja de guardar en localStorage
-- y escribe acá. El panel de admin lee TODO. Las misiones/premios siguen
-- definidos en el código (lib/missions.ts, lib/prizes.ts); la base guarda el
-- PROGRESO por slug y los canjes por reward_id.
--
-- ⚠️ ESTE ARCHIVO ES LA BASE. La base VIVA además tiene las migraciones
-- 002..007 (aplicarlas después de este archivo, en orden):
--   002  auth + daily_answers + profiles.email/phone + pharmacies_select público
--   003  puntos server-side (revoca INSERT/UPDATE del cliente en las tablas de
--        gamificación; deja solo redemptions_admin_update)
--   004  rol 'vendor' + tabla vendor_pharmacies
--   005  trigger enforce_profile_role (bloquea auto-escalada de rol)
--   006  pharmacies.type (farmacia/dietetica) + pharmacies.branch (sucursal)
--   007  redemptions.prize_type + unique(user_id,prize_type); el trigger 005
--        también bloquea el cambio de pharmacy_id por el cliente
-- Es decir: NO alcanza con correr solo este schema.sql para reproducir prod.
-- ============================================================================

-- Extensión para gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tabla: pharmacies (farmacias aliadas)
--   `code` es el identificador legible para el futuro QR de registro.
-- ----------------------------------------------------------------------------
create table if not exists public.pharmacies (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  name       text not null,
  city       text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Tabla: profiles (perfil de cada usuario autenticado)
--   id = auth.users.id. Los empleados entran por Auth anónima; el admin es una
--   cuenta real (email+password) con role='admin'.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  pharmacy_id uuid references public.pharmacies(id) on delete set null,
  name        text not null,
  role        text not null default 'employee' check (role in ('employee','admin')),
  created_at  timestamptz not null default now()
);

create index if not exists profiles_pharmacy_id_idx on public.profiles(pharmacy_id);

-- ----------------------------------------------------------------------------
-- Tabla: mission_progress (una fila por misión completada)
--   mission_slug referencia el slug de lib/missions.ts (core, avanzada o campaña).
--   unique(user_id, mission_slug) → idempotente, no se suma dos veces.
-- ----------------------------------------------------------------------------
create table if not exists public.mission_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  mission_slug text not null,
  score        integer not null default 0,
  completed_at timestamptz not null default now(),
  unique (user_id, mission_slug)
);

create index if not exists mission_progress_user_id_idx on public.mission_progress(user_id);

-- ----------------------------------------------------------------------------
-- Tabla: redemptions (canjes de premios)
--   reward_id referencia el id de lib/rewards.ts. status para el flujo de entrega.
-- ----------------------------------------------------------------------------
create table if not exists public.redemptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  reward_id  text not null,
  points     integer not null,
  status     text not null default 'requested' check (status in ('requested','approved','delivered')),
  created_at timestamptz not null default now()
);

create index if not exists redemptions_user_id_idx on public.redemptions(user_id);

-- ----------------------------------------------------------------------------
-- Tabla: certificates (certificados de Especialista Geneo)
-- ----------------------------------------------------------------------------
create table if not exists public.certificates (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  type      text not null default 'especialista',
  issued_at timestamptz not null default now(),
  unique (user_id, type)
);

create index if not exists certificates_user_id_idx on public.certificates(user_id);

-- ----------------------------------------------------------------------------
-- Tabla: pharmacy_purchases (sell-in — compras de la farmacia a Natufarma)
--   La medición comercial de la etapa 1 (la carga el admin). Ver PLAN.md.
-- ----------------------------------------------------------------------------
create table if not exists public.pharmacy_purchases (
  id          uuid primary key default gen_random_uuid(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  units       integer not null default 0,
  amount      numeric(12,2) not null default 0,
  period      text,                       -- ej. '2026-07' (mes de la compra)
  created_at  timestamptz not null default now()
);

create index if not exists pharmacy_purchases_pharmacy_id_idx on public.pharmacy_purchases(pharmacy_id);

-- ============================================================================
-- SEGURIDAD (Row Level Security)
-- ----------------------------------------------------------------------------
-- Regla general: cada empleado ve/escribe SOLO lo suyo. El admin ve TODO.
-- Datos personales de empleados → RLS es innegociable (Ley 25.326).
-- ============================================================================

-- Helper: ¿el usuario actual es admin?
-- SECURITY DEFINER + search_path fijo para evitar recursión de RLS al leer
-- profiles desde dentro de una policy de profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.pharmacies         enable row level security;
alter table public.profiles           enable row level security;
alter table public.mission_progress   enable row level security;
alter table public.redemptions        enable row level security;
alter table public.certificates       enable row level security;
alter table public.pharmacy_purchases enable row level security;

-- ---------------------------- pharmacies ------------------------------------
-- Lectura: cualquier autenticado (para poblar el selector de farmacia).
-- Escritura: solo admin.
drop policy if exists pharmacies_select on public.pharmacies;
create policy pharmacies_select on public.pharmacies
  for select to authenticated using (true);

drop policy if exists pharmacies_admin_write on public.pharmacies;
create policy pharmacies_admin_write on public.pharmacies
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----------------------------- profiles -------------------------------------
-- El usuario ve/gestiona su propio perfil; el admin ve todos.
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ------------------------- mission_progress ---------------------------------
drop policy if exists progress_select_own_or_admin on public.mission_progress;
create policy progress_select_own_or_admin on public.mission_progress
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists progress_insert_own on public.mission_progress;
create policy progress_insert_own on public.mission_progress
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists progress_update_own on public.mission_progress;
create policy progress_update_own on public.mission_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------- redemptions -----------------------------------
-- El empleado crea/ve sus canjes; el admin ve todos y actualiza el status.
drop policy if exists redemptions_select_own_or_admin on public.redemptions;
create policy redemptions_select_own_or_admin on public.redemptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists redemptions_insert_own on public.redemptions;
create policy redemptions_insert_own on public.redemptions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists redemptions_admin_update on public.redemptions;
create policy redemptions_admin_update on public.redemptions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------- certificates ----------------------------------
drop policy if exists certificates_select_own_or_admin on public.certificates;
create policy certificates_select_own_or_admin on public.certificates
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists certificates_insert_own on public.certificates;
create policy certificates_insert_own on public.certificates
  for insert to authenticated with check (user_id = auth.uid());

-- ------------------------- pharmacy_purchases -------------------------------
-- Solo el admin ve y carga el sell-in.
drop policy if exists purchases_admin_select on public.pharmacy_purchases;
create policy purchases_admin_select on public.pharmacy_purchases
  for select to authenticated using (public.is_admin());

drop policy if exists purchases_admin_write on public.pharmacy_purchases;
create policy purchases_admin_write on public.pharmacy_purchases
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
