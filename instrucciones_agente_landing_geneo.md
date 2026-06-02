# Prompt / Skill para Agente de IA: Desarrollo de Landing Page "Geneo"

## 1. Contexto y Rol
Actúa como un desarrollador Frontend Senior experto en UI/UX y pixel-perfect design. Tu objetivo es construir una landing page completa y altamente conversional para una marca de suplementos de belleza ("Geneo"). 
El código debe ser modular, limpio y escalable, pensado para ser iterado mediante comandos directos (vibecoding). No asumas estilos por defecto; respeta estrictamente el sistema de diseño y la estructura detallada a continuación.

## 2. Stack Tecnológico Sugerido
- **Framework:** React / Next.js
- **Estilos:** Tailwind CSS (preferido para iteración rápida) o CSS Modules.
- **Animaciones:** Framer Motion (para transiciones suaves y microinteracciones).
- **Iconografía:** Lucide React o Heroicons.

## 3. Sistema de Diseño (Design System)

### Colores
- **Primario (Brand):** Magenta intenso (Ej. `#E6005C` o similar). Usar para botones, textos destacados y fondos de banners.
- **Fondo Principal:** Blanco (`#FFFFFF`).
- **Fondos Secundarios:** Gris extra claro (`#F7F7F9`) para secciones que necesitan contraste suave.
- **Texto Principal:** Gris oscuro casi negro (`#1A1A1A`).
- **Texto Secundario:** Gris medio (`#666666`).
- **Footer:** Gris muy oscuro / Negro carbón (`#222222`).

### Tipografía
- **Fuente Principal:** Sans-serif geométrica y moderna (Ej. Montserrat, Poppins o Inter).
- **Jerarquía:**
  - `H1`: Extragrande, negrita, tracking ajustado. Letras mayúsculas para impacto.
  - `H2/H3`: Grandes, semi-negrita, uso de color primario en palabras clave.
  - `Body`: Tamaño legible (16px - 18px), peso regular, excelente interlineado (leading) para facilitar la lectura.
- **Nota de Diseño:** Aplica un uso generoso del espacio negativo (whitespace) entre secciones y dentro de las tarjetas para mantener una estética minimalista y premium.

---

## 4. Estructura de Componentes (Sección por Sección)

### 4.1. Navbar (Cabecera)
- **Posición:** Fija en la parte superior (sticky/fixed), fondo transparente que transiciona a blanco sólido al hacer scroll.
- **Contenido:**
  - Izquierda: Logo "Geneo".
  - Centro: Enlaces de navegación (PRODUCTOS, RITUALES, CIENCIA, RESULTADOS, DÓNDE COMPRAR). Texto en mayúsculas, tamaño pequeño, tracking amplio.
  - Derecha: Iconos (Búsqueda, Usuario, Carrito).

### 4.2. Hero Section
- **Fondo:** Imagen de ancho completo (full-width) de una mujer sonriendo, con un overlay sutil si es necesario para legibilidad.
- **Layout:** Contenido alineado a la izquierda.
- **Elementos:**
  - Titular (H1): "LA BELLEZA EMPIEZA ADENTRO Y SE CELEBRA AFUERA" (La palabra "AFUERA" en magenta).
  - Subtítulo: Texto breve.
  - Botón (CTA): Magenta sólido, texto blanco "ENCONTRÁ TU RITUAL" con flecha.
  - Inferior: 3 badges/íconos de confianza en línea horizontal (Ciencia, Ingredientes, Resultados).
  - Derecha: Imagen del producto principal (pouch magenta) flotando o superpuesta sutilmente.

### 4.3. Sección "Nuestros Rituales" (Productos)
- **Fondo:** Gris extra claro.
- **Título:** "NUESTROS RITUALES" ("RITUALES" en magenta).
- **Grid:** 4 columnas en desktop, 1 o 2 en móvil.
- **Cards de Producto:**
  - Imagen del producto (con sombra suave).
  - Título en mayúsculas (Ej. "PIEL SALUDABLE").
  - Descripción breve (2 líneas).
  - Enlace "CONOCER MÁS ->" en color primario.

