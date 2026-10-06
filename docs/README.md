# Documentación técnica — Landing Lion Tech Venezuela

> **Estado del documento:** v1.0 · 08 de agosto de 2026
> **Auditado contra:** `LionTech.html` (155.859 bytes, 4.635 líneas, mtime 2026-08-06)
> **Responsable:** webmaster@liontechve.com

Esta carpeta es la documentación viva del proyecto. Cada afirmación está verificada
contra el código real y referenciada por número de línea, para que puedas comprobarla
y actualizarla cuando el código cambie.

---

## Índice

| Documento | Qué contiene | Cuándo actualizarlo |
|---|---|---|
| **[01-ARQUITECTURA.md](01-ARQUITECTURA.md)** | Stack, inventario de archivos, mapa de secciones, flujo de carga, despliegue | Al añadir/eliminar archivos o secciones |
| **[02-SISTEMA-DE-DISENO.md](02-SISTEMA-DE-DISENO.md)** | Tokens de color, tipografía, componentes CSS, breakpoints, animaciones | Al tocar el bloque `<style>` |
| **[03-JAVASCRIPT.md](03-JAVASCRIPT.md)** | Los 12 módulos JS, APIs del navegador, eventos, estado | Al tocar el bloque `<script>` |
| **[04-CONTENIDO-Y-DATOS.md](04-CONTENIDO-Y-DATOS.md)** | Inventario editable: 10 productos, 7 sedes, 3 aliados, teléfonos, redes | **Cada vez que cambie un dato de negocio** |
| **[05-GUIA-DE-MANTENIMIENTO.md](05-GUIA-DE-MANTENIMIENTO.md)** | Recetas paso a paso: añadir producto, sede, foto, cambiar colores | Al cambiar un procedimiento |
| **[06-AUDITORIA.md](06-AUDITORIA.md)** | Rendimiento, SEO, accesibilidad, 6 bugs reproducibles + 1 fragilidad latente, código muerto | Tras cada corrección |
| **[07-ROADMAP.md](07-ROADMAP.md)** | Plan priorizado con esfuerzo e impacto estimados | Al cerrar o añadir tareas |
| **[CHANGELOG.md](CHANGELOG.md)** | Historial de cambios del sitio | **En cada cambio publicado** |

---

## Resumen ejecutivo

### Qué es

Una **landing page corporativa de una sola página**, escrita a mano en HTML, CSS y
JavaScript puros. No hay framework, ni build, ni servidor de aplicación, ni base de
datos. Todo el sitio vive en un único archivo `LionTech.html` de 155 KB que contiene:

```
LionTech.html (4.635 líneas)
├── <head>          líneas    1 –   18   metadatos + Google Fonts
├── <style>         líneas   19 – 2.970  2.952 líneas de CSS (100 % del diseño)
├── <body>          líneas 2.973 – 3.851    879 líneas de marcado
└── <script>        líneas 3.852 – 4.635    784 líneas de JavaScript
```

Se puede abrir con doble clic (protocolo `file://`) y funciona: fue diseñado así a
propósito. La única dependencia externa es Google Fonts.

### Estado de salud

| Dimensión | Nota | Comentario |
|---|:---:|---|
| Arquitectura | 🟡 | Funciona y es simple, pero el archivo único de 4.635 líneas ya es difícil de navegar |
| Diseño / CSS | 🟢 | Sistema de tokens sólido, BEM consistente, easing unificado |
| JavaScript | 🟡 | Buenas prácticas (reduced-motion, fallbacks, IntersectionObserver) pero 6 bugs reproducibles + 1 fragilidad latente |
| **Rendimiento** | 🔴 | **8,7 MB de arranque crítico.** El vídeo de preload solo pesa 7,45 MB |
| **SEO** | 🔴 | Sin Open Graph, sin canonical, sin datos estructurados, sin sitemap |
| Accesibilidad | 🟡 | Buena base (focus-visible, ARIA, reduced-motion) con huecos concretos de foco y contraste |
| Mantenibilidad | 🟡 | 58 % de la carpeta son archivos huérfanos; carpeta duplicada; datos en 2 sitios |

### Los 6 hallazgos que más importan

1. **`Preload.MP4` pesa 7,45 MB y bloquea la primera vista.**
   El comentario de la línea 14 dice que está *"ya optimizado: ~165 KB en vez de los
   2,6 MB originales"* — pero el archivo real en disco pesa **7.813.626 bytes**. En
   algún momento se sustituyó por una versión mucho más pesada y el comentario quedó
   obsoleto. Con `body.is-preloading` la web entera está oculta hasta que el vídeo
   termina o salta el temporizador de seguridad de 6 s. En una conexión de 5 Mbps el
   visitante mira una pantalla en blanco 12 segundos. **Es, con diferencia, el
   problema número uno del sitio.**

