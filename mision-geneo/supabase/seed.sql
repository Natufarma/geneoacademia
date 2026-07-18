-- ============================================================================
-- Misión Geneo — Datos iniciales (seed)
-- ----------------------------------------------------------------------------
-- Correr DESPUÉS de schema.sql, en Supabase → SQL Editor.
-- Siembra las 5 farmacias de lib/pharmacies.ts. NO siembra empleados: esos
-- entran por la app (Auth anónima + su perfil).
-- ============================================================================

insert into public.pharmacies (code, name) values
  ('norte',     'Farmacia Norte'),
  ('centro',    'Farmacia Centro'),
  ('salud',     'Farmacia Salud'),
  ('vida',      'Farmacia Vida'),
  ('bienestar', 'Farmacia Bienestar')
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Crear el primer ADMINISTRADOR
-- ----------------------------------------------------------------------------
-- 1) En Supabase → Authentication → Users → "Add user": creá un usuario con
--    email + password (ej. admin@natufarma.com). Copiá su UUID.
-- 2) Insertá su perfil con role='admin' (reemplazá el UUID y el nombre):
--
--    insert into public.profiles (id, name, role)
--    values ('<UUID-DEL-ADMIN>', 'Administrador Natufarma', 'admin')
--    on conflict (id) do update set role = 'admin';
--
-- Alternativa: si el admin ya se registró como empleado por la app, promocionarlo:
--    update public.profiles set role = 'admin' where id = '<UUID>';
