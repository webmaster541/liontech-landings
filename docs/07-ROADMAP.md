# 07 · Roadmap priorizado

← [Volver al índice](README.md)

Plan de trabajo ordenado por **relación impacto / esfuerzo**. Marca las casillas a
medida que cierres tareas y anota la fecha.

**Leyenda de esfuerzo:** ⏱️ = minutos · ⏱️⏱️ = 1–3 horas · ⏱️⏱️⏱️ = medio día o más.

---

## P0 · Urgente (esta semana)

Estas cuatro tareas suman menos de un día de trabajo y **reducen el peso del sitio un
93 %**. Es el mejor retorno de todo el plan.

- [x] **Recomprimir `Preload.MP4`** de 7,45 MB a menos de 500 KB (o eliminar el
      preloader). ⏱️
      → [Comando ffmpeg](05-GUIA-DE-MANTENIMIENTO.md)
      · Hallazgo [P-01](06-AUDITORIA.md)
      · **Impacto: −7 MB del arranque crítico**
- [ ] **Convertir las 10 imágenes de producto a WebP a 600 px.** ⏱️⏱️
      → Hallazgo [P-02](06-AUDITORIA.md)
      · **Impacto: −4 MB (ahorro medido del 99 %)**
- [ ] **Añadir `loading="lazy"` a las 19 imágenes que no lo tienen** (todas salvo hero
      y logo del menú). ⏱️
      → Hallazgo [P-03](06-AUDITORIA.md)
- [ ] **Añadir `width` y `height` a las 25 imágenes.** ⏱️
      → Hallazgo [P-04](06-AUDITORIA.md)
      · **Impacto: elimina el CLS, una de las 3 Core Web Vitals**
- [ ] **Resolver la carpeta duplicada** `Landing HTML/`: comprimir y sacar del
      proyecto. ⏱️
      → [Guía § 8.1](05-GUIA-DE-MANTENIMIENTO.md)
      · Hallazgo M-01 · **Impacto: elimina el riesgo de perder trabajo**
- [ ] **Cerrar el documento HTML**: añadir `</body>` y `</html>` al final del archivo,
      que hoy termina en `</script>`. ⏱️ (diez segundos)
      → Hallazgo [S-09](06-AUDITORIA.md)

**Resultado esperado de P0:** primera visita de ~14,2 MB → **~1,0 MB**.

---

## P1 · Alta prioridad (este mes)

### SEO — el sitio es invisible al compartirlo

- [ ] **Open Graph + Twitter Card** en el `<head>`. Hoy, al pegar el enlace en
      WhatsApp o Instagram, no se ve ninguna previsualización. ⏱️
      → Hallazgo [S-02](06-AUDITORIA.md)
- [ ] **JSON-LD `LocalBusiness`/`Store`** con las 7 sedes. Crítico para búsquedas
      locales y Google Maps. ⏱️⏱️
      → [Bloque listo para copiar](06-AUDITORIA.md)
- [ ] **`canonical`, `theme-color`, `robots.txt`, `sitemap.xml`.** ⏱️
- [x] **Recortar la `meta description`**: hoy tiene 156 caracteres, justo en el
      límite. Bajarla a ~150. ⏱️
- [x] **Favicon ligero**: generar un PNG de 32 px o `.ico` en vez del actual de 82 KB. ⏱️

### Bugs

- [ ] **B1** — Tarjetas invisibles al cambiar de filtro rápido. ⏱️
      → [Detalle y corrección](06-AUDITORIA.md)
- [ ] **B2** — Fuga de `setInterval` en el carrusel del equipo. ⏱️
      → [Detalle y corrección](06-AUDITORIA.md)
- [ ] **B3** — «Copiar dirección» se queda en «¡Copiado!». ⏱️
- [ ] **B4 + B5** — Enlace activo del menú. ⏱️
- [ ] **B6** — Añadir `?.` a las referencias del modal para que un fallo no tumbe el
      resto del JS. ⏱️

### Datos que están mal

- [ ] **Unificar la dirección de la oficina principal** entre el footer y
      `STORES[0]`: hoy son dos direcciones distintas. ⏱️
      → Hallazgo M-05
- [ ] **Decidir sobre el teléfono de la sede de Barquisimeto**: o se añade, o se
      documenta que usa el general a propósito. ⏱️
- [ ] **Decidir sobre las pestañas vacías** «Power Banks» y «Audífonos»: añadir
      producto (hay una `casco-bluetooth.png` sin usar en la carpeta) u ocultarlas. ⏱️
- [ ] **Corregir la errata «ALWAYS» / «ALHUICE»**: el badge de la línea 3538 y el
      título de la 3539 se contradicen a la vista del visitante. ⏱️
      → Hallazgo M-10

### Higiene

- [ ] **Inicializar Git** en la carpeta con un `.gitignore`. ⏱️
      → [Guía § 8.3](05-GUIA-DE-MANTENIMIENTO.md)
- [ ] **Archivar los 15 archivos huérfanos** (19,82 MB) en un ZIP fuera del
      proyecto. ⏱️
      → [Lista completa](05-GUIA-DE-MANTENIMIENTO.md)

---

## P2 · Media prioridad (próximo trimestre)

### Accesibilidad

- [ ] **A-01** — Trampa de foco en el modal (ciclo `Tab`/`Shift+Tab` y fondo
      `inert`). ⏱️⏱️
- [ ] **A-02** — Gestión de foco del menú lateral. ⏱️
- [ ] **A-04 a A-07** — Corregir los cuatro pares de contraste que fallan WCAG AA:
      `--lion-text-muted`, `rgba(255,255,255,.4)` sobre navy, el naranja del gradiente
      Instagram y el icono de WhatsApp. ⏱️⏱️
