# Changelog — Landing Lion Tech Venezuela

← [Volver al índice](README.md)

Registro de cambios del sitio. **Anota aquí cada cambio publicado**, aunque sea
pequeño: es lo que evita que dentro de tres meses nadie recuerde por qué algo está
como está.

**Formato:** el más reciente arriba. Fecha en `AAAA-MM-DD`.

**Etiquetas:** `Añadido` · `Cambiado` · `Corregido` · `Eliminado` · `Contenido` ·
`Rendimiento` · `SEO` · `Accesibilidad`

---

## 2026-09-22 — Corrección de Auditoría Técnica

**Cambiado**
- Se restauró el nombre de `index.html` desde `LionTech.html` (Requerimiento para Cloudflare).
- Se modificó la imagen Hero LCP, reemplazando el archivo sin optimizar `IMG_3923.PNG` por `hero-team-2026.webp` optimizado (169KB) con `width` y `height` explícitos.
- Se cambió el endpoint de los mapas interactivos a OpenStreetMap Standard, garantizando cumplimiento sin API key.
- Se cambió el color del botón CTA de coral `#FF5E3A -> #FF9040` a azul `#0284c7 -> #0369a1` (Decisión de diseño en el sprint previo).
- Contenido: El nombre de la sede principal se actualizó de "Guarida Principal" a "Tienda Av. Casanova".

**Corregido**
- Se removió el BOM del archivo `lion-tech-care.html` asegurando codificación UTF-8 estricta.
- Historial del changelog restaurado (nombres originales en fechas pasadas).

**Eliminado**
- Se eliminó la cuarta métrica de empresa ("Always Lion Tech"), dejando 3.
- Se eliminó el emoji de agradecimiento.

**Añadido**
- Etiqueta SEO `<meta name="robots" content="noindex, follow">` en `en-construccion.html`.
- Se añadieron múltiples scripts de automatización Python y PowerShell, los cuales fueron movidos a la carpeta local `_dev/` excluyéndolos de producción.

**Rendimiento**
- Se agregó el atributo `preload="none"` en el video preloader para anular la descarga compulsiva de 7.8MB.

---

## 2026-09-21 — Reestructuración y Optimizaciones

**Cambiado**
- El archivo principal `index.html` fue renombrado a `LionTech.html` para fortalecer el branding. Todos los enlaces internos fueron actualizados.
- Se reemplazó el proveedor de mapas (CartoDB/OSM) por **Google Maps** directo a través de Leaflet para solventar errores de API KEY.
- Se optimizó el hero recortando con máscara de opacidad los bordes duros e integrándolo armónicamente con el fondo radial.

**Corregido**
- Comportamiento y estilo de la sección de marcas en `en-construccion.html` (remoción de tarjetas estáticas).
- Metadatos y etiquetas SEO en la página de Care+ optimizadas (147 caracteres para mejorar despliegue en Google).

**Añadido**
- `favicon-liontech.png` recortado para visualización perfecta a 128x128 píxeles en alta resolución y ligado adecuadamente al `<head>`.

**Rendimiento**
- Optimización masiva del Preloader de video: Se eliminó el retraso exagerado (de 6.5s a 1.8s). Ahora también guarda un registro en `sessionStorage` para mostrarlo únicamente en la primera visita de la sesión, dejando de bloquear cargas posteriores.

---

## [Sin publicar]

_Anota aquí los cambios en curso antes de subirlos._

- Nada pendiente.

---

## 2026-08-08 — Documentación técnica

**Añadido**

- Documentación técnica completa en `docs/`: arquitectura, sistema de diseño,
  JavaScript, contenido y datos, guía de mantenimiento, auditoría y roadmap.

_(Este cambio no toca el sitio: solo añade documentación.)_

---

## Historial reconstruido

> Las entradas siguientes están **reconstruidas a partir de las fechas de los archivos
> y del contenido del código**, no de un registro real. Son aproximadas y se incluyen
> para dar contexto. A partir de ahora, anota los cambios en el momento de hacerlos.

### 2026-08-06 — Versión actual de `index.html`

**Cambiado**

