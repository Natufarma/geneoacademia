-- ----------------------------------------------------------------------------
-- migration-005-role-hardening.sql
--
-- CIERRA una escalada de privilegios. La policy profiles_update_own permite a
-- cualquier usuario 'authenticated' modificar CUALQUIER columna de su propia
-- fila de profiles, incluido `role`. Con 'vendor' (migration-004) y el ya
-- existente 'admin' como valores válidos del check, un empleado podía
-- auto-asignarse esos roles desde el navegador, sin código de alta y sin pasar
-- por el servidor:
--     supabase.from('profiles').update({ role: 'admin' }).eq('id', <su id>)
--
-- Fix: revocar el privilegio de COLUMNA sobre `role` a authenticated/anon. El
-- rol solo lo setea el servidor con la service role key (service_role conserva
-- el privilegio: no se le revoca nada). Los flujos legítimos del cliente
-- (register / ensureProfile en lib/store.tsx) NUNCA escriben `role`: insertan
-- sin esa columna (queda el default 'employee') y en el upsert solo actualizan
-- name/email/phone/pharmacy_id — así que esto NO rompe nada.
--
-- Idempotente: revocar un privilegio ya ausente es no-op.
-- NO se corre solo: pegar en el SQL Editor de Supabase (o aplicar con psql).
-- ----------------------------------------------------------------------------

revoke insert (role), update (role) on public.profiles from authenticated;
revoke insert (role), update (role) on public.profiles from anon;

-- ----------------------------------------------------------------------------
-- Verificación sugerida (correr después de aplicar):
--   -- Ver que authenticated ya NO tiene insert/update sobre la columna role:
--   select grantee, privilege_type, column_name
--     from information_schema.column_privileges
--    where table_name = 'profiles' and column_name = 'role'
--    order by grantee, privilege_type;
--   -- (No deben aparecer filas grantee='authenticated' ni 'anon' para 'role'.)
--
--   -- Prueba funcional: logueado como un empleado normal, esto debe FALLAR
--   -- con "permission denied for column role":
--   --   update public.profiles set role = 'admin' where id = auth.uid();
-- ----------------------------------------------------------------------------