### 4.4. Sección Interactiva "Encontrá tu Ritual"
- **Layout:** Dividido en 2 grandes bloques.
- **Bloque Izquierdo:** Título, texto descriptivo y botón de "COMENZAR ->".
- **Bloque Derecho (Simulador UI):**
  - Dos columnas simulando pasos: "01 ¿Qué querés potenciar?" y "02 ¿Qué te gustaría notar primero?".
  - Opciones presentadas como píldoras/botones con bordes redondeados.
  - Tarjeta de resultado a la derecha: "TU RITUAL: Glow", con recomendación de productos y una línea de tiempo (20, 40, 90 días).

### 4.5. Sección Timeline / Resultados
- **Fondo:** Degradado magenta a violeta/rosa claro, con imagen de rostro de mujer en el borde derecho.
- **Título:** "TU PIEL NO CAMBIA DE UN DÍA PARA OTRO, PERO SÍ CAMBIA CON CONSTANCIA." (Letras blancas o de alto contraste).
- **Timeline:**
  - Línea horizontal con 3 nodos: "+ 20 DÍAS", "+ 40 DÍAS", "+ 90 DÍAS".
  - Cada nodo tiene un icono (gota, destello, escudo) y texto descriptivo corto.

### 4.6. Sección Ciencia e Ingredientes
- **Fondo:** Blanco.
- **Layout:** Grid asimétrico.
- **Izquierda:** Título "CIENCIA QUE NUTRE TU PIEL" y párrafo explicativo.
- **Derecha:** Dos bloques circulares o imágenes destacadas superpuestas.
  - 1: Colágeno Hidrolizado (imagen de líquido rosa) con texto.
  - 2: Coenzima Q-10 (imagen de líquido transparente) con texto.
- **Enlace inferior:** "COMPUESTOS ACTIVOS AVANZADOS ->".

### 4.7. Sección Testimonios
- **Fondo:** Gris extra claro.
- **Título:** "ELLAS YA VIVEN SU RITUAL" ("SU RITUAL" en magenta).
- **Carrusel:** Grid de 3 tarjetas de testimonio (con flechas de navegación a los lados).
- **Card de Testimonio:**
  - Foto circular del usuario a la izquierda.
  - Nombre, Edad, Estrellas de calificación (5 estrellas magenta) y cita breve en cursiva o texto regular.

### 4.8. Banner de Suscripción
- **Fondo:** Magenta sólido (`#E6005C`). Texto en blanco.
- **Layout:** Flexbox horizontal.
- **Izquierda:** Imagen de producto (Pouch + Taza con texto "Tu ritual todos los días").
- **Centro/Derecha:** - Título: "TU RITUAL, SIN INTERRUPCIONES".
  - Grid de 4 íconos con beneficios (15% OFF, Envío gratis, Recordatorios, Cancelá cuando quieras).
  - Botón (CTA): Fondo blanco, texto magenta "SUSCRIBITE AHORA ->".

### 4.9. Sección Dónde Comprar
- **Fondo:** Blanco.
- **Contenido:** Layout horizontal.
- Título a la izquierda: "¿DÓNDE COMPRAR?".
- Centro: 3 columnas con íconos (Farmacias Aliadas, Compra Online, Mercado Libre).
- Derecha: Botón con borde (outline), texto primario "VER PUNTOS DE VENTA ->".

### 4.10. Footer
- **Fondo:** Gris muy oscuro/Negro.
- **Contenido:**
  - Logo blanco a la izquierda.
  - Enlaces en línea en el centro (NATUFARMA, INSTITUCIONAL, PREGUNTAS FRECUENTES, CONTACTO).
  - Redes sociales a la derecha (Instagram, TikTok, Facebook).
  - Texto legal en la parte más inferior, muy pequeño y con baja opacidad.

---

## 5. Reglas de Ejecución Críticas
1. **No uses placeholders genéricos para las imágenes si puedes usar divs con colores de fondo y proporciones correctas** (aspect-ratio) para mantener la estructura visual antes de integrar los assets finales.
2. **Responsive First:** Todas las secciones deben colapsar elegantemente en móvil (ej. el grid de productos pasa a 1 columna, los testimonios se vuelven un slider horizontal con scroll).
3. **Manejo de Espacios:** Presta extrema atención al `padding` y `margin`. Usa una escala consistente (ej. clases de Tailwind como `py-20` para secciones completas y `gap-8` para grids). El diseño respira a través de sus márgenes.
