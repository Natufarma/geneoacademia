-- ============================================================================
-- Migración 003 — Los puntos los otorga el SERVIDOR, no el cliente
-- ----------------------------------------------------------------------------
-- IMPORTANTE: este archivo NO corre solo. Pegarlo a mano en el SQL Editor de
-- Supabase (Project → SQL Editor → New query → Run). Idempotente: se puede
-- correr más de una vez sin romper nada.
--
-- Por qué existe:
-- Hasta ahora el navegador escribía DIRECTO en mission_progress,
-- daily_answers, certificates y redemptions con valores que el propio
-- cliente calculaba (lib/store.tsx hacía `supabase.from(...).upsert(...)`
-- desde el browser). La RLS solo validaba que la fila fuera del usuario
-- (`user_id = auth.uid()`), nunca el VALOR que mandaba. Con la consola del
-- navegador abierta, cualquiera podía:
--   - upsert mission_progress con cualquier `score` (los 980 pts sin jugar).
--   - upsert certificates sin haber completado ninguna misión.
--   - insert daily_answers marcando `correct: true` sin responder nada.
--   - insert redemptions sin tener saldo (canjear premios físicos gratis).
-- Como el ranking de farmacias promedia el top-3 de empleados activos, UNA
-- sola persona haciendo esto se llevaba a toda su farmacia al primer puesto.
--
-- Qué cambia:
-- Esas 4 tablas ahora se escriben EXCLUSIVAMENTE desde los Route Handlers
-- (app/api/daily, app/api/missions/complete, app/api/redemptions), que
-- validan sesión + recalculan el valor server-side y usan el cliente admin
-- (service_role, ver lib/supabase/admin.ts) — ese cliente SALTEA RLS por
-- completo, así que estas policies no le afectan y los endpoints siguen
-- funcionando exactamente igual después de correr este archivo.
--
-- Este archivo revoca el INSERT/UPDATE de `authenticated` (el usuario común,
-- vía navegador) sobre esas 4 tablas. El SELECT propio se mantiene SIN
-- CAMBIOS: el usuario tiene que poder seguir leyendo su progreso.
--
-- Reemplazos (policy vieja → qué queda):
--   mission_progress:
--     - progress_insert_own  → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - progress_update_own  → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - progress_select_own_or_admin → SIN CAMBIOS
--   daily_answers:
--     - daily_answers_insert_own → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - daily_answers_select_own → SIN CAMBIOS
--     - daily_answers_admin_select → SIN CAMBIOS
--   certificates:
--     - certificates_insert_own → ELIMINADA (sin reemplazo; solo emite el servidor)
--     - certificates_select_own_or_admin → SIN CAMBIOS
--   redemptions:
--     - redemptions_insert_own → ELIMINADA (sin reemplazo; solo escribe el servidor)
--     - redemptions_select_own_or_admin → SIN CAMBIOS
--     - redemptions_admin_update → SIN CAMBIOS (el admin sigue pudiendo
--       actualizar el `status` del canje desde el panel — no es un endpoint
--       de puntos, no está en el alcance de esta migración)
-- ============================================================================

-- ------------------------- mission_progress ---------------------------------
drop policy if exists progress_insert_own on public.mission_progress;
drop policy if exists progress_update_own on public.mission_progress;

-- ---------------------------- daily_answers ----------------------------------
drop policy if exists "daily_answers_insert_own" on public.daily_answers;

-- ---------------------------- certificates ------------------------------------
drop policy if exists certificates_insert_own on public.certificates;

-- ---------------------------- redemptions --------------------------------------
drop policy if exists redemptions_insert_own on public.redemptions;

-- ============================================================================
-- Verificación sugerida después de correr esto (en el SQL Editor):
--
--   select schemaname, tablename, policyname, cmd
--   from pg_policies
--   where tablename in ('mission_progress','daily_answers','certificates','redemptions')
--   order by tablename, cmd;
--
-- Debería listar SOLO policies de `select` (y `update` en redemptions, para
-- el admin) — ningún `insert` de `authenticated` en las 4 tablas.
-- ============================================================================
