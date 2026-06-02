# Code Review Rules — Tablanova

Reglas para la revisión automática de código (Gentleman Guardian Angel).
Stack: **React 18 + Vite + TypeScript + TailwindCSS v4**. Router: `react-router-dom`. Animaciones: `motion`. Iconos: `lucide-react`.

---

## TypeScript

- Usar `const`/`let`, nunca `var`.
- Evitar `any`. Si un cast es inevitable (ej. eventos DOM), tiparlo explícitamente (`as HTMLElement`) y acotarlo al uso mínimo.
- Tipar las props de componentes con `interface` o `type` explícito; nada de props implícitas.
- No dejar variables, imports ni props sin usar.
- Preferir narrowing y optional chaining (`?.`) antes que `!` non-null assertions.

## React

- Solo componentes funcionales con hooks. Nada de class components.
- **Named exports** para páginas y componentes (ej. `export const Footer = () => {...}`). Consistente con el resto del repo.
- Respetar las reglas de hooks: nada de hooks condicionales o dentro de loops.
- Listas renderizadas con `.map` deben usar una `key` estable (no el índice si los items pueden reordenarse).
- Efectos (`useEffect`) deben limpiar lo que crean (timeouts, listeners) y declarar bien sus dependencias.
- No es Next.js: **no** agregar la directiva `"use client"`.

## Estilos

- Paleta de marca fija (ver `CLAUDE.md`): bordeaux `#5E0F29`, mostaza `#DB8F33`, verde `#414B28`, beige `#F5F0E8`/`#E8DCC8`. No introducir colores fuera de la paleta sin justificación.
- Tailwind para layout/responsive; `style` inline aceptable para tokens de marca puntuales (patrón ya usado en el repo).
- Mobile-first: clases responsive (`sm:`, `md:`) en vez de breakpoints sueltos. Texto del cuerpo nunca menor a 16px en mobile.
- `border-radius` máximo 12px en cards, 8px en botones. Sin sombras con blur > 20px.

## Routing y assets

- Navegación interna con `<Link to="...">`, no `<a href>` para rutas internas.
- Links que apunten a una ruta o ancla que exista realmente en `App.tsx` / la página destino.
- Importar imágenes como módulos (`import img from '../../assets/...'`), no rutas string hardcodeadas.

## General

- No commitear `node_modules/`, `dist/`, ni artefactos locales (ya cubierto por `.gitignore`).
- No dejar `console.log` de debug ni código comentado muerto.
- Sin secrets, tokens ni credenciales hardcodeadas.
- Manejar estados de error/vacío en lo que consuma datos o entrada del usuario.

## Commits

- **Conventional commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`...).
- **Nunca** agregar atribución de IA ni `Co-Authored-By` en los mensajes de commit.