2. **Las imágenes de producto están sin optimizar: 4 archivos pesan 4 MB y podrían
   pesar 44 KB.** Son PNG con canal alfa de 1024×1024 px que se muestran en tarjetas
   de ~220 px. Convertidas a WebP a 600 px de ancho el ahorro medido es del **99 %**.
   Además **ninguna de las 10 imágenes del catálogo tiene `loading="lazy"`** (solo
   las 6 del equipo lo tienen) y **ninguna de las 25 imágenes declara `width`/`height`**,
   lo que provoca saltos de maquetación (CLS).

3. **El 58 % de la carpeta (19,8 MB en 15 archivos) no lo usa nadie.**
   `demo3d.js`, `modelo-iphone.js`, `logo-b64.js` y toda la carpeta `vendor/`
   (Three.js, GSAP, ScrollTrigger, GLTFLoader) son restos de una demo 3D que se
   eliminó del HTML: **el `LionTech.html` actual no carga ni un solo `<script src=>`**.
   A eso se suman `Equipo.png` (10,46 MB), `IMG_6909.jpg` (3,03 MB) y
   `scrolltest.mp4` (2,21 MB) sin referenciar. Ver [06-AUDITORIA § 4](06-AUDITORIA.md).

4. **Existe una copia completa y desactualizada del proyecto dentro de sí mismo.**
   La subcarpeta `Landing HTML/` replica el proyecto con un `LionTech.html` más antiguo
   (144 KB del 05-ago vs 155 KB del 06-ago). Es una bomba de relojería: tarde o
   temprano alguien editará el archivo equivocado. Ver [05-GUÍA § 8](05-GUIA-DE-MANTENIMIENTO.md).

5. **El documento HTML está sin cerrar.** El archivo termina en `</script>`: **faltan
   `</body>` y `</html>`** (verificado: `grep -c '</body>' LionTech.html` → `0`, mientras
   que el respaldo sí las tiene). El navegador lo corrige solo y la web se ve bien,
   pero el documento no valida en el W3C. Se arregla en diez segundos.

6. **SEO prácticamente ausente.** Solo hay `<title>` y `<meta name="description">`.
   Faltan Open Graph y Twitter Cards (al compartir el enlace en WhatsApp o Instagram
   no se ve ninguna previsualización), `canonical`, `theme-color`, `robots`,
   `sitemap.xml`, `robots.txt` y sobre todo **datos estructurados
   `LocalBusiness`** — crítico para un negocio con 7 sedes físicas que quiere
   aparecer en Google Maps.

### Lo que está bien hecho

No todo es deuda. Conviene dejarlo escrito para no romperlo por accidente:

- **Sistema de tokens de color coherente**, muestreado del logo real y documentado en
  el propio código (líneas 20–50).
- **`prefers-reduced-motion` respetado en cuatro puntos**: preloader (3878), canvas
  del hero (3928), parallax (4069) y una desactivación global en CSS (2889).
- **`:focus-visible` global** con contraste 5,35:1, y la tarjeta de producto revela su
  overlay también por teclado (CSS 1273).
- **Triple red de seguridad en el preloader**: evento `ended`, temporizador calculado
  desde `loadedmetadata` y `catch` del autoplay bloqueado. Si algo falla, la web
  aparece igual.
- **Las URLs de Google Maps se derivan de `lat`/`lng`** en vez de guardar cadenas
  `pb=` frágiles (JS 4514–4517). Decisión correcta y bien comentada.
- **El modal devuelve el foco** al elemento que lo abrió (JS 4403).

---

## Cómo mantener esta documentación al día

Cada documento lleva al final un bloque **«Cómo verificar este documento»** con los
comandos concretos para comprobar si sigue siendo cierto. La rutina recomendada:

- **En cada cambio** → anota la línea en `CHANGELOG.md`.
- **Al cambiar datos de negocio** (un teléfono, una sede, un producto) → actualiza
  `04-CONTENIDO-Y-DATOS.md`.
- **Cada trimestre** → repasa `06-AUDITORIA.md` y `07-ROADMAP.md`, y vuelve a correr
  los comandos de verificación.

Los números de línea de esta documentación corresponden al `LionTech.html` del
06-ago-2026. Si el archivo cambia mucho, usa el nombre de la clase o del `id` como
referencia estable en lugar del número.
