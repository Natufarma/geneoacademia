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
