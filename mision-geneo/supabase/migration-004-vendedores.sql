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
