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
