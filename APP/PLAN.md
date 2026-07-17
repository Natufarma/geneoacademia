# Plan — Web App "Misión Geneo" (Geneo Farmacias)

> Basado en la propuesta estratégica de Lakhu (4 láminas en `APP/`).
> Fecha: 2026-07-17. Estado: borrador para revisión.

---

## 1. Qué vamos a construir

Una **web app (PWA)** para farmacias aliadas y sus empleados, que implementa el
ecosistema propuesto en tres etapas:

| Etapa | Nombre | Qué es | ¿Entra en la app? |
|-------|--------|--------|-------------------|
| 1 | **Misión Geneo** | Experiencia gamificada de ~5 min: misiones, puntos, certificado de Especialista Geneo | ✅ MVP |
| 2 | **Academia Geneo** | Plataforma permanente: nuevas misiones, contenido científico, certificaciones, niveles, campañas | ✅ Fase 2 (la arquitectura del MVP ya la contempla) |
| 3 | **Espacio Geneo** | Identidad física en el punto de venta (exhibidores, vinilos, QR) | ❌ Es gráfica/producción física. La app solo aporta el **QR de acceso** |

**Decisión clave: web app instalable (PWA), NO app nativa.**
Las láminas muestran badges de App Store / Google Play, pero una PWA es la
elección correcta acá y hay que comunicárselo al cliente:

- El flujo de entrada es **escanear un QR en la farmacia** → una URL abre al
  instante; obligar a descargar una app de store mata la conversión de un
  programa de 5 minutos.
- Sin costos ni demoras de publicación en stores (cuentas, revisiones, updates).
- Instalable igual ("Agregar a pantalla de inicio"), con ícono y pantalla completa.
- Si más adelante quieren stores, se empaqueta la misma PWA (Capacitor/TWA)
  sin rehacer nada.

---

## 2. Usuarios y roles

1. **Colaborador (empleado de farmacia)** — el usuario principal. Se registra,
   completa misiones, suma puntos, canjea premios, registra ventas, obtiene su
   certificado de Especialista Geneo.
2. **Farmacia (aliada)** — entidad a la que pertenecen los colaboradores.
   Acumula puntos agregados de su equipo y compite en el ranking mensual.
   Opcional fase 2: un rol "responsable de farmacia" que ve el desempeño de su equipo.
3. **Admin Natufarma/Lakhu** — panel de administración: alta de farmacias,
   creación/edición de misiones, catálogo de premios, aprobación de canjes,
   validación de ventas, métricas de sell-out, gestión de sorteos.

---

## 3. Funcionalidades (según los mockups de Lakhu)

### MVP — Etapa 1 "Misión Geneo"

**Onboarding**
- Acceso por QR (cada farmacia tiene su QR con código propio → el registro
  queda asociado a esa farmacia automáticamente).
- Registro simple: nombre, email o celular, farmacia (precargada por el QR).
- Pantalla de bienvenida "Convertite en Especialista Beauty Wellness".

**Misiones (el corazón de la app)** — el viaje de 6 misiones de la lámina final:
1. **Inicio** — bienvenida al programa y cómo funciona.
2. **ADN Geneo** — quiz: ¿cuál es el eje del relanzamiento? (Ciencia / Ritual / Belleza).
3. **Recomendación** — caso de cliente (ej. "Camila, 38") → elegir el Geneo indicado
   (Piel Saludable / Beauty / Solar / 45+).
4. **Tiempo** — los resultados llegan con constancia: 20 → 40 → 90 días.
5. **Ingredientes** — juego de arrastrar: Colágeno hidrolizado → estructura dérmica,
   Coenzima Q10 → energía celular.
6. **Desafío final** — evaluación integradora.

