# Flujo de trabajo — Misión Geneo

Cómo iterar la app **sin romper producción**. Leer antes de tocar código o datos.

---

## Regla de oro

**`main` es PRODUCCIÓN. Nunca se commitea directo a `main`.**

Todo cambio va en una rama, se prueba en su **preview** (contra la base de
staging) y recién entra a `main` vía **Pull Request**.

---

## Los dos entornos

| Rama | Entorno Vercel | Base de datos | URL |
|------|----------------|---------------|-----|
| `main` | **Production** | Supabase **producción** (datos reales) | la app real |
| cualquier otra (`staging`, `feat/*`, `fix/*`) | **Preview** | Supabase **staging** (datos de prueba) | URL de preview única por rama |

La separación la hacen las **variables de entorno en Vercel**, scopeadas por
entorno:

- **Production** → `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY`
  de la base **real**.
- **Preview** → las mismas tres variables, pero con los valores de la base de
  **staging**.

> Por eso una prueba en preview **nunca toca los datos reales**: apunta a otra base.

---

## El flujo del día a día

```
1. git checkout main && git pull          # partir de lo último de producción
2. git checkout -b fix/lo-que-sea          # rama nueva
3. (hacés el cambio) + commit
4. git push -u origin fix/lo-que-sea       # Vercel genera una URL de preview
5. probás en la URL de preview             # usa la base de STAGING
6. abrís un Pull Request hacia main        # queda el review del Gentleman
7. merge a main                            # se despliega solo a PRODUCCIÓN ✅
```

`staging` es una rama larga que sirve de "cancha de pruebas" permanente; para
cambios puntuales, ramas cortas `feat/*` o `fix/*` está perfecto.

---

## Base de datos y migraciones

Hay **dos proyectos de Supabase**: producción y staging. El esquema tiene que
mantenerse igual en las dos.

- **Base nueva desde cero** (p. ej. recrear staging): correr
  `mision-geneo/supabase/setup-completo.sql` en el SQL Editor. Reproduce el
  esquema completo (tablas, funciones, triggers, RLS).
- **Cambio de esquema** (una migración nueva): crear el `.sql` en
  `mision-geneo/supabase/`, correrlo **primero en staging** (probar), y cuando el
  PR se mergea a producción, correrlo **también en la base de producción**.
- **Vaciar producción para el lanzamiento**: `supabase/RESET-a-cero.sql`
  (irreversible — solo cuando se arranca en serio).

> Config de Auth en cada base: **"Confirm email" apagado** (registro con
> cualquier email, igual que producción).

---

## Reglas para testear

- **Empleado y vendedor en sesiones de navegador SEPARADAS.** Comparten el login
  de Supabase; en el mismo navegador (o dos ventanas de incógnito, que Chrome
  trata como una sola) las sesiones se pisan y el progreso se guarda bajo el
  usuario equivocado. Usar: ventana normal + incógnito, o dos navegadores
  distintos. El admin usa login aparte y no colisiona.
- Probar siempre en la **URL de preview** (base de staging), nunca contra
  producción.

---

## Notas

- Las **misiones y premios** viven en el código (`lib/missions.ts`,
  `lib/prizes.ts`), no en la base. La base guarda progreso y canjes.
- Antes de cada merge a `main` corre un **review de diseño automático**
  (Gentleman) sobre los archivos de código. Es un filtro, no un obstáculo.
- Los **secretos** (`SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `VENDOR_SIGNUP_CODE`)
  viven SOLO en Vercel, nunca en el código ni commiteados.
