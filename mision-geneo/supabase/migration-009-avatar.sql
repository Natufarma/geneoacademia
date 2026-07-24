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