- [ ] **A-08** — Control de pausa accesible en el carrusel con autoplay. ⏱️
- [ ] **A-03** — Rehacer la tarjeta de producto para que no anide un `<a>` dentro de
      un `role="button"`. ⏱️⏱️
- [ ] **A-11 / A-12** — Añadir utilidad `.sr-only` y un *skip link*. ⏱️
- [ ] **Verificar el contraste real del texto del hero** sobre la fotografía, con
      captura y medidor. ⏱️

### Rendimiento fino

- [ ] **P-05** — Cambiar `left` por `transform` en `shimmerLoop`, y `box-shadow` por
      `opacity` en `pulseButton`. ⏱️
- [ ] **P-06** — Pausar el canvas del hero cuando la sección sale del viewport. ⏱️
- [ ] **P-07** — Debounce de 150 ms en `resize`. ⏱️
- [ ] **P-08** — Soporte de `devicePixelRatio` en el canvas. ⏱️

### Limpieza de código

- [ ] **Eliminar las 17 clases CSS muertas** (~110 líneas). ⏱️
      → [Lista](06-AUDITORIA.md)
- [ ] **Borrar las 3 cabeceras «UBICACIÓN» duplicadas** (líneas 2000–2008). ⏱️
- [ ] **Corregir los 5 comentarios obsoletos** (líneas 14, 125, 1971, 2327, 2777,
      4153). ⏱️
- [ ] **Arreglar `font-weight: 400` sobre Poppins** en las líneas 749, 1118, 2573. ⏱️
- [ ] **Quitar los 2 `!important` injustificados** (2131, 2132). ⏱️
- [ ] **Resolver el empate de `z-index` 10001** entre `menu-toggle` y el modal. ⏱️
- [ ] **Quitar los 4 `will-change` inútiles** y añadirlo al logo del hero, que sí lo
      necesita. ⏱️

### Contenido

- [ ] **Pies reales en las fotos del equipo**: nombre y cargo en vez de seis veces
      «Equipo Lion Tech». Es la mejora de contenido con más valor humano. ⏱️
- [ ] **Decidir si se añade una cuarta tarjeta de aliados**: solo hay 3, pero el CSS
      tiene retrasos cableados para 4 (`nth-child(4)`, líneas 2340–2342) y existe un
      logo sin usar, `marca-liontech-esports.png`. ⏱️

---

## P3 · Mejoras estructurales (cuando haya margen)

Estas cambian la arquitectura. Ninguna es urgente, pero todas reducen el coste de
mantener el sitio a largo plazo.

- [ ] **Centralizar el número de WhatsApp** en una constante JS que reescriba todos
      los `href` al cargar. Reduce 17 puntos de fallo a 1. ⏱️⏱️
      → Hallazgo M-03
- [ ] **Mover los productos a un array `PRODUCTS`** y generar las tarjetas por JS, en
      vez de mantener HTML y `PRODUCT_SPECS` en paralelo. Elimina M-04 de raíz. ⏱️⏱️⏱️
- [ ] **Separar `styles.css` y `script.js`** del `LionTech.html`. Ganas cacheado
      independiente, edición más cómoda y minificado — pero **pierdes la capacidad de
      abrir la web con doble clic**, que fue una decisión de diseño explícita.
      Evaluar. ⏱️⏱️
- [ ] **Tokenizar espaciado, tipografía, sombras y `z-index`.** Hoy solo hay tokens de
      color, radio y easing. ⏱️⏱️⏱️
      → [02-SISTEMA-DE-DISEÑO § 1.3](02-SISTEMA-DE-DISENO.md)
- [ ] **Unificar los 3 carruseles** en un componente compartido. ⏱️⏱️⏱️
- [ ] **Unificar las convenciones de estado** (`is-active` vs `active`). ⏱️
- [ ] **Reagrupar los media queries** para que cada breakpoint viva en un solo sitio. ⏱️⏱️
- [ ] **Migrar a mobile-first** (`min-width` en vez de `max-width`). Es un rediseño del
      CSS responsive completo. ⏱️⏱️⏱️
- [ ] **Autoalojar Google Fonts** para eliminar la dependencia de un tercero y mejorar
      la privacidad. ⏱️⏱️
- [ ] **Soporte de gestos táctiles (swipe)** en los tres carruseles. ⏱️⏱️
- [ ] **Añadir aviso legal y política de privacidad** enlazados desde el footer. ⏱️⏱️

---

## Cómo medir el progreso

Antes y después de P0, ejecuta una medición para tener números comparables:

1. **PageSpeed Insights** — https://pagespeed.web.dev/ (necesita el sitio publicado)
2. **Peso real de la primera carga** — F12 → pestaña Red → recargar con `Ctrl+Shift+R`
   → mirar el total en la barra inferior
3. **Auditoría Lighthouse local** — F12 → Lighthouse → Analizar

**Objetivos razonables tras P0 + P1:**

| Métrica | Ahora (estimado) | Objetivo |
|---|---|---|
| Peso de primera carga | ~14,2 MB | < 1,5 MB |
| Lighthouse — Rendimiento | 25–40 | > 85 |
| Lighthouse — SEO | 70–80 | > 95 |
| Lighthouse — Accesibilidad | 75–85 | > 90 |
| Largest Contentful Paint | > 6 s | < 2,5 s |
| Cumulative Layout Shift | > 0,25 | < 0,1 |

> Las cifras de «ahora» son estimaciones basadas en el análisis estático, no en una
> ejecución real de Lighthouse. **Mide antes de empezar** para tener una línea base
> honesta.
