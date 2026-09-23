
    /* ================================================================
       MECHANIC VE — Datasheet Industrial · interactivity
       ================================================================ */
    (function () {
      'use strict';

      /* ---------------------------------------------------------
         1. FAQ NOTES — accessible accordion
         --------------------------------------------------------- */
      document.querySelectorAll('.faq-note__q').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var note = btn.closest('.faq-note');
          var isOpen = note.classList.contains('is-open');
          document.querySelectorAll('.faq-note').forEach(function (n) {
            n.classList.remove('is-open');
            var b = n.querySelector('.faq-note__q');
            if (b) b.setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            note.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });

      /* ---------------------------------------------------------
         2. SMOOTH SCROLL for internal anchors
         --------------------------------------------------------- */
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var href = a.getAttribute('href');
          if (!href || href === '#' || href.length < 2) return;
          try {
            var target = document.querySelector(href);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (err) {}
        });
      });

      /* ---------------------------------------------------------
         3. PRODUCT CARD STEPPERS (pre-add quantity)
         --------------------------------------------------------- */
      document.querySelectorAll('[data-stepper]').forEach(function (stepper) {
        var input = stepper.querySelector('.stepper__input');
        stepper.querySelectorAll('.stepper__btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var delta = parseInt(btn.getAttribute('data-step'), 10);
            var val = parseInt(input.value, 10) || 1;
            val = Math.min(99, Math.max(1, val + delta));
            input.value = val;
          });
        });
        input.addEventListener('change', function () {
          var val = parseInt(input.value, 10) || 1;
          input.value = Math.min(99, Math.max(1, val));
        });
      });

      /* ---------------------------------------------------------
         4. KIT CONFIGURATOR — quote builder over WhatsApp
         --------------------------------------------------------- */
      var KIT_STORAGE_KEY = 'mechanicKit';
      var SKU_ORDER = ['T12 PRO', 'UV559/BGA', 'MICRO 7-45X', 'ARMOR 9H+'];
      var WHATSAPP_NUMBER = '584242252655';

      var kitState = [];

      function loadKit() {
        try {
          var raw = window.localStorage.getItem(KIT_STORAGE_KEY);
          var parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) {
            kitState = parsed.filter(function (line) {
              return line && typeof line.sku === 'string' && typeof line.qty === 'number' && line.qty > 0;
            });
          }
        } catch (err) {
          kitState = [];
        }
      }

      function saveKit() {
        try {
          window.localStorage.setItem(KIT_STORAGE_KEY, JSON.stringify(kitState));
        } catch (err) {
          /* localStorage unavailable — kit still works for this session */
        }
      }

      function findLine(sku) {
        for (var i = 0; i < kitState.length; i++) {
          if (kitState[i].sku === sku) return kitState[i];
        }
        return null;
      }

      function addToKit(sku, name, qty) {
        qty = Math.min(99, Math.max(1, parseInt(qty, 10) || 1));
        var line = findLine(sku);
        if (line) {
          line.qty = Math.min(99, line.qty + qty);
        } else {
          kitState.push({ sku: sku, name: name, qty: qty });
        }
        saveKit();
        renderKitPanel();
      }

      function removeFromKit(sku) {
        kitState = kitState.filter(function (line) { return line.sku !== sku; });
        saveKit();
        renderKitPanel();
      }

      function updateKitQty(sku, qty) {
        var line = findLine(sku);
        if (!line) return;
        qty = Math.min(99, Math.max(1, parseInt(qty, 10) || 1));
        line.qty = qty;
        saveKit();
        renderKitPanel();
      }

      function clearKit() {
        kitState = [];
        saveKit();
        renderKitPanel();
      }

      function buildWhatsAppMessage() {
        var lines = [];
        lines.push('Hola Mechanic Venezuela, quiero cotizar el siguiente kit:');
        lines.push('');
        var totalUnits = 0;
        SKU_ORDER.forEach(function (sku) {
          var line = findLine(sku);
          if (line) {
            lines.push('• ' + line.name + ' (SKU ' + line.sku + ') — Cantidad: ' + line.qty);
            totalUnits += line.qty;
          }
        });
        lines.push('');
        lines.push('Total: ' + kitState.length + ' productos / ' + totalUnits + ' unidades.');
        lines.push('¿Me pueden confirmar disponibilidad y precio?');
        return lines.join('\n');
      }

      function openWhatsAppQuote() {
        if (kitState.length === 0) return;
        var message = buildWhatsAppMessage();
        var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
        window.open(url, '_blank', 'noopener,noreferrer');
      }

      var kitBadge = document.getElementById('kitBadge');
      var kitList = document.getElementById('kitList');
      var kitEmpty = document.getElementById('kitEmpty');
      var kitCount = document.getElementById('kitCount');
      var kitSubmit = document.getElementById('kitSubmit');

      function renderKitPanel() {
        var totalUnits = kitState.reduce(function (sum, l) { return sum + l.qty; }, 0);
        kitBadge.textContent = totalUnits + ' ITEM' + (totalUnits === 1 ? '' : 'S');
        kitCount.textContent = kitState.length + ' producto' + (kitState.length === 1 ? '' : 's');

        kitList.innerHTML = '';
        if (kitState.length === 0) {
          kitEmpty.style.display = 'block';
        } else {
          kitEmpty.style.display = 'none';
          kitState.forEach(function (line) {
            var row = document.createElement('div');
            row.className = 'kit-line';
            row.innerHTML =
              '<div class="kit-line__info">' +
              '<span class="kit-line__sku mono">SKU ' + line.sku + '</span>' +
              '<span class="kit-line__name">' + line.name + '</span>' +
              '</div>' +
              '<div class="kit-line__stepper">' +
              '<button type="button" data-kit-step="-1" aria-label="Reducir cantidad">−</button>' +
              '<span class="kit-line__qty">' + line.qty + '</span>' +
              '<button type="button" data-kit-step="1" aria-label="Aumentar cantidad">+</button>' +
              '</div>' +
              '<button type="button" class="kit-line__remove" data-kit-remove aria-label="Eliminar línea">×</button>';

            row.querySelector('[data-kit-step="-1"]').addEventListener('click', function () {
              var newQty = line.qty - 1;
              if (newQty <= 0) { removeFromKit(line.sku); } else { updateKitQty(line.sku, newQty); }
            });
            row.querySelector('[data-kit-step="1"]').addEventListener('click', function () {
              updateKitQty(line.sku, line.qty + 1);
            });
            row.querySelector('[data-kit-remove]').addEventListener('click', function () {
              removeFromKit(line.sku);
            });
            kitList.appendChild(row);
          });
        }

        if (kitState.length === 0) {
          kitSubmit.disabled = true;
          kitSubmit.textContent = 'Añade un producto para cotizar';
        } else {
          kitSubmit.disabled = false;
          kitSubmit.textContent = 'Generar Cotización por WhatsApp';
        }
      }

      document.querySelectorAll('[data-add-kit]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var sku = btn.getAttribute('data-sku');
          var name = btn.getAttribute('data-name');
          var card = btn.closest('.datasheet-card');
          var input = card ? card.querySelector('.stepper__input') : null;
          var qty = input ? parseInt(input.value, 10) : 1;
          addToKit(sku, name, qty);

          btn.classList.add('is-added');
          var original = btn.textContent;
          btn.textContent = 'Añadido ✓';
          setTimeout(function () {
            btn.classList.remove('is-added');
            btn.textContent = original;
          }, 1200);

          var kitPanel = document.getElementById('kitPanel');
          kitPanel.classList.add('is-open');
          document.getElementById('kitPanelTab').setAttribute('aria-expanded', 'true');
        });
      });

      document.getElementById('kitPanelTab').addEventListener('click', function () {
        var panel = document.getElementById('kitPanel');
        var isOpen = panel.classList.toggle('is-open');
        this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.getElementById('kitClear').addEventListener('click', clearKit);
      document.getElementById('kitSubmit').addEventListener('click', openWhatsAppQuote);

      loadKit();
      renderKitPanel();

      /* ---------------------------------------------------------
         5. REFLOW CURVE — canvas signature graphic (T12 card)
         --------------------------------------------------------- */
      (function initReflowCurve() {
        var canvas = document.getElementById('reflowCanvas');
        if (!canvas) return;
        var wrap = document.getElementById('reflowCanvasWrap');
        var cursorLine = document.getElementById('reflowCursor');
        var peakDot = document.getElementById('reflowPeakDot');
        var timeReadout = document.getElementById('reflowTime');
        var tempReadout = document.getElementById('reflowTemp');
        var ctx = canvas.getContext('2d');

        /* Real thermal profile keyframes: preheat ramp, flux-activation
           soak, 183°C tin-alloy melting peak, controlled cooldown. */
        var KEYFRAMES = [
          { t: 0, temp: 25 },
          { t: 90, temp: 150 },
          { t: 140, temp: 178 },
          { t: 158, temp: 183 },
          { t: 176, temp: 150 },
          { t: 200, temp: 90 },
          { t: 224, temp: 45 },
          { t: 240, temp: 28 }
        ];
        var TOTAL_TIME = KEYFRAMES[KEYFRAMES.length - 1].t;
        var PEAK_TIME = 158;
        var PEAK_TEMP = 183;
        var TEMP_MIN = 15;
        var TEMP_MAX = 195;
        var PAD_X = 6;
        var PAD_Y = 14;

        function tempAtTime(t) {
          t = Math.min(TOTAL_TIME, Math.max(0, t));
          for (var i = 0; i < KEYFRAMES.length - 1; i++) {
            var a = KEYFRAMES[i], b = KEYFRAMES[i + 1];
            if (t >= a.t && t <= b.t) {
              var ratio = (b.t === a.t) ? 0 : (t - a.t) / (b.t - a.t);
              return a.temp + (b.temp - a.temp) * ratio;
            }
          }
          return KEYFRAMES[KEYFRAMES.length - 1].temp;
        }

        function mapPoint(t, temp, w, h) {
          var x = PAD_X + (t / TOTAL_TIME) * (w - PAD_X * 2);
          var normTemp = (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);
          var y = (h - PAD_Y) - normTemp * (h - PAD_Y * 2);
          return { x: x, y: y };
        }

        var cssW = 0, cssH = 0, dpr = window.devicePixelRatio || 1;
        var samplePoints = [];

        function buildSamples() {
          samplePoints = [];
          var steps = 140;
          for (var i = 0; i <= steps; i++) {
            var t = (i / steps) * TOTAL_TIME;
            samplePoints.push({ t: t, temp: tempAtTime(t) });
          }
        }

        function resizeCanvas() {
          var rect = wrap.getBoundingClientRect();
          cssW = rect.width;
          cssH = rect.height;
          canvas.width = Math.max(1, Math.round(cssW * dpr));
          canvas.height = Math.max(1, Math.round(cssH * dpr));
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function drawGrid() {
          ctx.strokeStyle = 'rgba(107,91,140,0.18)';
          ctx.lineWidth = 1;
          for (var gx = 0; gx <= 4; gx++) {
            var x = PAD_X + (gx / 4) * (cssW - PAD_X * 2);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, cssH);
            ctx.stroke();
          }
          for (var gy = 0; gy <= 3; gy++) {
            var y = (gy / 3) * cssH;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cssW, y);
            ctx.stroke();
          }
        }

        function drawCurve(progress) {
          ctx.clearRect(0, 0, cssW, cssH);
          drawGrid();

          var count = Math.max(1, Math.round(samplePoints.length * progress));
          ctx.beginPath();
          ctx.strokeStyle = '#F4F1E8';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          for (var i = 0; i < count; i++) {
            var p = mapPoint(samplePoints[i].t, samplePoints[i].temp, cssW, cssH);
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();

          /* trailing sweep head, like an oscilloscope beam */
          if (count < samplePoints.length && count > 0) {
            var head = mapPoint(samplePoints[count - 1].t, samplePoints[count - 1].temp, cssW, cssH);
            ctx.beginPath();
            ctx.fillStyle = '#FFFF01';
            ctx.arc(head.x, head.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        function positionPeakDot() {
          var p = mapPoint(PEAK_TIME, PEAK_TEMP, cssW, cssH);
          peakDot.style.left = p.x + 'px';
          peakDot.style.top = p.y + 'px';
        }

        function updateReadout(t) {
          timeReadout.textContent = t.toFixed(1) + 's';
          tempReadout.textContent = Math.round(tempAtTime(t)) + '°C';
        }

        var animDone = false;

        function runSweepAnimation() {
          var duration = 1800;
          var start = null;
          function frame(ts) {
            if (start === null) start = ts;
            var elapsed = ts - start;
            var progress = Math.min(1, elapsed / duration);
            drawCurve(progress);
            if (progress < 1) {
              requestAnimationFrame(frame);
            } else {
              animDone = true;
              peakDot.style.opacity = '1';
              updateReadout(0);
            }
          }
          requestAnimationFrame(frame);
        }

        function setup() {
          resizeCanvas();
          buildSamples();
          positionPeakDot();
          drawCurve(0);
        }

        setup();
        window.addEventListener('resize', function () {
          resizeCanvas();
          positionPeakDot();
          drawCurve(animDone ? 1 : 0);
        });

        if ('IntersectionObserver' in window) {
          var curveObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && !animDone) {
                runSweepAnimation();
                curveObserver.disconnect();
              }
            });
          }, { threshold: 0.35 });
          curveObserver.observe(wrap);
        } else {
          runSweepAnimation();
        }

        /* Drag / touch cursor — read T and TEMP at any point, post-sweep */
        var dragging = false;

        function pointerToTime(clientX) {
          var rect = wrap.getBoundingClientRect();
          var x = Math.min(rect.width, Math.max(0, clientX - rect.left));
          var ratio = (x - PAD_X) / (rect.width - PAD_X * 2);
          ratio = Math.min(1, Math.max(0, ratio));
          return { t: ratio * TOTAL_TIME, x: x };
        }

        function handlePointer(clientX) {
          if (!animDone) return;
          var res = pointerToTime(clientX);
          cursorLine.style.opacity = '1';
          cursorLine.style.left = res.x + 'px';
          updateReadout(res.t);
        }

        wrap.addEventListener('pointerdown', function (e) {
          if (!animDone) return;
          dragging = true;
          wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId);
          handlePointer(e.clientX);
        });
        wrap.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          handlePointer(e.clientX);
        });
        window.addEventListener('pointerup', function () {
          dragging = false;
        });
      })();

      /* ── 8 SEDES EN VENEZUELA (CENTRO DE MANDO LEAFLET MECHANIC) ── */
      var STORES_MECH = [
        {
          fecha: 'Sede Principal · Centro de Caracas',
          titulo: 'Guarida Principal (Sede Sabana Grande / Centro)',
          desc: 'Nuestra sede matriz de distribución técnica, stock completo de instrumental Mechanic, estaciones y químicos para laboratorios y mayoristas.',
          direccion: 'Entre Blvd. Sabana Grande y Av. Casanova, Callejón Borges, Edif. Permontsa, Piso 2, Caracas 1050, Distrito Capital.',
          tel: '584129777736',
          lat: 10.492188, lng: -66.874063,
          mapsUrl: 'https://maps.app.goo.gl/uXfX1nFf9YJ4W2Fk8'
        },
        {
          fecha: 'Boulevard de Sabana Grande · Caracas',
          titulo: 'Tienda Plaza Venezuela',
          desc: 'Punto de venta y laboratorio técnico con exhibición de instrumental Mechanic y herramientas BGA.',
          direccion: 'Av. Abraham Lincoln con calle San Antonio, C.C. Cristal Plaza, Nivel P.B., Sabana Grande, Caracas.',
          tel: '584129922226',
          lat: 10.495438, lng: -66.880188,
          mapsUrl: 'https://maps.app.goo.gl/qKgoQasZqKECy7Dc7'
        },
        {
          fecha: 'Apertura: 12/05/2023 · Oriente',
          titulo: 'Sede Oriente — Puerto La Cruz',
          desc: 'Hub de distribución mayorista para talleres y laboratorios en el oriente venezolano.',
          direccion: 'Edif. La Inmaculada, Local PB-2, Av. Municipal, Puerto La Cruz 6023, Anzoátegui.',
          tel: '584127078428',
          lat: 10.202188, lng: -64.635188,
          mapsUrl: 'https://maps.app.goo.gl/SQZQ2TurkkFkjJoB6'
        },
        {
          fecha: 'Apertura: 21/05/2024 · Llanos',
          titulo: 'Sede Los Llanos — Apure',
          desc: 'Abastecimiento de consumibles de microsoldadura y repuestos en los Llanos venezolanos.',
          direccion: 'Edif. Valles del Bekka, Local C3, Av. Miranda, Sector Las Marías, San Fernando de Apure, Apure.',
          tel: '584242527305',
          lat: 7.888812, lng: -67.481188,
          mapsUrl: 'https://maps.app.goo.gl/QtDTt6tHW8gWeYPD6'
        },
        {
          fecha: 'Boulevard de Sabana Grande · Chacaíto',
          titulo: 'Tienda Chacaíto',
          desc: 'Punto estratégico de retiro rápido de estaño, flux, pinzas y repuestos de microelectrónica.',
          direccion: 'Edif. Royal Castle, Piso P.B., 2da Av. con Blvd. de Sabana Grande, Chacaíto, Caracas.',
          tel: '584127155566',
          lat: 10.492063, lng: -66.872563,
          mapsUrl: 'https://maps.app.goo.gl/UxZpevmf2oZtEEfM8'
        },
        {
          fecha: 'Sede Centro-Occidente · Lara',
          titulo: 'Sede Occidente — Barquisimeto',
          desc: 'Distribución mayorista de insumos Mechanic para la región centroccidental.',
          direccion: 'Edif. Ming, Piso P.B., Local 2, Carrera 19 entre calles 20 y 21, Barquisimeto 3001, Lara.',
          tel: '584127109992',
          lat: 10.067812, lng: -69.319437,
          mapsUrl: 'https://maps.app.goo.gl/4ZvzRfz17ZQjCFRb6'
        },
        {
          fecha: 'Boulevard de Sabana Grande · Caracas',
          titulo: 'Sede Sabana Grande (Tienda Física)',
          desc: 'Nuestra tienda física en el boulevard con atención personalizada para técnicos independientes y academias.',
          direccion: 'Av. Abraham Lincoln, C.C. Sabana Grande, frente a heladería La Poma, Sabana Grande, Caracas.',
          tel: '584127105591',
          lat: 10.493500, lng: -66.876200,
          mapsUrl: 'https://maps.app.goo.gl/eMsZdLB7Bg2ZHb8S8'
        },
        {
          fecha: 'C.C. Paseo Las Mercedes · Baruta',
          titulo: 'Tienda Paseo Las Mercedes',
          desc: 'Exhibición y distribución en Las Mercedes con asesoría técnica especializada.',
          direccion: 'Avenida Principal de Las Mercedes con Paseo Enrique Eraso, Centro Comercial Paseo Las Mercedes, Nivel Trasnocho, Municipio Baruta, Caracas, Miranda, Zona Postal 1080.',
          tel: '584241791193',
          lat: 10.479625, lng: -66.862438,
          mapsUrl: 'https://maps.app.goo.gl/Mm1spN3w5JX1LEFW6'
        }
      ];

      var storeMapsLinkMech = function(s) {
        return s.mapsUrl || ('https://www.google.com/maps/search/?api=1&query=' + s.lat + '%2C' + s.lng);
      };

      var storesDotsMech = document.getElementById('storesDots');
      var storesMapContainerMech = document.getElementById('storesMapContainer');
      var storeBadgeMech = document.getElementById('storeBadge');
      var storeTitleMech = document.getElementById('storeTitle');
      var storeDescMech = document.getElementById('storeDesc');
      var storeAddressMech = document.getElementById('storeAddress');
      var storeScheduleMech = document.getElementById('storeSchedule');
      var storeCoordsHudMech = document.getElementById('storeCoordsHud');
      var storeServicesTagsMech = document.getElementById('storeServicesTags');
      var storeMapsBtnMech = document.getElementById('storeMapsBtn');
      var storeWaBtnMech = document.getElementById('storeWaBtn');
      var storeCopyBtnMech = document.getElementById('storeCopyBtn');
      var storePillsMech = document.querySelectorAll('.store-nav-pill');
      var storeIndexMech = 0;
      var leafletMapMech = null;
      var currentMarkerMech = null;

      var STORE_SERVICES_MECH = [
        ['Sede Matriz', 'Mayorista & Laboratorio', 'Distribución Nacional', 'Instrumental Mechanic'],
        ['Vitrina Oficial', 'Microelectrónica', 'Herramientas BGA', 'Venta Mayor & Detal'],
        ['Hub Oriental', 'Venta Mayorista', 'Despacho Regional', 'Garantía Directa'],
        ['Abastecimiento Llanos', 'Venta Mayorista', 'Consumibles Soldadura', 'Soporte Directo'],
        ['Venta Detal', 'Retiro Rápido', 'Insumos BGA', 'Herramientas Precisión'],
        ['Eje Centroccidente', 'Venta Mayorista', 'Atención Técnica', 'Garantía Oficial'],
        ['Tienda Física Boulevard', 'Venta Detal', 'Insumos Químicos', 'Cashea 3 Cuotas'],
        ['Exhibición Premium', 'Venta Detal & Mayor', 'Instrumental Especializado', 'Atención Personalizada']
      ];

      if (storesMapContainerMech) {
        try {
          if (typeof L !== 'undefined') {
            leafletMapMech = L.map('storesMapContainer', {
              center: [STORES_MECH[0].lat, STORES_MECH[0].lng],
              zoom: 17,
              zoomControl: true,
              attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19,
              subdomains: 'abcd'
            }).addTo(leafletMapMech);

            var customIconMech = L.divIcon({
              className: 'custom-leaflet-pin-mech',
              html: '<div style="background:#FFFF01;border:3px solid #000000;border-radius:50%;width:22px;height:22px;box-shadow:0 0 14px rgba(255,255,1,0.9);display:flex;align-items:center;justify-content:center;"><div style="width:7px;height:7px;background:#000000;border-radius:50%;"></div></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            currentMarkerMech = L.marker([STORES_MECH[0].lat, STORES_MECH[0].lng], { icon: customIconMech }).addTo(leafletMapMech);
          }
        } catch (e) {
          console.warn('Leaflet initialization fallback:', e);
        }

        if (storesDotsMech) {
          STORES_MECH.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'stores-carousel__dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Ver sede ' + (i + 1));
            dot.addEventListener('click', function () { renderStoreMech(i); });
            storesDotsMech.appendChild(dot);
          });
        }

        storePillsMech.forEach(function (pill) {
          pill.addEventListener('click', function () {
            var idx = parseInt(pill.getAttribute('data-store') || '0', 10);
            renderStoreMech(idx);
          });
        });

        function renderStoreMech(i) {
          storeIndexMech = (i + STORES_MECH.length) % STORES_MECH.length;
          var s = STORES_MECH[storeIndexMech];

          if (leafletMapMech && currentMarkerMech) {
            leafletMapMech.flyTo([s.lat, s.lng], 17, { duration: 1.2 });
            currentMarkerMech.setLatLng([s.lat, s.lng]);
            currentMarkerMech.bindPopup('<strong>' + s.titulo + '</strong><br><small>' + s.direccion + '</small>').openPopup();
          }

          if (storeBadgeMech) storeBadgeMech.textContent = s.fecha;
          if (storeTitleMech) storeTitleMech.textContent = s.titulo;
          if (storeDescMech) storeDescMech.textContent = s.desc;
          if (storeAddressMech) storeAddressMech.textContent = s.direccion;
          if (storeScheduleMech) {
            storeScheduleMech.textContent = 'Horario: Lunes a Sábado, 8:00 AM – 6:00 PM';
          }
          if (storeCoordsHudMech) {
            storeCoordsHudMech.textContent = s.lat.toFixed(6) + '° N, ' + s.lng.toFixed(6) + '° W';
          }
          if (storeServicesTagsMech) {
            var tags = STORE_SERVICES_MECH[storeIndexMech] || ['Distribución Oficial', 'Microelectrónica', 'Venta Mayor & Detal'];
            storeServicesTagsMech.innerHTML = tags.map(function (t) { return '<span class="stores-service-tag">' + t + '</span>'; }).join('');
          }
          if (storeMapsBtnMech) storeMapsBtnMech.href = storeMapsLinkMech(s);
          if (storeWaBtnMech) storeWaBtnMech.href = 'https://wa.me/' + (s.tel || '584242252655') + '?text=' + encodeURIComponent('Hola Mechanic Venezuela, me gustaría consultar disponibilidad de productos en la sede: ' + s.titulo);
          storeCopyBtnMech?.setAttribute('data-address', s.direccion);

          if (storesDotsMech) {
            storesDotsMech.querySelectorAll('.stores-carousel__dot').forEach(function (d, di) {
              d.classList.toggle('active', di === storeIndexMech);
            });
          }

          storePillsMech.forEach(function (pill) {
            var pIdx = parseInt(pill.getAttribute('data-store') || '0', 10);
            pill.classList.toggle('active', pIdx === storeIndexMech);
          });
        }

        document.getElementById('storesPrev')?.addEventListener('click', function () { renderStoreMech(storeIndexMech - 1); });
        document.getElementById('storesNext')?.addEventListener('click', function () { renderStoreMech(storeIndexMech + 1); });

        storeCopyBtnMech?.addEventListener('click', function () {
          var addr = storeCopyBtnMech.getAttribute('data-address');
          if (addr) {
            navigator.clipboard.writeText(addr).then(function () {
              var span = storeCopyBtnMech.querySelector('span');
              var orig = span ? span.textContent : 'Copiar dirección';
              if (span) span.textContent = '¡Dirección Copiada!';
              setTimeout(function () { if (span) span.textContent = orig; }, 1800);
            });
          }
        });

        renderStoreMech(0);
      }

      /* ── FILTRADO POR CATEGORÍAS (CATÁLOGO MECHANIC) ── */
      var mechTabBtns = document.querySelectorAll('.mech-tab-btn');
      var datasheetCards = document.querySelectorAll('.datasheet-card, .mech-gallery-item');

      mechTabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');
          mechTabBtns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');

          datasheetCards.forEach(function (card) {
            var cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = 'block';
              card.style.opacity = '0';
              card.style.transform = 'translateY(18px)';
              setTimeout(function () {
                card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 40);
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    })();
  