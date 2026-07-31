-- =============================================================================
-- Misión Geneo — SETUP COMPLETO (schema + migraciones 002..010, en orden)
--
-- Pegá TODO este archivo en el SQL Editor de un proyecto Supabase NUEVO y
-- ejecutá (Run). Reproduce el esquema COMPLETO de producción (tablas,
-- funciones, triggers, RLS). Es idempotente: se puede correr sin romper nada.
--
-- Generado a partir de los archivos fuente del repo (supabase/). NO siembra
-- datos: para las farmacias de ejemplo, correr seed.sql aparte (opcional).
-- =============================================================================



-- ####################################################################
-- ## schema.sql
-- ####################################################################

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


-- ####################################################################
-- ## migration-002-auth-daily.sql
-- ####################################################################

-- ============================================================================
-- Migración 002 — Registro con email+contraseña y Pregunta del día con racha
-- ----------------------------------------------------------------------------
-- 1) profiles: datos de contacto reales (email/celular) para el panel admin.
-- 2) daily_answers: una respuesta por usuario por día (racha + puntos bonus).
-- 3) pharmacies: lectura pública (el selector del registro se ve ANTES de
--    tener sesión, ahora que el alta es con email+contraseña).
-- Idempotente: se puede correr más de una vez.
-- ============================================================================

-- 1) Datos de contacto en el perfil
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;

-- 2) Pregunta del día
create table if not exists public.daily_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  question_id text not null,
  correct boolean not null,
  points int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

alter table public.daily_answers enable row level security;

-- Cada usuario ve y escribe SOLO sus respuestas; el admin (service_role) ve todo.
drop policy if exists "daily_answers_select_own" on public.daily_answers;
create policy "daily_answers_select_own" on public.daily_answers
  for select using (auth.uid() = user_id);

drop policy if exists "daily_answers_insert_own" on public.daily_answers;
create policy "daily_answers_insert_own" on public.daily_answers
  for insert with check (auth.uid() = user_id);

drop policy if exists "daily_answers_admin_select" on public.daily_answers;
create policy "daily_answers_admin_select" on public.daily_answers
  for select using (public.is_admin());

-- 3) Farmacias visibles sin sesión (solo lectura; escritura sigue admin-only)
drop policy if exists "pharmacies_select_authenticated" on public.pharmacies;
drop policy if exists "pharmacies_select_public" on public.pharmacies;
create policy "pharmacies_select_public" on public.pharmacies
  for select using (true);


-- ####################################################################
-- ## migration-003-server-side-points.sql
-- ####################################################################

