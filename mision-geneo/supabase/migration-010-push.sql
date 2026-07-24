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
