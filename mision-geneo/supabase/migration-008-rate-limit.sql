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
