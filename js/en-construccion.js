const params = new URLSearchParams(window.location.search);
    const sitio = params.get('sitio');
    const titleEl = document.getElementById('pageTitle');
    const descEl = document.getElementById('pageDescription');
    const logoEl = document.querySelector('.logo');
    const faviconEl = document.querySelector('link[rel="icon"]');

    if (sitio === 'hitreek') {
      document.title = 'Hi-Treek — En Construcción | Lion Tech';
      titleEl.textContent = 'Hi-Treek Oficial';
      descEl.textContent = 'La landing oficial de Hi-Treek se encuentra actualmente en construcción y optimización. Estará disponible muy pronto.';
      if (faviconEl) faviconEl.href = 'images/favicon-hitreek.png';
      if (logoEl) {
        logoEl.src = 'images/LOGO HI-TREEK PNG.png';
        logoEl.alt = 'Hi-Treek';
        logoEl.style.height = '120px';
      }
    } else if (sitio === 'mechanic') {
      document.title = 'Mechanic Venezuela — En Construcción | Lion Tech';
      titleEl.textContent = 'Mechanic Venezuela';
      descEl.textContent = 'La landing de repuestos, herramientas y maquinarias Mechanic Venezuela está en construcción. Pronto podrás ver todo el catálogo especializado.';
      if (faviconEl) faviconEl.href = 'images/mechanicve.jpg';
      if (logoEl) {
        logoEl.src = 'images/MECHANIC PNG AMARILLO.png';
        logoEl.alt = 'Mechanic Venezuela';
        logoEl.style.height = '120px';
      }
    } else if (sitio === 'care') {
      document.title = 'Lion Tech Care+ — En Construcción | Lion Tech';
      titleEl.textContent = 'Lion Tech Care+';
      descEl.textContent = 'Nuestro laboratorio especializado de servicio técnico de alta gama está preparando su nuevo portal. Pronto disponible.';
      if (faviconEl) faviconEl.href = 'images/liontechcareve.jpg';
      if (logoEl) {
        logoEl.src = 'images/care-logo-transparent.png';
        logoEl.alt = 'Lion Tech Care+';
        logoEl.style.height = '130px';
      }
    }