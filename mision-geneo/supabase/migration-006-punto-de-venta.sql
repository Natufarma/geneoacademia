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