-- ============================================================================
-- Migración 003 — Los puntos los otorga el SERVIDOR, no el cliente
-- ----------------------------------------------------------------------------
-- IMPORTANTE: este archivo NO corre solo. Pegarlo a mano en el SQL Editor de
-- Supabase (Project → SQL Editor → New query → Run). Idempotente: se puede
-- correr más de una vez sin romper nada.
--
-- Por qué existe:
-- Hasta ahora el navegador escribía DIRECTO en mission_progress,
-- daily_answers, certificates y redemptions con valores que el propio
-- cliente calculaba (lib/store.tsx hacía `supabase.from(...).upsert(...)`
-- desde el browser). La RLS solo validaba que la fila fuera del usuario
-- (`user_id = auth.uid()`), nunca el VALOR que mandaba. Con la consola del
-- navegador abierta, cualquiera podía:
--   - upsert mission_progress con cualquier `score` (los 980 pts sin jugar).
--   - upsert certificates sin haber completado ninguna misión.
--   - insert daily_answers marcando `correct: true` sin responder nada.
--   - insert redemptions sin tener saldo (canjear premios físicos gratis).
-- Como el ranking de farmacias promedia el top-3 de empleados activos, UNA
-- sola persona haciendo esto se llevaba a toda su farmacia al primer puesto.
--
-- Qué cambia:
-- Esas 4 tablas ahora se escriben EXCLUSIVAMENTE desde los Route Handlers
-- (app/api/daily, app/api/missions/complete, app/api/redemptions), que
-- validan sesión + recalculan el valor server-side y usan el cliente admin
-- (service_role, ver lib/supabase/admin.ts) — ese cliente SALTEA RLS por
-- completo, así que estas policies no le afectan y los endpoints siguen
-- funcionando exactamente igual después de correr este archivo.
--
-- Este archivo revoca el INSERT/UPDATE de `authenticated` (el usuario común,
-- vía navegador) sobre esas 4 tablas. El SELECT propio se mantiene SIN
-- CAMBIOS: el usuario tiene que poder seguir leyendo su progreso.
--
-- Reemplazos (policy vieja → qué queda):
--   mission_progress:
--     - progress_insert_own  → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - progress_update_own  → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - progress_select_own_or_admin → SIN CAMBIOS
--   daily_answers:
--     - daily_answers_insert_own → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - daily_answers_select_own → SIN CAMBIOS
--     - daily_answers_admin_select → SIN CAMBIOS
--   certificates:
--     - certificates_insert_own → ELIMINADA (sin reemplazo; solo emite el servidor)
--     - certificates_select_own_or_admin → SIN CAMBIOS
--   redemptions:
--     - redemptions_insert_own → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - redemptions_select_own_or_admin → SIN CAMBIOS
--     - redemptions_admin_update → SIN CAMBIOS (el admin sigue pudiendo
--       actualizar el `status` del canje desde el panel — no es un endpoint
--       de puntos, no está en el alcance de esta migración)
-- ============================================================================

-- ------------------------- mission_progress ---------------------------------
drop policy if exists progress_insert_own on public.mission_progress;
drop policy if exists progress_update_own on public.mission_progress;

-- ---------------------------- daily_answers ----------------------------------
drop policy if exists "daily_answers_insert_own" on public.daily_answers;

-- ---------------------------- certificates ------------------------------------
drop policy if exists certificates_insert_own on public.certificates;

-- ---------------------------- redemptions --------------------------------------
drop policy if exists redemptions_insert_own on public.redemptions;

-- ============================================================================
-- Verificación sugerida después de correr esto (en el SQL Editor):
--
--   select schemaname, tablename, policyname, cmd
--   from pg_policies
--   where tablename in ('mission_progress','daily_answers','certificates','redemptions')
--   order by tablename, cmd;
--
-- Debería listar SOLO policies de `select` (y `update` en redemptions, para
-- el admin) — ningún `insert` de `authenticated` en las 4 tablas.
-- ============================================================================


-- ####################################################################
-- ## migration-004-vendedores.sql
-- ####################################################################

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


-- ####################################################################
-- ## migration-005-role-hardening.sql
-- ####################################################################

-- ----------------------------------------------------------------------------
-- migration-005-role-hardening.sql
--
-- CIERRA una escalada de privilegios. La policy profiles_update_own permite a
-- cualquier usuario 'authenticated' modificar su propia fila de profiles, y
-- Supabase concede UPDATE/INSERT a nivel de TABLA a authenticated/anon por
-- default. Con 'vendor' (migration-004) y el ya existente 'admin' como valores
-- válidos, un empleado podía auto-asignarse esos roles desde el navegador, sin
-- código de alta y sin pasar por el servidor:
--     supabase.from('profiles').update({ role: 'admin' }).eq('id', <su id>)
--
-- IMPORTANTE: un REVOKE por COLUMNA sobre `role` NO sirve. En Postgres, si el
-- rol tiene el privilegio a nivel de TABLA, los ACL por columna no se consultan
-- (ExecCheckOneRelPerms). Como authenticated/anon tienen UPDATE/INSERT de tabla
-- por default en Supabase, revocar solo la columna no tiene ningún efecto.
--
-- Fix robusto: un TRIGGER BEFORE INSERT/UPDATE que, SOLO para los roles web
-- (authenticated/anon), fuerza `role='employee'` en el alta e impide cambiar el
-- rol en updates. El servidor (service_role) y las conexiones internas/manuales
-- (postgres) quedan libres para asignar roles — así el alta de vendedor
-- server-side (/api/vendedor/registro con la service role key) sigue andando.
-- No depende de qué columnas toque cada upsert.
--
-- Los flujos legítimos del cliente (register / ensureProfile en lib/store.tsx)
-- NUNCA mandan `role`: en el alta queda 'employee' (igual que hoy) y en el
-- upsert de conflicto solo actualizan name/pharmacy_id/email/phone — así que
-- esto NO rompe nada.
--
-- Idempotente (create or replace / drop trigger if exists).
-- NO se corre solo: pegar en el SQL Editor de Supabase (o aplicar con psql).
-- ----------------------------------------------------------------------------

