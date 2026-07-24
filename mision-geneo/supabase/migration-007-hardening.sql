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
