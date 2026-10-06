/* 1. Componente de Fondo Animado Hero Canvas */
    (function () {
      'use strict';

      function initHeroCanvas() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId = null;
        let isTabVisible = true;
        let isReducedMotion = false;
        let width = 0;
        let height = 0;
        let streaks = [];

        const COLOR_NAVY = '#001034';
        const STREAK_COLORS = ['#0C6CC0', '#3B9EFF', '#1680E2'];

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        isReducedMotion = motionQuery.matches;
        motionQuery.addEventListener('change', (e) => {
          isReducedMotion = e.matches;
          if (isReducedMotion) {
            stopLoop();
            drawStaticFrame();
          } else {
            startLoop();
          }
        });

        function resize() {
          const hero = canvas.parentElement;
          if (!hero) return;
          width = canvas.width = hero.offsetWidth;
          height = canvas.height = hero.offsetHeight;
          createStreaks();
          if (isReducedMotion) {
            drawStaticFrame();
          }
        }

        function createStreaks() {
          const isMobile = window.innerWidth < 768;
          const count = isMobile ? 6 : 12;
          streaks = [];

          for (let i = 0; i < count; i++) {
            streaks.push({
              x: Math.random() * width * 1.5 - width * 0.25,
              y: Math.random() * height * 1.5 - height * 0.25,
              length: Math.random() * 260 + 140,
              width: Math.random() * 3 + 1,
              speed: Math.random() * 0.4 + 0.2,
              alpha: Math.random() * 0.4 + 0.15,
              color: STREAK_COLORS[Math.floor(Math.random() * STREAK_COLORS.length)]
            });
          }
        }

        function drawStreak(s) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(-Math.PI / 4.5);

          const gradient = ctx.createLinearGradient(0, 0, s.length, 0);
          gradient.addColorStop(0, 'rgba(12, 108, 192, 0)');
          gradient.addColorStop(0.5, s.color);
          gradient.addColorStop(1, 'rgba(12, 108, 192, 0)');

          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, s.length, s.width);
          ctx.restore();
        }

        function update() {
          for (let s of streaks) {
            s.x += s.speed * 1.2;
            s.y -= s.speed * 0.6;

            if (s.x > width + s.length || s.y < -s.length) {
              s.x = Math.random() * width * 0.5 - s.length;
              s.y = height + Math.random() * 100;
            }
          }
        }

        function drawStaticFrame() {
          ctx.fillStyle = COLOR_NAVY;
          ctx.fillRect(0, 0, width, height);

          for (let s of streaks) {
            drawStreak(s);
          }
        }

        function loop() {
          if (!isTabVisible || isReducedMotion) return;

          ctx.fillStyle = COLOR_NAVY;
          ctx.fillRect(0, 0, width, height);

          for (let s of streaks) {
            drawStreak(s);
          }

          update();
          animationFrameId = requestAnimationFrame(loop);
        }

        function startLoop() {
          if (!animationFrameId && !isReducedMotion && isTabVisible) {
            animationFrameId = requestAnimationFrame(loop);
          }
        }

        function stopLoop() {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }

        document.addEventListener('visibilitychange', () => {
          isTabVisible = !document.hidden;
          if (isTabVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        });

        window.addEventListener('resize', resize, { passive: true });

        resize();
        if (!isReducedMotion) {
          startLoop();
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroCanvas);
      } else {
        initHeroCanvas();
      }
    })();

    /* 1.b Parallax del logo del Hero — SOLO por proximidad del mouse.
       El logo (única capa con [data-depth]) reacciona únicamente cuando el
       cursor entra en un radio de PROXIMITY px alrededor de su caja; fuera
       de ese radio vuelve suavemente a su posición original.
       Usa la propiedad individual `translate`/`rotate` en CSS para las
       posiciones/animaciones estáticas de cada capa, dejando `transform`
       libre exclusivamente para este parallax (ambas componen sin pisarse). */
    (function initHeroParallax() {
      function start() {
        const hero = document.getElementById('inicio');
        if (!hero) return;

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotionQuery.matches) return;

        const layers = Array.from(hero.querySelectorAll('[data-depth]'));
        if (!layers.length) return;

        // Referencia de proximidad: el propio logo (primera capa con data-depth).
        const ref = hero.querySelector('.hero__visual-logo') || layers[0];

        const PROXIMITY = 700;  // px alrededor del logo que activan el seguimiento
        const MAX_OFFSET = 380; // tope del recorrido suave

        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        let rafId = null;

        function render() {
          currentX += (targetX - currentX) * 0.06;
          currentY += (targetY - currentY) * 0.06;

          layers.forEach((layer) => {
            const depth = parseFloat(layer.getAttribute('data-depth')) || 0;
            const x = currentX * depth;
            const y = currentY * depth;
            layer.style.transform = 'translate3d(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px, 0)';
          });

          if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
            rafId = requestAnimationFrame(render);
          } else {
            rafId = null;
          }
        }

        function schedule() {
          if (!rafId) rafId = requestAnimationFrame(render);
        }

        function onPointerMove(e) {
          const rect = ref.getBoundingClientRect();
          if (!rect.width || !rect.height) { targetX = targetY = 0; schedule(); return; }

          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);

          // Distancia real al BORDE de la caja del logo (0 si el cursor está encima).
          const outX = Math.max(0, Math.abs(dx) - rect.width / 2);
          const outY = Math.max(0, Math.abs(dy) - rect.height / 2);
          const dist = Math.hypot(outX, outY);

          if (dist > PROXIMITY) { // fuera del radio: vuelve a su sitio
            targetX = 0;
            targetY = 0;
            schedule();
            return;
          }

          // Suavizado (smoothstep): 1 encima del logo → 0 en el borde del radio.
          const t = 1 - dist / PROXIMITY;
          const influence = t * t * (3 - 2 * t);

          targetX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx)) * influence;
          targetY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy)) * influence;
          schedule();
        }

        function onPointerLeave() {
          targetX = 0;
          targetY = 0;
          schedule();
        }

        hero.addEventListener('mousemove', onPointerMove, { passive: true });
        hero.addEventListener('mouseleave', onPointerLeave, { passive: true });
        window.addEventListener('scroll', onPointerLeave, { passive: true });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
      } else {
        start();
      }
    })();

    /* 1.c ESCENA iPHONE EN SCROLL
       ------------------------------------------------------------------
       Una sola pista de scroll (#framesSequence, 520vh) controla:
         · el fotograma de la secuencia PNG (Frames/ezgif-frame-###.png)
         · el fundido cruzado de las capas de color (grades)
         · el oscurecido de fondo cuando entra el contenido
         · la entrada/salida de los 4 "beats" de contenido
         · el riel de progreso y la salida en fundido al catálogo
       Los fotogramas se cargan de forma progresiva (pasadas de stride
       8 → 4 → 2 → 1), así la escena es usable con ~1/8 de las imágenes
       y el resto entra en segundo plano. ------------------------------ */
    (function initIphoneScene() {
      const section = document.getElementById('framesSequence');
      const canvas = document.getElementById('framesScrollCanvas');
      if (!section || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loader = document.getElementById('framesScrollLoader');
      const loaderText = section.querySelector('[data-loader-text]');
      const gradeA = section.querySelector('[data-grade="a"]');
      const gradeB = section.querySelector('[data-grade="b"]');
      const gradeC = section.querySelector('[data-grade="c"]');
      const shade = section.querySelector('[data-shade]');
      const exit = section.querySelector('[data-exit]');
      const rail = section.querySelector('[data-rail]');
      const hint = section.querySelector('[data-hint]');

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---------- 1. Selección de fotogramas según el dispositivo ---------- */
      const TOTAL_FRAMES = 150;
      const stride = 1; // Cargar todos los 150 fotogramas para máxima fluidez y video completo
      const frameIds = [];
      for (let i = 0; i < TOTAL_FRAMES; i += stride) frameIds.push(i);
      const FRAMES = frameIds.length;

      function framePath(slot, ext) {
        ext = ext || 'jpg';
        return '../Frames/ezgif-frame-' + String(frameIds[slot] + 1).padStart(3, '0') + '.' + ext;
      }

      /* ---------- 2. Carga progresiva ---------- */
      const imgs = new Array(FRAMES);
      const ready = new Array(FRAMES).fill(false);
      let readyCount = 0;
      let revealed = false;

      const queue = [];
      const queued = new Set();
      [8, 4, 2, 1].forEach(s => {
        for (let i = 0; i < FRAMES; i += s) {
          if (!queued.has(i)) { queued.add(i); queue.push(i); }
        }
      });
      if (!queued.has(FRAMES - 1)) queue.push(FRAMES - 1);

      const REVEAL_AT = Math.max(2, Math.ceil(FRAMES / 15));
      const MAX_PARALLEL = 8;
      let cursor = 0;
      let inflight = 0;

      function hideLoader() {
        if (revealed || !loader) return;
        revealed = true;
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => { loader.style.display = 'none'; }, 300);
      }

      // Permitir saltar el preload al hacer click en cualquier lugar o presionar cualquier tecla
      window.addEventListener('click', () => {
        if (!revealed) hideLoader();
      }, { passive: true });

      window.addEventListener('keydown', () => {
        if (!revealed) hideLoader();
      }, { passive: true });

      if (loader) {
        loader.style.cursor = 'pointer';
        loader.addEventListener('click', hideLoader);
      }

      function onFrameSettled() {
        if (loaderText && !revealed) {
          loaderText.textContent = 'Cargando animación… ' + Math.round((readyCount / FRAMES) * 100) + '%';
        }
        if (readyCount >= REVEAL_AT) hideLoader();
      }

      function pump() {
        while (inflight < MAX_PARALLEL && cursor < queue.length) {
          const slot = queue[cursor++];
          if (ready[slot]) continue;
          inflight++;
          const img = new Image();
          img.decoding = 'async';
          const settleSuccess = () => {
            inflight--;
            if (img.naturalWidth > 0) {
              imgs[slot] = img;
              ready[slot] = true;
              readyCount++;
              if (readyCount === 1) { lastDrawn = -1; render(true); }
              else if (Math.abs(slot - lastWanted) <= stride) { lastDrawn = -1; render(true); }
            }
            onFrameSettled();
            pump();
          };
          img.onload = settleSuccess;
          img.onerror = () => {
            // Si falla en .jpg, probar con .png como fallback
            const fallbackImg = new Image();
            fallbackImg.decoding = 'async';
            fallbackImg.onload = () => {
              inflight--;
              if (fallbackImg.naturalWidth > 0) {
                imgs[slot] = fallbackImg;
                ready[slot] = true;
                readyCount++;
                if (readyCount === 1) { lastDrawn = -1; render(true); }
                else if (Math.abs(slot - lastWanted) <= stride) { lastDrawn = -1; render(true); }
              }
              onFrameSettled();
              pump();
            };
            fallbackImg.onerror = () => {
              inflight--;
              onFrameSettled();
              pump();
            };
            fallbackImg.src = framePath(slot, 'png');
          };
          img.src = framePath(slot, 'jpg');
        }
        if (inflight === 0 && cursor >= queue.length) hideLoader();
      }

      /* ---------- 3. Dibujo ---------- */
      let cssW = 0, cssH = 0;
      let lastDrawn = -1;
      let lastWanted = 0;

      function nearestReady(slot) {
        if (ready[slot]) return slot;
        for (let d = 1; d < FRAMES; d++) {
          if (slot - d >= 0 && ready[slot - d]) return slot - d;
          if (slot + d < FRAMES && ready[slot + d]) return slot + d;
        }
        return -1;
      }

      function resize() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cssW = rect.width;
        cssH = rect.height;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastDrawn = -1;
        render(true);
      }

      function render(force) {
        const slot = nearestReady(lastWanted);
        if (slot < 0 || !cssW || !cssH) return;
        if (slot === lastDrawn && !force) return;
        const img = imgs[slot];
        if (!img || !img.naturalWidth) return;
        ctx.clearRect(0, 0, cssW, cssH);

        // Escalado "cover": el video se expande para llenar el 100% de la pantalla sin bordes
        const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh);
        lastDrawn = slot;
      }

      /* ---------- 4. Curvas de progreso ---------- */
      const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
      const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

      // Trapecio suavizado: 0 → 1 (a→b), 1 (b→c), 1 → 0 (c→d)
      function band(p, a, b, c, d) {
        if (p <= a || p >= d) return 0;
        if (p < b) return easeInOut(clamp01((p - a) / (b - a)));
        if (p <= c) return 1;
        return easeInOut(clamp01((d - p) / (d - c)));
      }

      const beats = [
        { el: section.querySelector('[data-beat="0"]'), a: -0.10, b: 0.01, c: 0.16, d: 0.25 },
        { el: section.querySelector('[data-beat="1"]'), a: 0.25, b: 0.32, c: 0.42, d: 0.50 },
        { el: section.querySelector('[data-beat="2"]'), a: 0.50, b: 0.57, c: 0.69, d: 0.77 },
        { el: section.querySelector('[data-beat="3"]'), a: 0.77, b: 0.84, c: 0.99, d: 1.02 }
      ].filter(bt => bt.el);

      function sceneProgress() {
        const rect = section.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        if (scrollable <= 0) return 0;
        return clamp01(-rect.top / scrollable);
      }

      function paint(p) {
        // Fotograma: Mapeo lineal completo de 0 a 149
        lastWanted = Math.min(FRAMES - 1, Math.floor(p * FRAMES));
        render(false);

        // Capas de color cruzadas
        if (gradeA) gradeA.style.opacity = (band(p, -0.02, 0.10, 0.30, 0.52) * 0.95).toFixed(3);
        if (gradeB) gradeB.style.opacity = (band(p, 0.28, 0.44, 0.62, 0.82) * 0.95).toFixed(3);
        if (gradeC) gradeC.style.opacity = (band(p, 0.58, 0.76, 1.00, 1.06) * 0.95).toFixed(3);

        // Oscurecido: entra suavemente con el contenido
        if (shade) shade.style.opacity = (band(p, -0.04, 0.09, 0.93, 1.02) * 0.45).toFixed(3);

        // Beats
        for (let i = 0; i < beats.length; i++) {
          const bt = beats[i];
          const o = band(p, bt.a, bt.b, bt.c, bt.d);
          const el = bt.el;
          if (o <= 0.002) {
            if (el.dataset.on === '1') {
              el.dataset.on = '0';
              el.style.opacity = '0';
              el.style.visibility = 'hidden';
              el.classList.remove('is-live');
            }
            continue;
          }
          el.dataset.on = '1';
          el.style.visibility = 'visible';
          el.style.opacity = o.toFixed(3);
          const t = clamp01((p - bt.a) / (bt.d - bt.a));
          const y = (0.5 - t) * 90;
          el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + (0.985 + o * 0.015).toFixed(4) + ')';
          el.classList.toggle('is-live', o > 0.55);
        }

        // Riel, pista de scroll y salida
        if (rail) rail.style.width = (p * 100).toFixed(2) + '%';
        if (hint) hint.style.opacity = (1 - clamp01(p / 0.055)).toFixed(3);
        if (exit) exit.style.opacity = (clamp01((p - 0.97) / 0.03) * 0.96).toFixed(3);
      }

      /* ---------- 5. Modo reducido ---------- */
      if (reduceMotion) {
        section.classList.add('gta-scene--static');
        resize();
        lastWanted = Math.floor(FRAMES * 0.55);
        pump();
        window.addEventListener('resize', resize, { passive: true });
        return;
      }

      /* ---------- 6. Bucle ---------- */
      let rafId = null;
      function schedule() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          paint(sceneProgress());
        });
      }

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', () => { resize(); schedule(); }, { passive: true });

      resize();
      paint(sceneProgress());

      // Las tarjetas activan el filtro correspondiente del catálogo
      section.querySelectorAll('.gta-card[data-filter]').forEach(card => {
        card.addEventListener('click', () => {
          const filter = card.getAttribute('data-filter');
          const btn = document.querySelector('.tab-btn[data-filter="' + filter + '"]');
          if (btn) setTimeout(() => btn.click(), 420);
        });
      });

      // Optimización Brief Δ7: No bloquear el hilo principal al cargar el Hero.
      // La descarga de fotogramas arranca cuando la sección se aproxima o el hilo esté desocupado.
      let loadingStarted = false;
      function startLoading() {
        if (loadingStarted) return;
        loadingStarted = true;
        pump();
      }

      if ('IntersectionObserver' in window && section) {
        const obs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            startLoading();
            obs.disconnect();
          }
        }, { rootMargin: '300px 0px' });
        obs.observe(section);
      }

      // Fallback en tiempo ocioso tras pintar el Hero
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => { setTimeout(startLoading, 1500); }, { timeout: 3000 });
      } else {
        window.addEventListener('load', () => { setTimeout(startLoading, 1500); }, { once: true });
      }
    })();

    /* 2. Scroll Reveal, Header Compactación y Filtros */
    document.addEventListener('DOMContentLoaded', () => {
      const reveals = document.querySelectorAll('.reveal');

      if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
      } else {
        reveals.forEach(el => el.classList.add('reveal-visible'));
      }

      // Active nav link highlighting via IntersectionObserver
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.sidenav__link');

      if ('IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${id}`) {
                  link.classList.add('active');
                } else {
                  link.classList.remove('active');
                }
              });
            }
          });
        }, {
          threshold: 0.35
        });

        sections.forEach(sec => navObserver.observe(sec));
      }

      // ---- Menú lateral colapsable (reemplaza el header fijo) ----
      const menuToggle = document.getElementById('menuToggle');
      const sidenav = document.getElementById('sideNav');
      const sidenavOverlay = document.getElementById('sidenavOverlay');
      const sidenavClose = document.getElementById('sidenavClose');

      const openSidenav = () => {
        sidenav?.classList.add('is-open');
        sidenavOverlay?.classList.add('is-open');
        menuToggle?.classList.add('is-active');
        sidenav?.setAttribute('aria-hidden', 'false');
        menuToggle?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      };

      const closeSidenav = () => {
        sidenav?.classList.remove('is-open');
        sidenavOverlay?.classList.remove('is-open');
        menuToggle?.classList.remove('is-active');
        sidenav?.setAttribute('aria-hidden', 'true');
        menuToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };

      menuToggle?.addEventListener('click', () => {
        if (sidenav?.classList.contains('is-open')) {
          closeSidenav();
        } else {
          openSidenav();
        }
      });

      sidenavClose?.addEventListener('click', closeSidenav);
      sidenavOverlay?.addEventListener('click', closeSidenav);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidenav?.classList.contains('is-open')) {
          closeSidenav();
        }
      });

      navLinks.forEach(link => link.addEventListener('click', closeSidenav));

      const tabBtns = document.querySelectorAll('.tab-btn');
      const catalogCards = document.querySelectorAll('.catalog-card');
      const catalogEmpty = document.getElementById('catalogEmpty');
      const FILTER_FADE_MS = 300;

      const updateCatalogDelays = () => {
        let visibleIndex = 0;
        catalogCards.forEach(card => {
          if (card.style.display !== 'none') {
            card.style.setProperty('--card-index', visibleIndex++);
          }
        });
      };
      updateCatalogDelays();

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.getAttribute('data-filter');

          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          let visibleCount = 0;

          catalogCards.forEach(card => {
            const cat = (card.getAttribute('data-category') || '').toLowerCase();
            const categories = cat.split(/\s+/);
            const matches = filter === 'all' || categories.includes(filter.toLowerCase()) || cat === filter;

            if (matches) {
              visibleCount++;
              if (card.style.display === 'none') {
                card.style.display = 'flex';
                requestAnimationFrame(() => card.classList.remove('is-hiding'));
              }
            } else if (card.style.display !== 'none') {
              card.classList.add('is-hiding');
              setTimeout(() => {
                if (card.classList.contains('is-hiding')) {
                  card.style.display = 'none';
                }
              }, FILTER_FADE_MS);
            }
          });

          catalogEmpty?.classList.toggle('is-visible', visibleCount === 0);
          updateCatalogDelays();
        });
      });

      /* Quick View Modal — detalle ampliado por producto del catálogo */
      const PRODUCT_SPECS = {
        'forro-agua': [
          { k: 'Protección', v: 'Salpicaduras, lluvia y polvo' },
          { k: 'Cierre', v: 'Sello hermético reforzado' },
          { k: 'Material', v: 'Silicona/TPU de alta densidad' },
          { k: 'Compatibilidad', v: 'Varios modelos, consultar disponibilidad' }
        ],
        'vidrio-templado': [
          { k: 'Dureza', v: '9H' },
          { k: 'Cobertura', v: 'Full Cover, borde a borde' },
          { k: 'Instalación', v: 'Kit incluido, sin burbujas' },
          { k: 'Compatibilidad', v: 'Según modelo de equipo' }
        ],
        'straps': [
          { k: 'Sujeción', v: 'Anclaje reforzado antideslizante' },
          { k: 'Uso', v: 'De mano o colgante' },
          { k: 'Diseños', v: 'Variados, incluye personajes' },
          { k: 'Material', v: 'Cordón/correa resistente' }
        ],
        'forro-smartwatch': [
          { k: 'Material', v: 'Silicona flexible' },
          { k: 'Protección', v: 'Golpes y rayones' },
          { k: 'Ajuste', v: 'A la medida del smartwatch' },
          { k: 'Compatibilidad', v: 'Según modelo, consultar disponibilidad' }
        ],
        'fundas-magsafe': [
          { k: 'Compatibilidad', v: 'Carga MagSafe e imanes' },
          { k: 'Material', v: 'Funda rígida + anillo magnético' },
          { k: 'Diseño', v: 'Slim fit' },
          { k: 'Accesorios', v: 'Compatible con soportes magnéticos' }
        ],
        'protector-camara': [
          { k: 'Material', v: 'Vidrio templado' },
          { k: 'Protección', v: 'Anillo de lente trasera' },
          { k: 'Instalación', v: 'Adhesiva, no afecta la foto' },
          { k: 'Compatibilidad', v: 'Según modelo de cámara' }
        ],
        'forro-cargador': [
          { k: 'Material', v: 'Silicona flexible' },
          { k: 'Protección', v: 'Contra dobleces y desgaste' },
          { k: 'Uso', v: 'Cable de cargador' },
          { k: 'Ajuste', v: 'Universal' }
        ],
        'pop-sockets': [
          { k: 'Tipo', v: 'Plegable, base adhesiva' },
          { k: 'Uso', v: 'Agarre firme y soporte para video' },
          { k: 'Instalación', v: 'Adhesivo reutilizable' },
          { k: 'Compatibilidad', v: 'Mayoría de celulares' }
        ],
        'cargador-vmen': [
          { k: 'Potencia', v: '25W' },
          { k: 'Conector', v: 'Type-C / USB-C Power Adapter' },
          { k: 'Incluye', v: 'Cable USB-C a Lightning' },
          { k: 'Marca', v: 'V-MEN, sello Ultra Durable' }
        ],
        'cable-poder': [
          { k: 'Tipo', v: 'Cable de poder "figura 8"' },
          { k: 'Uso', v: 'Laptops, monitores, impresoras, consolas' },
          { k: 'Longitud', v: 'Aprox. 1.5m' },
          { k: 'Certificación', v: 'Normas eléctricas estándar' }
        ]
      };

      const quickviewModal = document.getElementById('quickviewModal');
      const quickviewOverlay = document.getElementById('quickviewOverlay');
      const quickviewClose = document.getElementById('quickviewClose');
      const quickviewImg = document.getElementById('quickviewImg');
      const quickviewCategory = document.getElementById('quickviewCategory');
      const quickviewTitle = document.getElementById('quickviewTitle');
      const quickviewDesc = document.getElementById('quickviewDesc');
      const quickviewSpecs = document.getElementById('quickviewSpecs');
      const quickviewPrice = document.getElementById('quickviewPrice');
      const quickviewWhatsapp = document.getElementById('quickviewWhatsapp');
      let lastFocusedEl = null;
      let lastOpenedCard = null;

      const openQuickView = (card) => {
        const id = card.getAttribute('data-product-id');
        const cat = card.getAttribute('data-category') || '';
        const badge = card.getAttribute('data-badge') || '';
        const img = card.querySelector('.catalog-card__img');
        const categoryLabel = badge || document.querySelector(`.tab-btn[data-filter="${cat}"]`)?.textContent.trim() || 'Accesorio';
        const title = card.querySelector('.catalog-card__title')?.textContent || '';

        quickviewImg.src = img?.src || 'images/marca-hi-treek.jpg';
        quickviewImg.alt = img?.alt || 'Hi-Treek, distribuidor oficial';
        quickviewCategory.textContent = categoryLabel;
        quickviewTitle.textContent = title;
        quickviewDesc.textContent = card.querySelector('.catalog-card__desc')?.textContent || '';
        quickviewPrice.textContent = card.querySelector('.price-tag')?.textContent || '';
        if (quickviewWhatsapp) {
          quickviewWhatsapp.href = `https://wa.me/584129777736?text=${encodeURIComponent(`Hola Lion Tech, quiero consultar disponibilidad de ${title}`)}`;
        }

        quickviewSpecs.innerHTML = '';
        (PRODUCT_SPECS[id] || []).forEach(spec => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${spec.k}</strong><span>${spec.v}</span>`;
          quickviewSpecs.appendChild(li);
        });

        lastFocusedEl = document.activeElement;
        lastOpenedCard = card;

        // Limpiar animaciones anteriores
        const dialog = quickviewModal.querySelector('.quickview-modal__dialog');
        dialog?.getAnimations().forEach(anim => anim.cancel());

        // Geometría en píxeles reales de la tarjeta seleccionada
        const cardRect = card ? card.getBoundingClientRect() : null;
        const startLeft = cardRect ? cardRect.left : window.innerWidth / 2;
        const startTop = cardRect ? cardRect.top : window.innerHeight / 2;
        const startWidth = cardRect ? cardRect.width : 240;
        const startHeight = cardRect ? cardRect.height : 280;

        quickviewModal.classList.add('is-open');
        quickviewModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        quickviewClose.focus();

        // Diálogo en su posición final centrada
        const dialogRect = dialog.getBoundingClientRect();
        const deltaX = (startLeft + startWidth / 2) - (dialogRect.left + dialogRect.width / 2);
        const deltaY = (startTop + startHeight / 2) - (dialogRect.top + dialogRect.height / 2);
        const scaleX = startWidth / dialogRect.width;
        const scaleY = startHeight / dialogRect.height;

        const horizontalFactor = deltaX / (window.innerWidth / 2);
        const skewCurve = horizontalFactor * 14;

        // FÍSICA GENIE MAC: Keyframes interpolados con deformación trapezoidal en embudo (Clip-Path Wave)
        const genieOpenKeyframes = [
          {
            transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY * 0.4}) skewX(${skewCurve}deg) rotateX(15deg)`,
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
            opacity: 0,
            filter: 'blur(4px) brightness(1.2)'
          },
          {
            transform: `translate3d(${deltaX * 0.45}px, ${deltaY * 0.35}px, 0) scale(${Math.max(0.65, scaleX * 1.8)}, 0.55) skewX(${-skewCurve * 0.4}deg) rotateX(8deg)`,
            clipPath: 'polygon(6% 0%, 94% 0%, 98% 100%, 2% 100%)',
            opacity: 0.9,
            filter: 'blur(1px) brightness(1.08)',
            offset: 0.45
          },
          {
            transform: 'translate3d(0, -3px, 0) scale(1.015, 1.01) skewX(0deg) rotateX(-1deg)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 1,
            filter: 'blur(0px) brightness(1)',
            offset: 0.8
          },
          {
            transform: 'translate3d(0, 0, 0) scale(1, 1) skewX(0deg) rotateX(0deg)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 1,
            filter: 'blur(0px) brightness(1)'
          }
        ];

        dialog.animate(genieOpenKeyframes, {
          duration: 540,
          easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
          fill: 'forwards'
        });
      };

      const closeQuickView = () => {
        if (!quickviewModal.classList.contains('is-open')) return;
        const dialog = quickviewModal.querySelector('.quickview-modal__dialog');

        const card = lastOpenedCard || document.querySelector('.catalog-card');
        const cardRect = card ? card.getBoundingClientRect() : null;
        const dialogRect = dialog.getBoundingClientRect();

        const startLeft = cardRect ? cardRect.left : window.innerWidth / 2;
        const startTop = cardRect ? cardRect.top : window.innerHeight / 2;
        const startWidth = cardRect ? cardRect.width : 240;
        const startHeight = cardRect ? cardRect.height : 280;

        const deltaX = (startLeft + startWidth / 2) - (dialogRect.left + dialogRect.width / 2);
        const deltaY = (startTop + startHeight / 2) - (dialogRect.top + dialogRect.height / 2);
        const scaleX = startWidth / dialogRect.width;
        const scaleY = startHeight / dialogRect.height;
        const horizontalFactor = deltaX / (window.innerWidth / 2);
        const skewCurve = -horizontalFactor * 16;

        // FÍSICA GENIE MAC: Succión hacia la boquilla de la tarjeta
        const genieCloseKeyframes = [
          {
            transform: 'translate3d(0, 0, 0) scale(1, 1) skewX(0deg) rotateX(0deg)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 1,
            filter: 'blur(0px)'
          },
          {
            transform: `translate3d(${deltaX * 0.4}px, ${deltaY * 0.35}px, 0) scale(0.65, 0.5) skewX(${skewCurve * 0.5}deg) rotateX(-6deg)`,
            clipPath: 'polygon(2% 0%, 98% 0%, 90% 100%, 10% 100%)',
            opacity: 0.85,
            filter: 'blur(1.5px)',
            offset: 0.45
          },
          {
            transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX * 0.8}, ${scaleY * 0.25}) skewX(${skewCurve}deg) rotateX(16deg)`,
            clipPath: 'polygon(0% 0%, 100% 0%, 65% 100%, 35% 100%)',
            opacity: 0,
            filter: 'blur(5px) brightness(1.25)'
          }
        ];

        const anim = dialog.animate(genieCloseKeyframes, {
          duration: 440,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });

        anim.onfinish = () => {
          quickviewModal.classList.remove('is-open');
          quickviewModal.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('no-scroll');
          lastFocusedEl?.focus();
        };
      };

      catalogCards.forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('a')) return;
          openQuickView(card);
        });
        card.addEventListener('keydown', (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) {
            e.preventDefault();
            openQuickView(card);
          }
        });
      });

      quickviewClose.addEventListener('click', closeQuickView);
      quickviewOverlay.addEventListener('click', closeQuickView);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quickviewModal.classList.contains('is-open')) {
          closeQuickView();
        }
      });

      // Botón "Copiar dirección" en Ubicación
      const copyBtn = document.querySelector('.location__copy-btn');
      copyBtn?.addEventListener('click', async () => {
        const address = copyBtn.getAttribute('data-address') || '';
        const label = copyBtn.querySelector('span');
        const original = label ? label.textContent : '';
        try {
          await navigator.clipboard.writeText(address);
        } catch (e) {
          // Respaldo para navegadores sin permiso de portapapeles
          const helper = document.createElement('textarea');
          helper.value = address;
          helper.style.position = 'fixed';
          helper.style.opacity = '0';
          document.body.appendChild(helper);
          helper.select();
          document.execCommand('copy');
          document.body.removeChild(helper);
        }
        if (label) {
          label.textContent = '¡Copiado!';
          setTimeout(() => { label.textContent = original; }, 1800);
        }
      });

      /* Carrusel de Sedes — Ubicación (8 Guaridas Oficiales Exactas) */
      const STORES = [
        {
          fecha: 'Sede Matriz · Sabana Grande',
          titulo: 'Tienda Av. Casanova',
          desc: 'Sede, oficinas directivas y centro mayorista de la manada Lion Tech. Asesoría directa con Alanis.',
          direccion: 'Entre Blvd. de Sabana Grande y Av. Casanova, Callejón Borges, Edif. Permontsa Piso 2, Caracas.',
          tel: '584129777736',
          lat: 10.492188, lng: -66.874063,
          mapsUrl: 'https://maps.app.goo.gl/5qfB6GLcrBaF3ETw8'
        },
        {
          fecha: 'Boulevard de Sabana Grande · Caracas',
          titulo: 'Tienda Plaza Venezuela',
          desc: 'Vitrina oficial de accesorios Hi-Treek, repuestos y laboratorio técnico Lion Tech Care+.',
          direccion: 'Av. Abraham Lincoln con calle San Antonio, C.C. Cristal Plaza, Nivel P.B., Sabana Grande, Caracas.',
          tel: '584129922226',
          lat: 10.495438, lng: -66.880188,
          mapsUrl: 'https://maps.app.goo.gl/qKgoQasZqKECy7Dc7'
        },
        {
          fecha: 'Apertura: 12/05/2023 · Oriente',
          titulo: 'Sede Oriente — Puerto La Cruz',
          desc: 'La puerta de oriente y centro neurálgico mayorista para todo el estado Anzoátegui y estados vecinos.',
          direccion: 'Edif. La Inmaculada, Local PB-2, Av. Municipal, Puerto La Cruz 6023, Anzoátegui.',
          tel: '584127078428',
          lat: 10.202188, lng: -64.635188,
          mapsUrl: 'https://maps.app.goo.gl/SQZQ2TurkkFkjJoB6'
        },
        {
          fecha: 'Apertura: 21/05/2024 · Llanos',
          titulo: 'Sede Los Llanos — Apure',
          desc: 'Abastecimiento mayorista y repuestos para toda la región llanera venezolana.',
          direccion: 'Edif. Valles del Bekka, Local C3, Av. Miranda, Sector Las Marías, San Fernando de Apure, Apure.',
          tel: '584242527305',
          lat: 7.888812, lng: -67.481188,
          mapsUrl: 'https://maps.app.goo.gl/QtDTt6tHW8gWeYPD6'
        },
        {
          fecha: 'Boulevard de Sabana Grande · Chacaíto',
          titulo: 'Tienda Chacaíto',
          desc: 'Ubicada estratégicamente en el practical extremo este del boulevard con amplio stock de accesorios.',
          direccion: 'Edif. Royal Castle, Piso P.B., 2da Av. con Blvd. de Sabana Grande, Chacaíto, Caracas.',
          tel: '584127155566',
          lat: 10.492063, lng: -66.872563,
          mapsUrl: 'https://maps.app.goo.gl/UxZpevmf2oZtEEfM8'
        },
        {
          fecha: 'Sede Centro-Occidente · Lara',
          titulo: 'Sede Occidente — Barquisimeto',
          desc: 'Distribución mayorista y detal para la ciudad crepuscular y toda la región centroccidental.',
          direccion: 'Edif. Ming, Piso P.B., Local 2, Carrera 19 entre calles 20 y 21, Barquisimeto 3001, Lara.',
          tel: '584127109992',
          lat: 10.067812, lng: -69.319437,
          mapsUrl: 'https://maps.app.goo.gl/4ZvzRfz17ZQjCFRb6'
        },
        {
          fecha: 'Boulevard de Sabana Grande · Caracas',
          titulo: 'Sede Sabana Grande (Tienda Física)',
          desc: 'Nuestra icónica tienda de atención al detal en el corazón comercial del boulevard, frente a heladería La Poma.',
          direccion: 'Av. Abraham Lincoln, C.C. Sabana Grande, frente a heladería La Poma, Sabana Grande, Caracas.',
          tel: '584127105591',
          lat: 10.493500, lng: -66.876200,
          mapsUrl: 'https://maps.app.goo.gl/AcR3KzNXAAsJaBQ59'
        },
        {
          fecha: 'C.C. Paseo Las Mercedes · Baruta',
          titulo: 'Tienda Paseo Las Mercedes',
          desc: 'Nuestra exclusiva tienda en Las Mercedes con catálogo completo de accesorios de alta gama, repuestos y atención personalizada.',
          direccion: 'Avenida Principal de Las Mercedes con Paseo Enrique Eraso, Centro Comercial Paseo Las Mercedes, Nivel Trasnocho, Municipio Baruta, Caracas, Miranda, Zona Postal 1080.',
          tel: '584241791193',
          lat: 10.479625, lng: -66.862438,
          mapsUrl: 'https://maps.app.goo.gl/9caGuaezD7hxQuuN6?g_st=aw'
        }
      ];

      /* Mapa vectorial nativo con Leaflet JS (100% compatible sin iframes) */
      const storeMapsLink = (s) =>
        s.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${s.lat}%2C${s.lng}`;

      const storesDots = document.getElementById('storesDots');
      const storesMapContainer = document.getElementById('storesMapContainer');
      const storeBadge = document.getElementById('storeBadge');
      const storeTitle = document.getElementById('storeTitle');
      const storeDesc = document.getElementById('storeDesc');
      const storeAddress = document.getElementById('storeAddress');
      const storeSchedule = document.getElementById('storeSchedule');
      const storeCoordsHud = document.getElementById('storeCoordsHud');
      const storeServicesTags = document.getElementById('storeServicesTags');
      const storeMapsBtn = document.getElementById('storeMapsBtn');
      const storeWaBtn = document.getElementById('storeWaBtn');
      const storeCopyBtn = document.getElementById('storeCopyBtn');
      const storePills = document.querySelectorAll('.store-nav-pill');
      let storeIndex = 0;
      let leafletMap = null;
      let currentMarker = null;

      const STORE_SERVICES = [
        ['Sede Matriz', 'Oficinas Directivas', 'Atención Mayorista', 'Asesoría Especializada'],
        ['Vitrina Oficial', 'Audio Hi-Treek', 'Laboratorio Care+', 'Venta Detal & Mayor'],
        ['Hub Oriental', 'Venta Mayorista', 'Despacho Regional', 'Garantía Oficial'],
        ['Abastecimiento Llanos', 'Venta Mayorista', 'Comercios Aliados', 'Soporte Directo'],
        ['Venta Detal', 'Alta Rotación', 'Protectores & Cases', 'Cables & GaN'],
        ['Eje Centroccidente', 'Venta Mayorista', 'Atención Detal', 'Repuestos Técnicos'],
        ['Tienda Física Boulevard', 'Venta Detal', 'Protectores Pantalla', 'Atención Express'],
        ['Alta Gama', 'Venta Detal & Mayor', 'Accesorios Premium', 'Atención Personalizada']
      ];

      if (storesMapContainer) {
        // Inicializar Leaflet Map
        try {
          if (typeof L !== 'undefined') {
            leafletMap = L.map('storesMapContainer', {
              center: [STORES[0].lat, STORES[0].lng],
              zoom: 17,
              zoomControl: true,
              attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 20,
              subdomains: ['a', 'b', 'c'],
              attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
            }).addTo(leafletMap);

            const customIcon = L.divIcon({
              className: 'custom-leaflet-pin',
              html: `<div style="background:#0C6CC0;border:3px solid #FFFFFF;border-radius:50%;width:22px;height:22px;box-shadow:0 0 14px rgba(56,189,248,0.9);display:flex;align-items:center;justify-content:center;"><div style="width:7px;height:7px;background:#FFFFFF;border-radius:50%;"></div></div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            currentMarker = L.marker([STORES[0].lat, STORES[0].lng], { icon: customIcon }).addTo(leafletMap);
          }
        } catch (e) {
          console.warn('Leaflet initialization fallback:', e);
        }

        if (storesDots) {
          STORES.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'stores-carousel__dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ver sede ${i + 1}`);
            dot.addEventListener('click', () => renderStore(i));
            storesDots.appendChild(dot);
          });
        }

        storePills.forEach((pill) => {
          pill.addEventListener('click', () => {
            const idx = parseInt(pill.getAttribute('data-store') || '0', 10);
            renderStore(idx);
          });
        });

        function renderStore(i) {
          storeIndex = (i + STORES.length) % STORES.length;
          const s = STORES[storeIndex];

          if (leafletMap && currentMarker) {
            leafletMap.flyTo([s.lat, s.lng], 17, { duration: 1.2 });
            currentMarker.setLatLng([s.lat, s.lng]);
            currentMarker.bindPopup(`<strong>${s.titulo}</strong><br><small>${s.direccion}</small>`).openPopup();
          }

          if (storeBadge) storeBadge.textContent = s.fecha;
          if (storeTitle) storeTitle.textContent = s.titulo;
          if (storeDesc) storeDesc.textContent = s.desc;
          if (storeAddress) storeAddress.textContent = s.direccion;
          if (storeSchedule) {
            storeSchedule.textContent = s.titulo.includes('Sambil')
              ? 'Horario: Lunes a Domingo, 10:00 AM – 8:00 PM (Horario Extendido)'
              : 'Horario: Lunes a Sábado, 8:00 AM – 6:00 PM';
          }
          if (storeCoordsHud) {
            storeCoordsHud.textContent = `${s.lat.toFixed(6)}° N, ${s.lng.toFixed(6)}° W`;
          }
          if (storeServicesTags) {
            const tags = STORE_SERVICES[storeIndex] || ['Venta Mayorista', 'Venta Detal', 'Garantía Oficial'];
            storeServicesTags.innerHTML = tags.map(t => `<span class="stores-service-tag">${t}</span>`).join('');
          }
          if (storeMapsBtn) storeMapsBtn.href = storeMapsLink(s);
          if (storeWaBtn) storeWaBtn.href = `https://wa.me/${s.tel || '584129777736'}?text=${encodeURIComponent(`Hola Lion Tech, me gustaría ponerme en contacto con la sede: ${s.titulo}`)}`;
          storeCopyBtn?.setAttribute('data-address', s.direccion);

          if (storesDots) {
            storesDots.querySelectorAll('.stores-carousel__dot').forEach((d, di) => {
              d.classList.toggle('active', di === storeIndex);
            });
          }
          storePills.forEach((p, pi) => {
            p.classList.toggle('active', pi === storeIndex);
          });
        }

        document.getElementById('storesPrev')?.addEventListener('click', () => renderStore(storeIndex - 1));
        document.getElementById('storesNext')?.addEventListener('click', () => renderStore(storeIndex + 1));

        renderStore(0);
      }

      // ---- Carrusel de fotos del equipo (sección Quiénes Somos) ----
      const teamTrack = document.getElementById('teamTrack');
      const teamDots = document.getElementById('teamDots');
      if (teamTrack && teamDots) {
        const teamSlides = teamTrack.querySelectorAll('.team-carousel__slide');
        let teamIndex = 0;
        let teamAutoplay;

        teamSlides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'team-carousel__dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Ver foto ${i + 1}`);
          dot.addEventListener('click', () => goToTeamSlide(i));
          teamDots.appendChild(dot);
        });

        function goToTeamSlide(i) {
          teamIndex = (i + teamSlides.length) % teamSlides.length;
          teamTrack.style.transform = `translateX(-${teamIndex * 100}%)`;
          teamDots.querySelectorAll('.team-carousel__dot').forEach((d, di) => {
            d.classList.toggle('active', di === teamIndex);
          });
        }

        function startTeamAutoplay() {
          teamAutoplay = setInterval(() => goToTeamSlide(teamIndex + 1), 4500);
        }

        function stopTeamAutoplay() {
          clearInterval(teamAutoplay);
        }

        document.getElementById('teamPrev')?.addEventListener('click', () => {
          goToTeamSlide(teamIndex - 1);
          stopTeamAutoplay();
          startTeamAutoplay();
        });
        document.getElementById('teamNext')?.addEventListener('click', () => {
          goToTeamSlide(teamIndex + 1);
          stopTeamAutoplay();
          startTeamAutoplay();
        });

        const teamCarouselEl = document.getElementById('teamCarousel');
        teamCarouselEl?.addEventListener('mouseenter', stopTeamAutoplay);
        teamCarouselEl?.addEventListener('mouseleave', startTeamAutoplay);

        goToTeamSlide(0);
        startTeamAutoplay();
      }

      // ---- Carrusel Showcase de la Manada (teamHeroCarousel) ----
      const teamHeroTrack = document.getElementById('teamHeroTrack');
      const teamHeroDots = document.getElementById('teamHeroDots');
      if (teamHeroTrack && teamHeroDots) {
        const heroSlides = teamHeroTrack.querySelectorAll('.team-hero-box__slide');
        let heroIndex = 0;
        let heroAutoplay;

        heroSlides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'team-hero-box__dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Ver foto ${i + 1}`);
          dot.addEventListener('click', () => goToHeroSlide(i));
          teamHeroDots.appendChild(dot);
        });

        function goToHeroSlide(i) {
          heroIndex = (i + heroSlides.length) % heroSlides.length;
          teamHeroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
          teamHeroDots.querySelectorAll('.team-hero-box__dot').forEach((d, di) => {
            d.classList.toggle('active', di === heroIndex);
          });
        }

        function startHeroAutoplay() {
          heroAutoplay = setInterval(() => goToHeroSlide(heroIndex + 1), 4000);
        }

        function stopHeroAutoplay() {
          clearInterval(heroAutoplay);
        }

        document.getElementById('teamHeroPrev')?.addEventListener('click', () => {
          goToHeroSlide(heroIndex - 1);
          stopHeroAutoplay();
          startHeroAutoplay();
        });
        document.getElementById('teamHeroNext')?.addEventListener('click', () => {
          goToHeroSlide(heroIndex + 1);
          stopHeroAutoplay();
          startHeroAutoplay();
        });

        const teamHeroCarouselEl = document.getElementById('teamHeroCarousel');
        teamHeroCarouselEl?.addEventListener('mouseenter', stopHeroAutoplay);
        teamHeroCarouselEl?.addEventListener('mouseleave', startHeroAutoplay);

        goToHeroSlide(0);
        startHeroAutoplay();
      }

      // ---- Carrusel de 2 aspectos en "Nuestra Esencia y Propósito" ----
      // (Aspecto 1: Nuestra Historia · Aspecto 2: ¿Quiénes somos?)
      const aboutCarousel = document.getElementById('aboutCarousel');
      if (aboutCarousel) {
        const aboutSlides = aboutCarousel.querySelectorAll('.about-carousel__slide');
        const aboutDots = aboutCarousel.querySelectorAll('.about-carousel__dot');

        function goToAboutSlide(index) {
          aboutSlides.forEach(slide => {
            slide.classList.toggle('is-active', Number(slide.dataset.slide) === index);
          });
          aboutDots.forEach(dot => {
            dot.classList.toggle('active', Number(dot.dataset.target) === index);
          });
        }

        aboutCarousel.querySelectorAll('[data-target]').forEach(btn => {
          btn.addEventListener('click', () => goToAboutSlide(Number(btn.dataset.target)));
        });
      }

      // ---- Carrusel de Redes Sociales / Territorio Digital (Estética Dinámica por Red) ----
      const socialTrack = document.getElementById('socialTrack');
      const socialTabs = document.querySelectorAll('.social-tab-btn');
      const socialDots = document.querySelectorAll('.social-dot');
      const socialPrev = document.getElementById('socialPrev');
      const socialNext = document.getElementById('socialNext');
      const socialContainer = document.getElementById('socialCarousel');
      const socialHubSection = document.getElementById('redes');
      const socialOrb1 = socialHubSection?.querySelector('.social-hub__glow-orb-1');
      const socialOrb2 = socialHubSection?.querySelector('.social-hub__glow-orb-2');

      const SOCIAL_THEMES = [
        {
          // 0: Instagram Oficial
          accent: '#E1306C',
          accentBg: 'rgba(225, 48, 108, 0.12)',
          accentBorder: 'rgba(225, 48, 108, 0.3)',
          titleGrad: 'linear-gradient(135deg, #FFFFFF 20%, #E1306C 60%, #FCAF45 100%)',
          glow1: 'radial-gradient(circle, rgba(225, 48, 108, 0.22) 0%, transparent 65%)',
          glow2: 'radial-gradient(circle, rgba(131, 58, 180, 0.2) 0%, transparent 65%)',
          tabBg: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #FCAF45 100%)',
          tabColor: '#FFFFFF',
          tabShadow: '0 8px 24px rgba(225, 48, 108, 0.4)'
        },
        {
          // 1: Facebook Oficial
          accent: '#1877F2',
          accentBg: 'rgba(24, 119, 242, 0.12)',
          accentBorder: 'rgba(24, 119, 242, 0.3)',
          titleGrad: 'linear-gradient(135deg, #FFFFFF 20%, #1877F2 60%, #00C6FF 100%)',
          glow1: 'radial-gradient(circle, rgba(24, 119, 242, 0.25) 0%, transparent 65%)',
          glow2: 'radial-gradient(circle, rgba(0, 198, 255, 0.2) 0%, transparent 65%)',
          tabBg: 'linear-gradient(135deg, #1877F2 0%, #0056C6 100%)',
          tabColor: '#FFFFFF',
          tabShadow: '0 8px 24px rgba(24, 119, 242, 0.4)'
        },
        {
          // 2: YouTube Oficial
          accent: '#FF3333',
          accentBg: 'rgba(255, 0, 0, 0.12)',
          accentBorder: 'rgba(255, 0, 0, 0.3)',
          titleGrad: 'linear-gradient(135deg, #FFFFFF 20%, #FF3333 55%, #B91C1C 100%)',
          glow1: 'radial-gradient(circle, rgba(255, 0, 0, 0.22) 0%, transparent 65%)',
          glow2: 'radial-gradient(circle, rgba(185, 28, 28, 0.2) 0%, transparent 65%)',
          tabBg: 'linear-gradient(135deg, #FF0000 0%, #B91C1C 100%)',
          tabColor: '#FFFFFF',
          tabShadow: '0 8px 24px rgba(255, 0, 0, 0.4)'
        },
        {
          // 3: Mercado Libre Oficial
          accent: '#FFE600',
          accentBg: 'rgba(255, 230, 0, 0.12)',
          accentBorder: 'rgba(255, 230, 0, 0.3)',
          titleGrad: 'linear-gradient(135deg, #FFFFFF 20%, #FFE600 55%, #F59E0B 100%)',
          glow1: 'radial-gradient(circle, rgba(255, 230, 0, 0.22) 0%, transparent 65%)',
          glow2: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 65%)',
          tabBg: 'linear-gradient(135deg, #FFE600 0%, #F59E0B 100%)',
          tabColor: '#001034',
          tabShadow: '0 8px 24px rgba(255, 230, 0, 0.4)'
        },
        {
          // 4: WhatsApp Mayorista
          accent: '#25D366',
          accentBg: 'rgba(37, 211, 102, 0.12)',
          accentBorder: 'rgba(37, 211, 102, 0.3)',
          titleGrad: 'linear-gradient(135deg, #FFFFFF 20%, #25D366 55%, #128C7E 100%)',
          glow1: 'radial-gradient(circle, rgba(37, 211, 102, 0.22) 0%, transparent 65%)',
          glow2: 'radial-gradient(circle, rgba(18, 140, 126, 0.2) 0%, transparent 65%)',
          tabBg: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          tabColor: '#001034',
          tabShadow: '0 8px 24px rgba(37, 211, 102, 0.4)'
        },
        {
          // 5: TikTok Lion Tech
          accent: '#25F4EE',
          accentBg: 'rgba(37, 244, 238, 0.12)',
          accentBorder: 'rgba(37, 244, 238, 0.3)',
          titleGrad: 'linear-gradient(135deg, #FFFFFF 20%, #25F4EE 50%, #FE2C55 100%)',
          glow1: 'radial-gradient(circle, rgba(37, 244, 238, 0.22) 0%, transparent 65%)',
          glow2: 'radial-gradient(circle, rgba(254, 44, 85, 0.2) 0%, transparent 65%)',
          tabBg: 'linear-gradient(135deg, #25F4EE 0%, #FE2C55 100%)',
          tabColor: '#000000',
          tabShadow: '0 8px 24px rgba(254, 44, 85, 0.4)'
        }
      ];

      if (socialTrack) {
        let currentSocialIndex = 0;
        const TOTAL_SOCIAL_SLIDES = 6;
        let socialAutoplayTimer = null;

        function goToSocialSlide(index) {
          currentSocialIndex = (index + TOTAL_SOCIAL_SLIDES) % TOTAL_SOCIAL_SLIDES;
          socialTrack.style.transform = `translateX(-${currentSocialIndex * 100}%)`;

          const theme = SOCIAL_THEMES[currentSocialIndex] || SOCIAL_THEMES[0];

          // Actualizar variables de color dinámicas en el contenedor de la sección
          if (socialHubSection) {
            socialHubSection.style.setProperty('--social-accent', theme.accent);
            socialHubSection.style.setProperty('--social-accent-bg', theme.accentBg);
            socialHubSection.style.setProperty('--social-accent-border', theme.accentBorder);
            socialHubSection.style.setProperty('--social-title-grad', theme.titleGrad);
          }
          if (socialOrb1) socialOrb1.style.background = theme.glow1;
          if (socialOrb2) socialOrb2.style.background = theme.glow2;

          socialTabs.forEach((tab, i) => {
            const isActive = i === currentSocialIndex;
            tab.classList.toggle('active', isActive);
            if (isActive) {
              tab.style.background = theme.tabBg;
              tab.style.color = theme.tabColor;
              tab.style.boxShadow = theme.tabShadow;
              tab.style.borderColor = 'transparent';
            } else {
              tab.style.background = '';
              tab.style.color = '';
              tab.style.boxShadow = '';
              tab.style.borderColor = '';
            }
          });

          socialDots.forEach((dot, i) => {
            const isActive = i === currentSocialIndex;
            dot.classList.toggle('active', isActive);
            if (isActive) {
              dot.style.background = theme.accent;
              dot.style.boxShadow = `0 0 14px ${theme.accent}`;
            } else {
              dot.style.background = '';
              dot.style.boxShadow = '';
            }
          });
        }

        socialTabs.forEach((tab) => {
          tab.addEventListener('click', () => {
            const idx = parseInt(tab.getAttribute('data-index') || '0', 10);
            goToSocialSlide(idx);
            restartSocialAutoplay();
          });
        });

        socialDots.forEach((dot) => {
          dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
            goToSocialSlide(idx);
            restartSocialAutoplay();
          });
        });

        socialPrev?.addEventListener('click', () => {
          goToSocialSlide(currentSocialIndex - 1);
          restartSocialAutoplay();
        });

        socialNext?.addEventListener('click', () => {
          goToSocialSlide(currentSocialIndex + 1);
          restartSocialAutoplay();
        });

        function startSocialAutoplay() {
          if (!socialAutoplayTimer) {
            socialAutoplayTimer = setInterval(() => {
              goToSocialSlide(currentSocialIndex + 1);
            }, 4800);
          }
        }

        function stopSocialAutoplay() {
          if (socialAutoplayTimer) {
            clearInterval(socialAutoplayTimer);
            socialAutoplayTimer = null;
          }
        }

        function restartSocialAutoplay() {
          stopSocialAutoplay();
          startSocialAutoplay();
        }

        socialContainer?.addEventListener('mouseenter', stopSocialAutoplay);
        socialContainer?.addEventListener('mouseleave', startSocialAutoplay);

        goToSocialSlide(0);
        startSocialAutoplay();
      }

      // ---- Navegación Interactiva de la Línea de Tiempo (HUD & Botones) ----
      const timelineHud = document.getElementById('timelineHud');
      const timelineEntries = document.querySelectorAll('.timeline-entry');
      const tlPrevBtn = document.getElementById('tlPrevBtn');
      const tlNextBtn = document.getElementById('tlNextBtn');
      let currentTlIndex = 0;

      if (timelineHud && timelineEntries.length > 0) {
        const hudBtns = timelineHud.querySelectorAll('.timeline-hud-btn');

        function activateTimelineEntry(index, shouldScroll = false) {
          currentTlIndex = (index + timelineEntries.length) % timelineEntries.length;
          const targetEntry = timelineEntries[currentTlIndex];
          const targetYear = targetEntry.getAttribute('data-year');

          hudBtns.forEach(btn => {
            const targetId = btn.getAttribute('data-tl-target');
            btn.classList.toggle('is-active', targetId === `tl-${targetYear}`);
          });

          timelineEntries.forEach((entry, i) => {
            entry.classList.toggle('is-active-entry', i === currentTlIndex);
          });

          if (shouldScroll && targetEntry) {
            targetEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }

        hudBtns.forEach((btn, i) => {
          btn.addEventListener('click', () => {
            activateTimelineEntry(i, true);
          });
        });

        tlPrevBtn?.addEventListener('click', () => {
          activateTimelineEntry(currentTlIndex - 1, true);
        });

        tlNextBtn?.addEventListener('click', () => {
          activateTimelineEntry(currentTlIndex + 1, true);
        });

        if ('IntersectionObserver' in window) {
          const tlObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const year = entry.target.getAttribute('data-year');
                timelineEntries.forEach((item, i) => {
                  if (item === entry.target) {
                    currentTlIndex = i;
                    item.classList.add('is-active-entry');
                  } else {
                    item.classList.remove('is-active-entry');
                  }
                });
                hudBtns.forEach(btn => {
                  const targetId = btn.getAttribute('data-tl-target');
                  btn.classList.toggle('is-active', targetId === `tl-${year}`);
                });
              }
            });
          }, {
            rootMargin: '-20% 0px -40% 0px',
            threshold: 0.15
          });

          timelineEntries.forEach(entry => tlObserver.observe(entry));
        }
      }

      // ==========================================================
      // SEGUIMIENTO MAGNÉTICO AL MOUSE — LOGO LION TECH HERO
      // ==========================================================
      (function initMagneticLogo() {
        const heroSection = document.getElementById('inicio');
        const floatingLogo = document.getElementById('heroFloatingLogo');

        if (!heroSection || !floatingLogo) return;

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let currentRotX = 0;
        let currentRotY = 0;
        let isHoveringHero = false;

        const updateMagneticPosition = (e) => {
          isHoveringHero = true;
          const rect = floatingLogo.getBoundingClientRect();
          const logoCenterX = rect.left + rect.width / 2;
          const logoCenterY = rect.top + rect.height / 2;

          const deltaX = e.clientX - logoCenterX;
          const deltaY = e.clientY - logoCenterY;
          const distance = Math.hypot(deltaX, deltaY);
          const maxDistance = 650; // radio de alcance magnético

          if (distance < maxDistance) {
            const power = 1 - distance / maxDistance;
            targetX = (deltaX * 0.28) * power;
            targetY = (deltaY * 0.28) * power;
            targetRotX = (-deltaY * 0.05) * power;
            targetRotY = (deltaX * 0.05) * power;
          } else {
            targetX = 0;
            targetY = 0;
            targetRotX = 0;
            targetRotY = 0;
          }
        };

        window.addEventListener('mousemove', (e) => {
          const heroRect = heroSection.getBoundingClientRect();
          if (e.clientY >= heroRect.top - 100 && e.clientY <= heroRect.bottom + 100) {
            updateMagneticPosition(e);
          } else if (isHoveringHero) {
            isHoveringHero = false;
            targetX = 0;
            targetY = 0;
            targetRotX = 0;
            targetRotY = 0;
          }
        }, { passive: true });

        const animateMagneticLogo = () => {
          currentX += (targetX - currentX) * 0.09;
          currentY += (targetY - currentY) * 0.09;
          currentRotX += (targetRotX - currentRotX) * 0.09;
          currentRotY += (targetRotY - currentRotY) * 0.09;

          if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01 || Math.abs(currentX) > 0.01) {
            floatingLogo.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
          }

          requestAnimationFrame(animateMagneticLogo);
        };

        requestAnimationFrame(animateMagneticLogo);
      })();



      // FIRMA DE AUTOR EN CONSOLA — By3lo
      // ==========================================================
      (function () {
        const styleTitle = 'background: #0C6CC0; color: #FFFFFF; font-weight: bold; font-size: 13px; padding: 6px 12px; border-radius: 4px 0 0 4px; font-family: "Poppins", sans-serif;';
        const styleAuthor = 'background: #001034; color: #60A5FA; font-weight: bold; font-size: 13px; padding: 6px 12px; border-radius: 0 4px 4px 0; font-family: "JetBrains Mono", monospace;';
        const styleSub = 'color: #0C6CC0; font-size: 11px; font-weight: 600; font-family: "JetBrains Mono", monospace; margin-top: 4px;';

        console.log('\n%cLion Tech Venezuela%cCreated by By3lo', styleTitle, styleAuthor);
        console.log('%cCode & UI crafted with excellence by By3lo | 2026\n', styleSub);
      })();
    });