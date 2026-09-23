document.addEventListener('DOMContentLoaded', () => {

      /* ── 1. TIMELINE ANIMADA al entrar al viewport ── */
      const timeline = document.querySelector('.process-timeline');
      if (timeline) {
        const tlObs = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            timeline.classList.add('is-animated');
            tlObs.disconnect();
          }
        }, { threshold: 0.4 });
        tlObs.observe(timeline);
      }

      /* ── 2. SCROLL REVEAL general con delay opcional ── */
      document.querySelectorAll('.care-reveal, .care-reveal-left').forEach(el => {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              const delay = parseInt(e.target.dataset.delay || 0);
              setTimeout(() => e.target.classList.add('is-visible'), delay);
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
        obs.observe(el);
      });

      /* ── 3. FAQ TERMINAL accordion ── */
      document.querySelectorAll('.faq-line__q').forEach(btn => {
        btn.addEventListener('click', () => {
          const line = btn.closest('.faq-line');
          const isOpen = line.classList.contains('is-open');
          document.querySelectorAll('.faq-line').forEach(l => {
            l.classList.remove('is-open');
            l.querySelector('.faq-line__q').setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            line.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });

      /* ── 4. Smooth Scroll Seguro para anclas internas ── */
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const href = a.getAttribute('href');
          if (!href || href === '#' || href.length < 2) return;
          try {
            const target = document.querySelector(href);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (err) {}
        });
      });

      /* ── 5. Cyber Vault: Pestañas Interactivas de Certificaciones ── */
      const certTabs = document.querySelectorAll('.cert-nav-tab');
      const certPanels = document.querySelectorAll('.cert-display-panel');

      certTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const tabId = tab.dataset.tab;

          certTabs.forEach(t => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          certPanels.forEach(p => p.classList.remove('is-active'));

          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          const activePanel = document.getElementById(`certPanel${tabId}`);
          if (activePanel) activePanel.classList.add('is-active');
        });
      });

      /* ── 6. Modal Lightbox de Certificados ── */
      const certModal = document.getElementById('certModal');
      const certModalImg = document.getElementById('certModalImg');
      const certModalCaption = document.getElementById('certModalCaption');
      const certModalClose = document.getElementById('certModalClose');
      const certModalBackdrop = document.getElementById('certModalBackdrop');

      window.openCertModal = function (src, title) {
        if (certModal && certModalImg) {
          certModalImg.src = src;
          if (certModalCaption) certModalCaption.textContent = title || 'Certificación Técnica Oficial';
          certModal.classList.add('is-open');
          certModal.setAttribute('aria-hidden', 'false');
        }
      };

      function closeCertModal() {
        if (certModal) {
          certModal.classList.remove('is-open');
          certModal.setAttribute('aria-hidden', 'true');
        }
      }

      certModalClose?.addEventListener('click', closeCertModal);
      certModalBackdrop?.addEventListener('click', closeCertModal);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCertModal();
      });

      /* ── 7. Centro de Mando: 8 Sedes Oficiales con Leaflet JS ── */
      const STORES_CARE = [
        {
          fecha: 'Sede Principal · Centro de Caracas',
          titulo: 'Guarida Principal (Sede Sabana Grande / Centro)',
          desc: 'Nuestra sede matriz de distribución técnica y centro neurálgico para mayoristas y aliados en todo el país.',
          direccion: 'Entre Blvd. Sabana Grande y Av. Casanova, Callejón Borges, Edif. Permontsa, Piso 2, Caracas 1050, Distrito Capital.',
          tel: '584129777736',
          lat: 10.492188, lng: -66.874063,
          mapsUrl: 'https://maps.app.goo.gl/uXfX1nFf9YJ4W2Fk8'
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
          desc: 'Ubicada estratégicamente en el extremo comercial este del boulevard con amplio stock de accesorios.',
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
          mapsUrl: 'https://maps.app.goo.gl/eMsZdLB7Bg2ZHb8S8'
        },
        {
          fecha: 'C.C. Paseo Las Mercedes · Baruta',
          titulo: 'Tienda Paseo Las Mercedes',
          desc: 'Nuestra exclusiva tienda en Las Mercedes con catálogo completo de accesorios de alta gama, repuestos y atención personalizada.',
          direccion: 'Avenida Principal de Las Mercedes con Paseo Enrique Eraso, Centro Comercial Paseo Las Mercedes, Nivel Trasnocho, Municipio Baruta, Caracas, Miranda, Zona Postal 1080.',
          tel: '584241791193',
          lat: 10.479625, lng: -66.862438,
          mapsUrl: 'https://maps.app.goo.gl/Mm1spN3w5JX1LEFW6'
        }
      ];

      const storeMapsLinkCare = (s) =>
        s.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${s.lat}%2C${s.lng}`;

      const storesDotsCare = document.getElementById('storesDots');
      const storesMapContainerCare = document.getElementById('storesMapContainer');
      const storeBadgeCare = document.getElementById('storeBadge');
      const storeTitleCare = document.getElementById('storeTitle');
      const storeDescCare = document.getElementById('storeDesc');
      const storeAddressCare = document.getElementById('storeAddress');
      const storeScheduleCare = document.getElementById('storeSchedule');
      const storeCoordsHudCare = document.getElementById('storeCoordsHud');
      const storeServicesTagsCare = document.getElementById('storeServicesTags');
      const storeMapsBtnCare = document.getElementById('storeMapsBtn');
      const storeWaBtnCare = document.getElementById('storeWaBtn');
      const storeCopyBtnCare = document.getElementById('storeCopyBtn');
      const storePillsCare = document.querySelectorAll('.store-nav-pill');
      let storeIndexCare = 0;
      let leafletMapCare = null;
      let currentMarkerCare = null;

      const STORE_SERVICES_CARE = [
        ['Laboratorio Matriz', 'Microelectrónica', 'Diagnóstico Avanzado', 'Atención Corporativa'],
        ['Vitrina Oficial', 'Laboratorio Care+', 'Diagnóstico Express', 'Venta Detal & Mayor'],
        ['Hub Oriental', 'Servicio Técnico', 'Despacho Regional', 'Garantía Oficial'],
        ['Abastecimiento Llanos', 'Recepción Técnica', 'Comercios Aliados', 'Soporte Directo'],
        ['Atención Express', 'Cambio de Pantallas', 'Diagnóstico Inmediato', 'Cashea 3 Cuotas'],
        ['Eje Centroccidente', 'Laboratorio Autorizado', 'Repuestos Técnicos', 'Garantía Escrita'],
        ['Tienda Física Boulevard', 'Atención Personalizada', 'Instalación Express', 'Servicio Técnico'],
        ['Alta Gama', 'Laboratorio Premium', 'Diagnóstico Especializado', 'Atención Personalizada']
      ];

      if (storesMapContainerCare) {
        try {
          if (typeof L !== 'undefined') {
            leafletMapCare = L.map('storesMapContainer', {
              center: [STORES_CARE[0].lat, STORES_CARE[0].lng],
              zoom: 17,
              zoomControl: true,
              attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19,
              subdomains: 'abcd'
            }).addTo(leafletMapCare);

            const customIconCare = L.divIcon({
              className: 'custom-leaflet-pin-care',
              html: `<div style="background:#1A7AC5;border:3px solid #FFFFFF;border-radius:50%;width:22px;height:22px;box-shadow:0 0 14px rgba(39,205,242,0.9);display:flex;align-items:center;justify-content:center;"><div style="width:7px;height:7px;background:#27CDF2;border-radius:50%;"></div></div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            currentMarkerCare = L.marker([STORES_CARE[0].lat, STORES_CARE[0].lng], { icon: customIconCare }).addTo(leafletMapCare);
          }
        } catch (e) {
          console.warn('Leaflet initialization fallback:', e);
        }

        if (storesDotsCare) {
          STORES_CARE.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'stores-carousel__dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ver sede ${i + 1}`);
            dot.addEventListener('click', () => renderStoreCare(i));
            storesDotsCare.appendChild(dot);
          });
        }

        storePillsCare.forEach((pill) => {
          pill.addEventListener('click', () => {
            const idx = parseInt(pill.getAttribute('data-store') || '0', 10);
            renderStoreCare(idx);
          });
        });

        function renderStoreCare(i) {
          storeIndexCare = (i + STORES_CARE.length) % STORES_CARE.length;
          const s = STORES_CARE[storeIndexCare];

          if (leafletMapCare && currentMarkerCare) {
            leafletMapCare.flyTo([s.lat, s.lng], 17, { duration: 1.2 });
            currentMarkerCare.setLatLng([s.lat, s.lng]);
            currentMarkerCare.bindPopup(`<strong>${s.titulo}</strong><br><small>${s.direccion}</small>`).openPopup();
          }

          if (storeBadgeCare) storeBadgeCare.textContent = s.fecha;
          if (storeTitleCare) storeTitleCare.textContent = s.titulo;
          if (storeDescCare) storeDescCare.textContent = s.desc;
          if (storeAddressCare) storeAddressCare.textContent = s.direccion;
          if (storeScheduleCare) {
            storeScheduleCare.textContent = 'Horario: Lunes a Sábado, 8:00 AM – 6:00 PM';
          }
          if (storeCoordsHudCare) {
            storeCoordsHudCare.textContent = `${s.lat.toFixed(6)}° N, ${s.lng.toFixed(6)}° W`;
          }
          if (storeServicesTagsCare) {
            const tags = STORE_SERVICES_CARE[storeIndexCare] || ['Diagnóstico Express', 'Microelectrónica', 'Garantía Care+'];
            storeServicesTagsCare.innerHTML = tags.map(t => `<span class="stores-service-tag">${t}</span>`).join('');
          }
          if (storeMapsBtnCare) storeMapsBtnCare.href = storeMapsLinkCare(s);
          if (storeWaBtnCare) storeWaBtnCare.href = `https://wa.me/${s.tel || '584142758251'}?text=${encodeURIComponent(`Hola Lion Tech Care+, deseo consultar sobre servicio técnico en la sede: ${s.titulo}`)}`;
          storeCopyBtnCare?.setAttribute('data-address', s.direccion);

          if (storesDotsCare) {
            storesDotsCare.querySelectorAll('.stores-carousel__dot').forEach((d, di) => {
              d.classList.toggle('active', di === storeIndexCare);
            });
          }

          storePillsCare.forEach((pill) => {
            const pIdx = parseInt(pill.getAttribute('data-store') || '0', 10);
            pill.classList.toggle('active', pIdx === storeIndexCare);
          });
        }

        document.getElementById('storesPrev')?.addEventListener('click', () => renderStoreCare(storeIndexCare - 1));
        document.getElementById('storesNext')?.addEventListener('click', () => renderStoreCare(storeIndexCare + 1));

        storeCopyBtnCare?.addEventListener('click', () => {
          const addr = storeCopyBtnCare.getAttribute('data-address');
          if (addr) {
            navigator.clipboard.writeText(addr).then(() => {
              const span = storeCopyBtnCare.querySelector('span');
              const orig = span ? span.textContent : 'Copiar dirección';
              if (span) span.textContent = '¡Dirección Copiada!';
              setTimeout(() => { if (span) span.textContent = orig; }, 1800);
            });
          }
        });

        renderStoreCare(0);
      }

      /* ── 8. Carrusel de Nosotros (Nuestra Historia / ¿Quiénes somos?) ── */
      const aboutCarousel = document.getElementById('aboutCarousel');
      if (aboutCarousel) {
        const slides = aboutCarousel.querySelectorAll('.about-carousel__slide');
        const dots = aboutCarousel.querySelectorAll('.about-carousel__dot');

        function setAboutSlide(idx) {
          slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }

        aboutCarousel.querySelectorAll('[data-target]').forEach(btn => {
          btn.addEventListener('click', () => {
            const targetIdx = parseInt(btn.getAttribute('data-target'), 10);
            setAboutSlide(targetIdx);
          });
        });
      }

      /* ── 9. Carrusel de Fotos del Equipo ── */
      const teamTrack = document.getElementById('teamTrack');
      const teamDotsContainer = document.getElementById('teamDots');
      const teamPrev = document.getElementById('teamPrev');
      const teamNext = document.getElementById('teamNext');

      if (teamTrack && teamDotsContainer) {
        const slides = teamTrack.querySelectorAll('.team-carousel__slide');
        let currentTeamIdx = 0;

        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'team-carousel__dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Foto ${i + 1}`);
          dot.addEventListener('click', () => setTeamSlide(i));
          teamDotsContainer.appendChild(dot);
        });

        function setTeamSlide(idx) {
          currentTeamIdx = (idx + slides.length) % slides.length;
          teamTrack.style.transform = `translateX(-${currentTeamIdx * 100}%)`;
          teamDotsContainer.querySelectorAll('.team-carousel__dot').forEach((d, i) => {
            d.classList.toggle('active', i === currentTeamIdx);
          });
        }

        teamPrev?.addEventListener('click', () => setTeamSlide(currentTeamIdx - 1));
        teamNext?.addEventListener('click', () => setTeamSlide(currentTeamIdx + 1));
      }

    });