- `index.html` pasa de 144.131 a 155.859 bytes.
- Se añade la carpeta `images/hero/` con `equipo-cutout.webp` (392 KB) y
  `tienda-fondo.webp` (470 KB).
- Se rediseña el hero: de rejilla de dos columnas con especificaciones técnicas a
  **composición asimétrica fotográfica** con máscaras, glows y parallax del logo.
- Se añade `images/LogoBlanco-footer.png`.

**Eliminado del marcado**

- Bloque de etiquetas y barra de especificaciones del hero (`.hero__tag-group`,
  `.hero__spec-bar`, `.spec-item`) — el CSS de esas clases **quedó en el archivo** y
  hoy es código muerto.
- `.allies-stats`, `.ally-card__index`, `.brand-texture-bg`, `.info-box`,
  `.info-stats`, `.navbar__inner`, `.footer__logo-badge`, `.hero-logo-wrapper`.

**Añadido**

- Carrusel «Nuestra Esencia y Propósito» (`.about-carousel`, 2 diapositivas).
- Menú lateral colapsable (`.menu-toggle` + `.sidenav`), en sustitución de la barra de
  navegación fija.
- Preloader de vídeo (`#preloader` + `body.is-preloading`).
- Fundido inferior del hero e indicador «Desliza abajo».

### 2026-08-06 (más temprano) — `Preload.MP4` sustituido

**Rendimiento** ⚠️

- El archivo `Preload.MP4` pasa a pesar **7.813.626 bytes**. El comentario de la línea
  14 sigue diciendo *«ya optimizado: ~165 KB»*, lo que indica que la sustitución no
  fue intencional o no se revisó.
  → Ver [06-AUDITORÍA P-01](06-AUDITORIA.md)

### 2026-08-05 — Copia de la carpeta

**Añadido**

- Se crea la subcarpeta `Landing HTML/` con una copia del proyecto. Queda congelada en
  el estado del 05-ago y hoy es una fuente de confusión.
  → Ver [05-GUÍA § 8.1](05-GUIA-DE-MANTENIMIENTO.md)

### 2026-08-05 — Retirada de la demo 3D

**Eliminado**

- Se retira del marcado la sección `#demo3d` (showcase 3D en scroll con iPhone y
  accesorios generados por código con Three.js).
- Se eliminan los tres `<script src>` que la cargaban (`gsap.min.js`,
  `ScrollTrigger.min.js`, `three.min.js`). `vendor/GLTFLoader.js` nunca llegó a
  cargarse por etiqueta.
- La versión anterior se conserva en `index-RESPALDO-original.html` (con la sección y
  los scripts intactos, líneas 2470 y 3636–3638).

**Sin eliminar (quedan huérfanos)**

- `demo3d.js` (55 KB), `modelo-iphone.js` (1,04 MB), `logo-b64.js` (89 KB) y la
  carpeta `vendor/` completa (Three.js, GSAP, ScrollTrigger, GLTFLoader — 795 KB).

### 2026-08-04 — Fotos del equipo

**Contenido**

- Se añaden `images/equipo/equipo-1.jpg` … `equipo-6.jpg` (800 × 1000, ~88 KB cada
  una) y el carrusel del equipo con autoplay de 4,5 s.

### 2026-08-03 — Rediseño de Ubicación

**Cambiado**

- La sección de ubicación se rehace al menos tres veces (los tres bloques de
  comentario consecutivos de las líneas 2000–2008 son el rastro).
- Se pasa de una captura estática (`mapa-ubicacion.jpg`, hoy huérfana) a un
  `<iframe>` de Google Maps en vivo generado desde las coordenadas.

### 2019 — Fundación

- Lion Tech Venezuela se funda en Caracas. Primera sede: Oficina Principal, entre el
  Blvd. de Sabana Grande y la Av. Casanova.

---

## Plantilla para nuevas entradas

```markdown
## AAAA-MM-DD — Título corto del cambio

**Añadido**
- …

**Cambiado**
- …

**Corregido**
- …

**Eliminado**
- …

**Archivos tocados:** index.html (líneas ~X–Y), images/…
**Verificado en:** escritorio 1920 · tablet 768 · móvil 375
```
