# Vendedores que gestionan sus farmacias — Diseño

**Fecha:** 2026-07-23
**Estado:** aprobado en brainstorming, pendiente de revisión del spec por el usuario.

## Objetivo

Permitir que los **vendedores** de Natufarma (representantes de confianza) trabajen de forma autónoma sobre el programa Misión Geneo, sin depender de una administración central:

- Se registran con **su cuenta personal** (email + contraseña).
- **Dan de alta las farmacias** que suman al programa a medida que las visitan y las incorporan.
- **Gestionan la entrega de premios** de los empleados de sus farmacias (marcan los canjes como entregados).
- **Ven** el ranking completo y todas las farmacias (solo lectura, como cualquier usuario).

## Decisiones tomadas (brainstorming)

1. **Alcance del vendedor:** SOLO gestión de premios (marcar entregado) + lectura de ranking/farmacias. No gestiona empleados ni otras funciones administrativas.
2. **Cardinalidad:** un vendedor → muchas farmacias (modelo representante de zona). Las farmacias que él mismo da de alta.
3. **Alta del vendedor:** self-service, protegida por un **código de alta** (secreto que Natufarma le da solo a sus vendedores reales). No hay asignación por un admin central.
4. **Las farmacias las crea el vendedor** (no las elige de una lista predefinida). Esto reemplaza la asignación central: el vendedor visita la farmacia, la suma, y queda asociada a él automáticamente.
5. **Estado del premio simplificado:** el vendedor solo marca **"Entregado"**. El canje nace como pendiente y el vendedor lo pasa a entregado (un solo paso, sin estados intermedios).
6. **Dos vendedores podrían crear/manejar la misma farmacia:** no se bloquea (escenario poco probable, porque cada uno crea las suyas). Se puede endurecer después si hace falta.
7. **Las farmacias de prueba actuales se borrarán** (son datos de prueba en producción). No hay que soportar coexistencia a largo plazo con farmacias "sin vendedor".

## Modelo de datos

**Cambios en el esquema Supabase (una migración SQL nueva):**

- `profiles.role`: ampliar el `check` para aceptar `'vendor'` → `check (role in ('employee','admin','vendor'))`.
- **Nueva tabla `vendor_pharmacies`** — vincula un vendedor con sus farmacias (uno a muchos):
  - `vendor_id uuid` → `references profiles(id) on delete cascade`
  - `pharmacy_id uuid` → `references pharmacies(id) on delete cascade`
  - `created_at timestamptz not null default now()`
  - `unique (vendor_id, pharmacy_id)` (evita duplicados)
  - índices por `vendor_id` y por `pharmacy_id`.
- `pharmacies`: sin cambios de columnas (hoy: `id`, `name`). El vendedor inserta filas nuevas.
- `redemptions.status`: sin cambios (ya existe `'requested' | 'approved' | 'delivered'`). El vendedor lleva un canje a `'delivered'`.

**Relación clave para "los premios de mis farmacias":**
`redemptions.user_id` → `profiles.pharmacy_id` → `pharmacy` → `vendor_pharmacies` → `vendor`.
Un vendedor gestiona los canjes de los empleados cuya `pharmacy_id` esté entre las farmacias de su `vendor_pharmacies`.

## Autenticación y autorización

- El vendedor usa **Supabase Auth (email + password)**, el mismo sistema que los empleados. NO usa el panel `/admin` (que se abre con una contraseña compartida y no identifica al usuario).
- **Registro de vendedor:** además de nombre/email/contraseña, pide el **código de alta** (`VENDOR_SIGNUP_CODE`, variable de entorno en Vercel). El servidor valida el código antes de crear el perfil con `role = 'vendor'`.
- **Área propia `/vendedor`:** autenticada por la sesión de Supabase del vendedor. Un empleado (role `employee`) no puede entrar; un vendedor sí.
- **Autorización de escrituras (patrón ya usado en la app):** toda escritura sensible pasa por **Route Handlers server-side con la service role key**, que validan:
  1. que el usuario tenga `role = 'vendor'`, y
  2. que la farmacia objetivo (al marcar un premio entregado) pertenezca al vendedor (`vendor_pharmacies`).
  Un vendedor no puede tocar premios de una farmacia que no es suya, aunque fuerce la request.
- **RLS:** se agregan políticas de LECTURA scopeadas para el rol vendor (ver sus farmacias, y las redemptions de los empleados de sus farmacias) y un helper `is_vendor()`. Las ESCRITURAS críticas se hacen por route handler con el admin client (consistente con cómo la app ya otorga puntos y registra canjes). El detalle fino de RLS vs. route se cierra en el plan de implementación.

## Flujos y pantallas

1. **Registro de vendedor** (`/vendedor/registro` o equivalente): nombre, email, contraseña y **código de alta**. Crea el `profile` con `role = 'vendor'`.
2. **Área del vendedor** (`/vendedor`):
   - **Mis farmacias:** lista de las farmacias del vendedor + botón **"Agregar farmacia"** (pide el nombre) → crea la fila en `pharmacies` y la vincula en `vendor_pharmacies`. A partir de ahí, los empleados de esa farmacia la ven en el selector de registro.
   - **Premios:** lista de los canjes pendientes de los empleados de sus farmacias, mostrando **empleado + farmacia + premio** (usando `claimLabel`), con botón **"Marcar entregado"**.
   - **Ranking:** reutiliza la pantalla de ranking existente (no se reinventa).
3. **Registro de empleado:** SIN cambios. Sigue eligiendo su farmacia de la lista, que ahora incluye las creadas por vendedores.

## Seguridad y validaciones

- Código de alta requerido para registrarse como vendedor (evita que el público se haga pasar por vendedor).
- El servidor valida en cada escritura la pertenencia farmacia ↔ vendedor.
- Un vendedor no ve ni gestiona premios de farmacias que no dio de alta.
- El vendedor solo tiene acceso de lectura al ranking/farmacias (igual que cualquier usuario logueado).

## Fuera de alcance (YAGNI — para más adelante)

- Panel central para que un admin de Natufarma asigne o revoque vendedores.
- Que un vendedor "adopte" una farmacia existente creada por otro.
- Gestión de empleados por parte del vendedor (alta/baja/edición).
- Estados intermedios del premio (`approved`): por ahora solo "entregado".
- Edición/borrado de farmacias por el vendedor.
- Borrado de las farmacias de prueba: es una **tarea de datos aparte**, a ejecutar con cuidado en producción y confirmando antes qué se elimina.

## Migración / configuración

- **Migración SQL nueva** (siguiendo el patrón de `supabase/migration-00X-*.sql`): amplía `profiles.role`, crea `vendor_pharmacies` + índices + RLS + helper `is_vendor()`.
- **Variable de entorno** `VENDOR_SIGNUP_CODE` en Vercel (todos los entornos).
- Aplicar la migración a la base (preview/producción) como parte del deploy.

## Riesgos y notas

- Dos vendedores podrían gestionar la misma farmacia si ambos la crean/vinculan. Aceptado por ahora (cada uno crea las suyas). Endurecible con un `unique (pharmacy_id)` si se decide 1 farmacia = 1 vendedor.
- El borrado de farmacias de prueba en producción arrastra empleados/canjes de prueba asociados: se hace con confirmación explícita, fuera de este feature.
