# Setup del backend Supabase — Misión Geneo

Guía paso a paso para dejar el backend funcionando. Tiempo estimado: ~15 min.

---

## 1. Crear el proyecto en Supabase

1. Entrá a https://supabase.com y creá una cuenta (o iniciá sesión).
2. **New project**.
   - **Name**: `mision-geneo`
   - **Database password**: generá una fuerte y guardala (la vas a necesitar si
     usás el SQL directo; para la app alcanza con las llaves API).
   - **Region**: **South America (São Paulo)** — la más cercana a Argentina.
3. Esperá ~2 min a que el proyecto termine de aprovisionarse.

---

## 2. Crear las tablas y la seguridad

1. En el proyecto → menú izquierdo → **SQL Editor** → **New query**.
2. Pegá TODO el contenido de `supabase/schema.sql` y ejecutá (**Run**).
   Crea las tablas, la función `is_admin()` y las políticas RLS.
3. Nueva query: pegá `supabase/seed.sql` y ejecutá. Siembra las 5 farmacias.

Verificación rápida: en **Table Editor** deberías ver `pharmacies` con 5 filas
y las tablas `profiles`, `mission_progress`, `redemptions`, `certificates`,
`pharmacy_purchases` vacías, todas con el candado de RLS activo.

---

## 3. Copiar las llaves API

En el proyecto → **Project Settings** (engranaje) → **API**:

| Valor en Supabase                    | Variable en `.env.local`            | ¿Pública? |
|--------------------------------------|-------------------------------------|-----------|
| Project URL                          | `NEXT_PUBLIC_SUPABASE_URL`          | Sí        |
| Project API keys → `anon` / `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Sí        |
| Project API keys → `service_role`    | `SUPABASE_SERVICE_ROLE_KEY`         | **NO — secreta** |

> La `service_role` saltea toda la seguridad (RLS). Va SOLO en el servidor,
> nunca en el navegador ni commiteada.

---

## 4. Configurar el entorno local

1. Copiá la plantilla a la raíz del proyecto:
   ```
   cp supabase/env.local.example .env.local
   ```
2. Pegá los 3 valores del paso 3 en `.env.local`.
3. Reiniciá el dev server (`npm run dev`).

`.env.local` está ignorado por git (no se commitea).

---

## 5. Habilitar el registro de empleados (Auth anónima)

Los empleados entran sin fricción vía **Anonymous sign-in**:

1. Supabase → **Authentication** → **Sign In / Providers** (o **Providers**).
2. Activá **Anonymous sign-ins** (Enable).

El admin, en cambio, usa email + contraseña (ya activado por defecto).

---

## 6. Crear el primer administrador

1. Supabase → **Authentication** → **Users** → **Add user**:
   - Email: p. ej. `admin@natufarma.com`
   - Password: una fuerte.
   - (Confirmá el email si te lo pide, o usá "Auto Confirm User".)
   - Copiá el **UUID** del usuario recién creado.
2. Volvé al **SQL Editor** y ejecutá (reemplazando el UUID y el nombre):
   ```sql
   insert into public.profiles (id, name, role)
   values ('UUID-DEL-ADMIN', 'Administrador Natufarma', 'admin')
   on conflict (id) do update set role = 'admin';
   ```

Con eso, ese usuario ve TODO en el panel de admin; el resto (empleados) solo lo
suyo.

---

## 7. Cargar las llaves en Vercel (para producción)

En el proyecto de Vercel → **Settings** → **Environment Variables**, agregá las
mismas 3 variables (Production + Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Redeploy para que tomen efecto.

---

## Notas

- Las **misiones y premios** siguen definidos en el código (`lib/missions.ts`,
  `lib/rewards.ts`). La base guarda el **progreso** (por `mission_slug`) y los
  **canjes** (por `reward_id`). Así no hay que migrar contenido a la base.
- El esquema es **idempotente**: podés re-correr `schema.sql` sin romper datos.