create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
as $$
begin
  -- Solo se restringe a los roles web (los del navegador). El servidor
  -- (service_role) y las conexiones internas/manuales (postgres) NO se tocan.
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.role := 'employee';                    -- el alta desde el cliente es siempre empleado
    elsif new.role is distinct from old.role then
      raise exception 'No autorizado a cambiar el rol del perfil';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role on public.profiles;
create trigger profiles_enforce_role
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_role();

-- ----------------------------------------------------------------------------
-- Verificación (correr después de aplicar):
--
--   -- 1) Prueba de ataque: logueado como un EMPLEADO normal (rol authenticated),
--   --    esto debe FALLAR con "No autorizado a cambiar el rol del perfil":
--   --      update public.profiles set role = 'admin' where id = auth.uid();
--
--   -- 2) El alta de un vendedor por el servidor (service_role, vía
--   --    /api/vendedor/registro) debe seguir creando el perfil con role='vendor'.
--
--   -- 3) Un registro normal de empleado (insert sin role) debe quedar 'employee'.
-- ----------------------------------------------------------------------------


-- ####################################################################
-- ## migration-006-punto-de-venta.sql
-- ####################################################################

-- ----------------------------------------------------------------------------
-- migration-006-punto-de-venta.sql
--
-- El vendedor da de alta "puntos de venta", que ahora pueden ser FARMACIA o
-- DIETÉTICA (Natufarma integró dietéticas). Además, una misma farmacia puede
-- tener varias sucursales en la misma ciudad, así que se agrega `branch`
-- (sucursal). La ciudad ya existe (`city`); su obligatoriedad se valida en la
-- app (no se cambia el schema para no romper filas viejas con city nula).
--
-- Idempotente (add column if not exists). NO se corre solo: pegar en el SQL
-- Editor de Supabase (o aplicar con psql).
-- ----------------------------------------------------------------------------

-- Tipo de punto de venta: farmacia (default) | dietetica
alter table public.pharmacies
  add column if not exists type text not null default 'farmacia'
    check (type in ('farmacia', 'dietetica'));

-- Sucursal (opcional): distingue varias sucursales de una misma farmacia/ciudad.
alter table public.pharmacies
  add column if not exists branch text;

-- ----------------------------------------------------------------------------
-- Verificación:
--   select column_name, data_type, is_nullable, column_default
--     from information_schema.columns
--    where table_name = 'pharmacies' and column_name in ('type','branch','city')
--    order by column_name;
-- ----------------------------------------------------------------------------


-- ####################################################################
-- ## migration-007-hardening.sql
-- ####################################################################

-- ----------------------------------------------------------------------------
-- migration-007-hardening.sql
--
-- Dos endurecimientos surgidos de la auditoría:
--
-- 1) redemptions sin unicidad: la ruta /api/prizes hace check-then-insert, así
--    que dos requests concurrentes (doble tap, retry, dos pestañas) podían crear
--    DOS canjes del mismo premio para el mismo empleado -> el vendedor veía dos
--    filas "Entregar" -> dos premios físicos. OJO: reward_id guarda el producto
--    elegido ("viaje-producto:beauty"), así que un unique sobre reward_id NO
--    evitaría reclamar el viaje con DOS productos distintos. Se deriva el TIPO de
--    premio (parte antes de ":") en una columna generada y el unique va sobre
--    (user_id, prize_type): un premio por hito y por empleado.
--
-- 2) profiles_update_own dejaba a un empleado cambiar su propia `pharmacy_id`
--    desde el navegador -> podía colgarse de cualquier farmacia e inflar el
--    puntaje de esa farmacia en el ranking (que promedia el top-3 de cada
--    farmacia). Se extiende el trigger enforce_profile_role para bloquear
--    también el cambio de pharmacy_id por parte de authenticated/anon (el
--    servidor con service_role y el cascade de FK quedan exentos, y un cambio
--    al MISMO valor -como hace el upsert del registro- se permite).
--
-- Idempotente. NO se corre solo: pegar en el SQL Editor de Supabase (o psql).
-- ----------------------------------------------------------------------------

