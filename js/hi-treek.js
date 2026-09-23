/* ── 8 SEDES EN VENEZUELA (CENTRO DE MANDO LEAFLET HI-TREEK) ── */
    const STORES_HITREEK = [
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

    const storeMapsLinkTreek = (s) =>
      s.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${s.lat}%2C${s.lng}`;

    const storesDotsTreek = document.getElementById('storesDots');
    const storesMapContainerTreek = document.getElementById('storesMapContainer');
    const storeBadgeTreek = document.getElementById('storeBadge');
    const storeTitleTreek = document.getElementById('storeTitle');
    const storeDescTreek = document.getElementById('storeDesc');
    const storeAddressTreek = document.getElementById('storeAddress');
    const storeScheduleTreek = document.getElementById('storeSchedule');
    const storeCoordsHudTreek = document.getElementById('storeCoordsHud');
    const storeServicesTagsTreek = document.getElementById('storeServicesTags');
    const storeMapsBtnTreek = document.getElementById('storeMapsBtn');
    const storeWaBtnTreek = document.getElementById('storeWaBtn');
    const storeCopyBtnTreek = document.getElementById('storeCopyBtn');
    const storePillsTreek = document.querySelectorAll('.store-nav-pill');
    let storeIndexTreek = 0;
    let leafletMapTreek = null;
    let currentMarkerTreek = null;

    const STORE_SERVICES_TREEK = [
      ['Sede Matriz', 'Oficinas Directivas', 'Atención Mayorista', 'Ecosistema Hi-Treek'],
      ['Vitrina Oficial', 'Audio Hi-Treek', 'Smartwatches AMOLED', 'Venta Detal & Mayor'],
      ['Hub Oriental', 'Venta Mayorista', 'Despacho Regional', 'Garantía 1 Año'],
      ['Abastecimiento Llanos', 'Venta Mayorista', 'Comercios Aliados', 'Soporte Directo'],
      ['Venta Detal', 'Alta Rotación', 'Carga Rápida GaN', 'Audífonos Bluetooth'],
      ['Eje Centroccidente', 'Venta Mayorista', 'Atención Detal', 'Garantía Oficial'],
      ['Tienda Física Boulevard', 'Venta Detal', 'Accesorios Premium', 'Cashea 3 Cuotas'],
      ['Alta Gama', 'Venta Detal & Mayor', 'Ecosistema Hi-Treek', 'Atención Personalizada']
    ];

    if (storesMapContainerTreek) {
      try {
        if (typeof L !== 'undefined') {
          leafletMapTreek = L.map('storesMapContainer', {
            center: [STORES_HITREEK[0].lat, STORES_HITREEK[0].lng],
            zoom: 17,
            zoomControl: true,
            attributionControl: false
          });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c']
          }).addTo(leafletMapTreek);

          const customIconTreek = L.divIcon({
            className: 'custom-leaflet-pin-treek',
            html: `<div style="background:#D9BB84;border:3px solid #06090e;border-radius:50%;width:22px;height:22px;box-shadow:0 0 14px rgba(217,187,132,0.9);display:flex;align-items:center;justify-content:center;"><div style="width:7px;height:7px;background:#06090e;border-radius:50%;"></div></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          currentMarkerTreek = L.marker([STORES_HITREEK[0].lat, STORES_HITREEK[0].lng], { icon: customIconTreek }).addTo(leafletMapTreek);
        }
      } catch (e) {
        console.warn('Leaflet initialization fallback:', e);
      }

      if (storesDotsTreek) {
        STORES_HITREEK.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'stores-carousel__dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Ver sede ${i + 1}`);
          dot.addEventListener('click', () => renderStoreTreek(i));
          storesDotsTreek.appendChild(dot);
        });
      }

      storePillsTreek.forEach((pill) => {
        pill.addEventListener('click', () => {
          const idx = parseInt(pill.getAttribute('data-store') || '0', 10);
          renderStoreTreek(idx);
        });
      });

      function renderStoreTreek(i) {
        storeIndexTreek = (i + STORES_HITREEK.length) % STORES_HITREEK.length;
        const s = STORES_HITREEK[storeIndexTreek];

        if (leafletMapTreek && currentMarkerTreek) {
          leafletMapTreek.flyTo([s.lat, s.lng], 17, { duration: 1.2 });
          currentMarkerTreek.setLatLng([s.lat, s.lng]);
          currentMarkerTreek.bindPopup(`<strong>${s.titulo}</strong><br><small>${s.direccion}</small>`).openPopup();
        }

        if (storeBadgeTreek) storeBadgeTreek.textContent = s.fecha;
        if (storeTitleTreek) storeTitleTreek.textContent = s.titulo;
        if (storeDescTreek) storeDescTreek.textContent = s.desc;
        if (storeAddressTreek) storeAddressTreek.textContent = s.direccion;
        if (storeScheduleTreek) {
          storeScheduleTreek.textContent = 'Horario: Lunes a Sábado, 8:00 AM – 6:00 PM';
        }
        if (storeCoordsHudTreek) {
          storeCoordsHudTreek.textContent = `${s.lat.toFixed(6)}° N, ${s.lng.toFixed(6)}° W`;
        }
        if (storeServicesTagsTreek) {
          const tags = STORE_SERVICES_TREEK[storeIndexTreek] || ['Venta Mayorista', 'Venta Detal', 'Garantía 1 Año'];
          storeServicesTagsTreek.innerHTML = tags.map(t => `<span class="stores-service-tag">${t}</span>`).join('');
        }
        if (storeMapsBtnTreek) storeMapsBtnTreek.href = storeMapsLinkTreek(s);
        if (storeWaBtnTreek) storeWaBtnTreek.href = `https://wa.me/${s.tel || '584127155566'}?text=${encodeURIComponent(`Hola Hi-Treek, me gustaría consultar disponibilidad de productos en la sede: ${s.titulo}`)}`;
        storeCopyBtnTreek?.setAttribute('data-address', s.direccion);

        if (storesDotsTreek) {
          storesDotsTreek.querySelectorAll('.stores-carousel__dot').forEach((d, di) => {
            d.classList.toggle('active', di === storeIndexTreek);
          });
        }

        storePillsTreek.forEach((pill) => {
          const pIdx = parseInt(pill.getAttribute('data-store') || '0', 10);
          pill.classList.toggle('active', pIdx === storeIndexTreek);
        });
      }

      document.getElementById('storesPrev')?.addEventListener('click', () => renderStoreTreek(storeIndexTreek - 1));
      document.getElementById('storesNext')?.addEventListener('click', () => renderStoreTreek(storeIndexTreek + 1));

      storeCopyBtnTreek?.addEventListener('click', () => {
        const addr = storeCopyBtnTreek.getAttribute('data-address');
        if (addr) {
          navigator.clipboard.writeText(addr).then(() => {
            const span = storeCopyBtnTreek.querySelector('span');
            const orig = span ? span.textContent : 'Copiar dirección';
            if (span) span.textContent = '¡Dirección Copiada!';
            setTimeout(() => { if (span) span.textContent = orig; }, 1800);
          });
        }
      });

      renderStoreTreek(0);
    }



    /* ── FILTRADO Y ANIMACIÓN SCROLL POR CATEGORÍA (HI-TREEK) ── */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.product-card');
    const catalogSection = document.getElementById('catalogoEcosistema');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = btn.getAttribute('data-filter');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filtrado y animación escalonada de tarjetas
        let visibleCount = 0;
        productCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, visibleCount * 45 + 30);
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        // Desplazamiento suave (scroll) centrado al catálogo
        if (catalogSection && e.isTrusted) {
          const topPos = catalogSection.getBoundingClientRect().top + window.pageYOffset - 85;
          window.scrollTo({
            top: topPos,
            behavior: 'smooth'
          });
        }
      });
    });