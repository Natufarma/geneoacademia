-- ----------------------------------------------------------------------------
-- migration-012-delivered-at.sql
--
-- Registra la FECHA DE ENTREGA de cada premio. Se agrega `delivered_at` en
-- redemptions: se setea cuando el vendedor marca el premio como "delivered".
-- Los premios ya entregados de antes quedan con delivered_at = null (no se
-- puede saber la fecha retroactiva; el historial los muestra sin fecha exacta).
--
-- Idempotente. Correr en el SQL Editor de Supabase, en PRODUCCIÓN y en STAGING.
-- ----------------------------------------------------------------------------

alter table public.redemptions
  add column if not exists delivered_at timestamptz;

-- ----------------------------------------------------------------------------
-- Verificación:
--   select column_name, data_type from information_schema.columns
--     where table_schema='public' and table_name='redemptions' and column_name='delivered_at';
-- ----------------------------------------------------------------------------