-- 1) Unicidad de canje por (empleado, TIPO de premio)
alter table public.redemptions
  add column if not exists prize_type text
    generated always as (split_part(reward_id, ':', 1)) stored;
alter table public.redemptions
  drop constraint if exists redemptions_user_reward_unique;   -- por si se aplicó una versión previa
alter table public.redemptions
  drop constraint if exists redemptions_user_prize_unique;
alter table public.redemptions
  add constraint redemptions_user_prize_unique unique (user_id, prize_type);

-- 2) Trigger de perfil: bloquea rol Y farmacia para los roles web
create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
as $$
begin
  -- Solo se restringe a los roles web (los del navegador). El servidor
  -- (service_role), el cascade de FK y las conexiones internas/manuales
  -- (postgres) NO se tocan.
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.role := 'employee';                       -- el alta desde el cliente es siempre empleado
    else
      if new.role is distinct from old.role then
        raise exception 'No autorizado a cambiar el rol del perfil';
      end if;
      if new.pharmacy_id is distinct from old.pharmacy_id then
        raise exception 'No autorizado a cambiar la farmacia del perfil';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role on public.profiles;
create trigger profiles_enforce_role
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_role();

-- ----------------------------------------------------------------------------
-- Verificación:
--   -- unique presente:
--   select conname from pg_constraint
--     where conrelid='public.redemptions'::regclass and conname='redemptions_user_prize_unique';
--   -- como authenticated, cambiar pharmacy_id a OTRO valor debe FALLAR;
--   -- cambiarlo al MISMO valor (upsert de registro) debe funcionar.
-- ----------------------------------------------------------------------------


-- ####################################################################
-- ## migration-008-rate-limit.sql
-- ####################################################################

-- ----------------------------------------------------------------------------
-- migration-008-rate-limit.sql
--
-- Rate limiting server-side para los dos "gates" adivinables por fuerza bruta:
-- el login del panel admin (/admin/login) y el alta de vendedor con código
-- (/api/vendedor/registro). Se guarda un contador por clave (IP) con ventana
-- fija. La lógica es ATÓMICA (un solo UPSERT ... returning) para que ráfagas
-- concurrentes no puedan saltear el límite.
--
-- Solo el servidor (service_role) puede leer/escribir/ejecutar esto: la tabla
-- tiene RLS sin policies y la función se ejecuta solo con service_role.
--
-- Idempotente. NO se corre solo: pegar en el SQL Editor de Supabase (o psql).
-- ----------------------------------------------------------------------------