Cada misión: contenido breve + interacción (quiz, selección, drag & drop) +
puntos por acierto. Al completar todas: **animación "¡Misión cumplida!"**,
insignia y **certificado digital personalizado** (nombre + farmacia, descargable
PDF/imagen para compartir → #PielSaludable).

**Puntos y niveles**
- Puntos por misión (100/200/…, total de referencia: 300–980 pts según lámina).
- Niveles de Especialista Geneo (Nivel 1, 2, …) — la lámina muestra "Nivel 2,
  siguiente nivel: 1000 pts".
- Historial de puntos en el perfil.

**Medición por compras de la farmacia** (definido con el cliente 2026-07-17)
- En esta primera etapa NO hay registro de ventas por parte de los empleados:
  la medición comercial se hace con las **compras que la farmacia le hace a
  Natufarma** (sell-in), cargadas desde el panel admin.
- El foco individual del empleado es **capacitarse y obtener el certificado**.
- El módulo "Escanear venta" de los mockups queda para una fase posterior,
  si Natufarma lo pide (el modelo de datos ya lo contempla).

**Recompensas**
- Catálogo de premios canjeables por puntos (neceser, taza, shaker…).
- Canje → queda "pendiente de entrega" → admin lo gestiona.
- Premio inmediato al certificarse: kit de muestras Geneo 45+ (envío a la farmacia).
- Sorteos mensuales entre participantes.

**Ranking mensual de farmacias**
- Tabla por puntos agregados del equipo (oro/plata/bronce + posición propia
  resaltada, como en el mockup).
- Reset o corte mensual con historial.

**Perfil**
- Foto, nombre, farmacia, nivel, puntos, ventas registradas.
- Historial de misiones, premios canjeados, mis ventas, certificados.

**Productos / Rituales**
- Catálogo de consulta rápida: Ritual Glow, Ritual Verano, Ritual 45+ y los
  4 productos — material de apoyo para recomendar en el mostrador.
  (Se reutiliza contenido y fotos de la landing.)

**Panel Admin (mínimo viable)**
- ABM de farmacias (genera el QR único de cada una).
- ABM de premios y stock.
- Gestión de canjes (aprobar / marcar entregado).
- Revisión/validación de ventas registradas.
- Métricas: registrados, misiones completadas, certificados, ventas, ranking.
- Export CSV.

### Fase 2 — "Academia Geneo"

La diferencia con el MVP NO es técnica, es de contenido y administración:
- **Editor de misiones** en el admin (hoy las 6 misiones pueden ir "hardcodeadas"
  como contenido estructurado; en fase 2 el admin crea misiones nuevas sin código).
- Módulos de contenido científico (video, artículos, PDF).
- Certificaciones múltiples y niveles superiores.
- Campañas por temporada (ej. "Misión Verano" con Solar).
- Notificaciones push (PWA lo soporta) para nuevas misiones/campañas.
- Rol "responsable de farmacia" con vista de equipo.

**Implicancia arquitectónica**: desde el día 1 las misiones se modelan como
DATOS (tabla `missions` + `mission_steps` con tipos de interacción), no como
pantallas fijas. Así la Academia es "agregar filas", no reescribir la app.

---

## 4. Arquitectura técnica recomendada

### Stack

| Capa | Elección | Por qué |
|------|----------|---------|
| Frontend | **Next.js 16 + React 19 + Tailwind 4 + Framer Motion** | Mismo stack de la landing: se reutiliza el sistema visual (rosa/magenta editorial), componentes, fotos y know-how ya construido |
| PWA | manifest + service worker (next-pwa o manual) | Instalable, offline básico, push en fase 2 |
| Backend | **Supabase** (Postgres + Auth + Row Level Security + Storage) | Auth lista (email/OTP por celular), base relacional para puntos/ranking, storage para certificados y fotos, panel SQL para soporte. Evita construir un backend a medida |
| Hosting | **Vercel** (proyecto separado: `geneo-mision`) | Ya es el flujo de trabajo del proyecto; esta app SÍ necesita servidor (no export estático como la landing en Ferozo) |
| Certificados | Generación server-side (ruta API que compone el PDF/PNG con nombre + farmacia) | |
| Escaneo QR/código de barras | Librería JS de cámara (`html5-qrcode` o BarcodeDetector API) | Funciona en PWA sin app nativa |

**Alternativa considerada**: backend propio (NestJS/Express + Postgres).
Más control, pero más tiempo y costo de mantenimiento. Para un programa de
fidelización de este tamaño, Supabase resuelve auth + datos + storage en una
fracción del esfuerzo. Si el día de mañana Natufarma exige infraestructura
propia, el modelo de datos es Postgres estándar y se migra.

### Modelo de datos (núcleo)

```
pharmacies      id, name, code (para el QR), city, active
users           id, pharmacy_id, name, email/phone, role (collaborator|manager|admin), level, avatar_url
missions        id, title, slug, order, points_total, active, campaign_id?
mission_steps   id, mission_id, order, type (content|quiz|match|drag), payload (jsonb), points
progress        user_id, mission_id/step_id, status, score, completed_at
sales           id, user_id, pharmacy_id, product_code, source (scan|manual), status (pending|approved|rejected), points, created_at
points_ledger   id, user_id, pharmacy_id, delta, reason (mission|sale|bonus|redeem), ref_id, created_at
rewards         id, name, image, points_cost, stock, active
redemptions     id, user_id, reward_id, status (requested|approved|delivered), created_at
certificates    id, user_id, type, file_url, issued_at
campaigns       id, name, starts_at, ends_at   (fase 2)
```

Regla de oro: **los puntos SIEMPRE salen del ledger** (libro mayor append-only).
El ranking mensual y el "nivel" se calculan desde ahí — nunca un contador
suelto que se desincroniza.

### Seguridad / anti-trampa (importante en gamificación con premios)

- RLS: cada colaborador solo ve/escribe lo suyo; farmacia solo lo de su equipo.
- Validación de misiones server-side (los puntos los otorga el servidor, no el cliente).
- Ventas: entran como `pending` y suman puntos al aprobarse (o auto-aprobación
  con límites: máx. N ventas/día, detección de códigos repetidos).
- Rate limiting en registro y carga de ventas.

---

## 5. Roadmap propuesto

### Fase 0 — Definiciones (con Natufarma/Lakhu) · 1 semana
Cerrar los puntos abiertos de §6. Sin esto no se puede construir el sistema
de puntos ni el de ventas.

### Fase 1 — MVP "Misión Geneo" · 4–6 semanas
1. **Semana 1**: setup proyecto, Supabase, modelo de datos, auth por QR de
   farmacia + registro. Design system portado de la landing.
2. **Semanas 2–3**: motor de misiones (los 4 tipos de interacción) + las 6
   misiones cargadas + puntos + animación de misión cumplida + certificado.
3. **Semana 4**: perfil, recompensas y canjes, ranking mensual, catálogo de rituales.
4. **Semana 5**: carga de compras de farmacias (sell-in) en el admin, panel admin mínimo.
5. **Semana 6**: PWA (manifest, íconos, offline), QA en teléfonos reales de
   gama baja (misma exigencia que la landing), carga de datos reales, deploy.

**Piloto recomendado**: lanzar con 5–10 farmacias antes del rollout general —
el sistema de ventas y canjes SIEMPRE revela sorpresas operativas.

### Fase 2 — "Academia Geneo" · post-piloto
Editor de misiones en admin, campañas, push notifications, contenido
científico, niveles avanzados, vista de responsable de farmacia.

---

## 6. Puntos abiertos que DEBE definir el cliente

Estos no son técnicos — son reglas de negocio y legales:

1. ~~Validación de ventas~~ → **RESUELTO (2026-07-17)**: en la etapa 1 la
   medición es por compras de la farmacia a Natufarma (sell-in), no por ventas
   individuales de empleados. El escaneo de ventas queda para más adelante.
2. **Tabla de puntos definitiva**: puntos por misión, por venta, umbrales de
   nivel (las láminas mezclan 300 y 980 pts totales — hay que unificar).
3. **Premios y logística**: catálogo real, stock, quién entrega (¿distribuidor?).
4. **Sorteos mensuales**: bases y condiciones, requisitos legales de promociones
   en Argentina (hay regulación específica de sorteos).
5. **Datos personales**: registro con email o celular; consentimiento y política
   de privacidad (los empleados son personas físicas → Ley 25.326).
6. **Identidad del registro**: ¿registro libre con QR de la farmacia o alta
   controlada (Natufarma precarga farmacias y valida empleados)? Recomiendo QR
   libre + validación del admin para evitar fricción sin perder control.
7. **Dominio**: ¿subdominio de la web actual (ej. `mision.geneo.com.ar`) o propio?

---

## 7. Qué se reutiliza de lo ya construido

- **Sistema visual completo** de la landing (paleta magenta, tipografía, estética
  editorial) → coherencia total con la marca relanzada.
- **Fotos y contenido de productos/rituales** (Ritual Glow, Verano, 45+) ya
  producidos para la web.
- **Flujo de deploy** en Vercel con la cuenta Mattdapp.
- Los textos científicos (colágeno, Q10, 20/40/90 días) ya redactados → son la
  materia prima de las misiones 3, 4 y 5.