create table if not exists public.rate_limits (
  key          text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Sin policies: authenticated/anon no pueden tocar la tabla; service_role sí
-- (bypassa RLS).

-- Registra un intento para p_key y devuelve true si está permitido (<= p_max
-- dentro de la ventana de p_window segundos) o false si se excedió. Atómico.
create or replace function public.check_rate_limit(p_key text, p_max integer, p_window integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (key, count, window_start)
    values (p_key, 1, now())
  on conflict (key) do update
    set count = case
                  when rl.window_start < now() - make_interval(secs => p_window) then 1
                  else rl.count + 1
                end,
        window_start = case
                         when rl.window_start < now() - make_interval(secs => p_window) then now()
                         else rl.window_start
                       end
    returning rl.count into v_count;
  return v_count <= p_max;
end;
$$;

-- Solo el servidor puede ejecutarla (que un cliente la llame para inflar su
-- propio límite no tendría sentido).
revoke all on function public.check_rate_limit(text, integer, integer) from public;
revoke all on function public.check_rate_limit(text, integer, integer) from anon;
revoke all on function public.check_rate_limit(text, integer, integer) from authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- Que PostgREST vea la función nueva para poder llamarla por RPC.
notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- Verificación: llamar 4 veces con max=3 -> true, true, true, false
--   select public.check_rate_limit('test:ip', 3, 60);
-- ----------------------------------------------------------------------------


-- ####################################################################
-- ## migration-009-avatar.sql
-- ####################################################################

-- ----------------------------------------------------------------------------
-- migration-009-avatar.sql
--
-- Foto de perfil del empleado. Se guarda SOLO la ruta del archivo en
-- profiles.avatar_path (no una URL pública): la foto vive en un bucket PRIVADO
-- de Storage y se sirve siempre con URL firmada de vida corta. Decisión de
-- privacidad: una foto de cara es dato personal (Ley 25.326) y se muestra solo
-- en "Mi perfil" del propio empleado y en el panel admin, nunca en el ranking
-- ni en el certificado compartible.
--
-- Modelo de acceso:
--   * Cada usuario escribe/lee SOLO su carpeta  avatars/<su-uid>/...  (RLS).
--   * El admin lee cualquier foto desde el server con service_role (bypassa RLS),
--     por eso no hace falta una policy de SELECT para admin.
--   * La ruta es estable: avatars/<uid>/avatar.webp (upsert la sobreescribe, no
--     acumula huérfanos). La URL firmada cambia en cada request → sin caché vieja.
--
-- Idempotente. NO se corre solo: pegar en el SQL Editor de Supabase (o psql).
-- ----------------------------------------------------------------------------

-- 1. Columna en profiles: la ruta del objeto en Storage (null = sin foto).
--    El trigger enforce_profile_role (007) solo bloquea role/pharmacy_id, así que
--    la policy profiles_update_own ya permite al propio usuario setear esto.
alter table public.profiles
  add column if not exists avatar_path text;

-- 2. Bucket privado con tope duro de 5 MB y solo imágenes (backstop server-side;
--    el cliente igual comprime a ~cientos de KB antes de subir).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3. RLS sobre storage.objects (ya viene con RLS habilitada en Supabase).
--    Todas restringen al primer segmento de la ruta = el uid del que llama.
drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- Verificación:
--   select column_name from information_schema.columns
--     where table_schema='public' and table_name='profiles' and column_name='avatar_path';
--   select id, public, file_size_limit from storage.buckets where id='avatars';
--   select policyname from pg_policies
--     where schemaname='storage' and tablename='objects' and policyname like 'avatars_%';
-- ----------------------------------------------------------------------------


-- ####################################################################
-- ## migration-010-push.sql
-- ####################################################################

-- ----------------------------------------------------------------------------
-- migration-010-push.sql
--
-- Suscripciones Web Push para los recordatorios de racha. Cada dispositivo que
-- activa notificaciones guarda su suscripción acá; el cron diario
-- (/api/push/recordatorio) le envía a quien todavía no respondió la pregunta
-- del día.
--
-- Solo el servidor (service_role) toca esta tabla: el alta pasa por
-- /api/push/subscribe (Route Handler, valida sesión) y el envío por el cron.
-- Por eso RLS queda habilitada SIN policies (authenticated/anon no la tocan;
-- service_role bypassa RLS).
--
-- Idempotente. NO se corre solo: pegar en el SQL Editor de Supabase (o psql).
-- ----------------------------------------------------------------------------

create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;
-- Sin policies a propósito: todo el acceso es server-side (service_role).

-- ----------------------------------------------------------------------------
-- Verificación:
--   select count(*) from public.push_subscriptions;
--   select relrowsecurity from pg_class where relname = 'push_subscriptions';
-- ----------------------------------------------------------------------------
