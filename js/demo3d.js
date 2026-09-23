/* ==========================================================================
   LION TECH VENEZUELA — SHOWCASE 3D EN SCROLL  (sección #demo3d)
   --------------------------------------------------------------------------
   iPhone 17 Pro Max en Cosmic Orange + forro, cargador, cable, power bank y
   audífonos. TODO generado por código con Three.js: no carga ningún archivo
   externo (.glb, .obj, imágenes), así que funciona abriendo LionTech.html con
   doble clic (file://).

   CÓMO INSTALARLO
   1. Guarda este archivo como  demo3d.js  junto a tu LionTech.html.
   2. En LionTech.html, borra por completo el ÚLTIMO bloque <script>...</script>
      (el que empieza con "(function initPhone3D()") y déjalo así:

          <script src="vendor/gsap.min.js"></script>
          <script src="vendor/ScrollTrigger.min.js"></script>
          <script src="vendor/three.min.js"></script>
          <script src="demo3d.js"></script>
      </body>
      </html>

   3. Añade la etiqueta </body> que le falta a tu archivo, justo antes de </html>.

   Ya NO hace falta el parche de buildFrontTexture(): esa función desapareció.
   El fallo del "tainted canvas" no puede volver a ocurrir porque la pantalla
   se dibuja 100% por código, sin usar LionTech.png como textura.

   CÓMO PERSONALIZARLO
   - Colores del teléfono y accesorios: bloque "PALETA", más abajo.
   - Tamaño del teléfono: bloque "MEDIDAS DEL TELÉFONO".
   - Qué accesorio aparece y cuándo: array "accesorios" (campos desde/hasta,
     en progreso de scroll de 0 a 1).
   - Ángulo del teléfono en cada momento: array "ROT_KEYS".
   ========================================================================== */
(function initPhone3D() {
  try {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
      console.error('[demo3d] No cargaron Three.js o GSAP. Revisa la carpeta vendor/.');
      return;
    }

    var canvas = document.getElementById('phone3dCanvas');
    var section = document.getElementById('demo3d');
    if (!canvas || !section) return;

    gsap.registerPlugin(ScrollTrigger);
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ======================================================================
       PALETA — cambia estos valores para recolorear todo el showcase
       ====================================================================== */
    var COSMIC_ORANGE = 0xC85E2E;   // Cuerpo de aluminio del iPhone 17 Pro Max
    var ORANGE_DEEP   = 0xA8481D;   // Sombras / meseta de cámaras
    var ORANGE_LIGHT  = 0xE79055;   // Brillos
    var LION_BLUE     = 0x0C6CC0;
    var LION_NAVY     = 0x001034;
    var WHITE_PLASTIC = 0xF4F6F8;

    /* ======================================================================
       MEDIDAS DEL TELÉFONO
       ====================================================================== */
    var PW = 1.12;    // ancho
    var PH = 2.34;    // alto
    var PD = 0.135;   // grosor
    var PR = 0.235;   // radio de esquina
    var CAMERA_Z = 7;
    var CAMERA_FOV = 30;

    /* ======================================================================
       ESCENA BASE
       ====================================================================== */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1, 100
    );
    camera.position.set(0, 0, CAMERA_Z);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    }

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    /* ======================================================================
       LUCES — pensadas para que el aluminio naranja tenga reflejos vivos
       ====================================================================== */
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x0a1428, 0.55));

    var keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
    keyLight.position.set(4, 5, 7);
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0x3b9eff, 1.45);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    var warmLight = new THREE.DirectionalLight(0xffb37a, 0.55);
    warmLight.position.set(5, -3, 2);
    scene.add(warmLight);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.40);
    fillLight.position.set(-3, 3, 4);
    scene.add(fillLight);

    /* ======================================================================
       CORRECCIÓN DE COLOR
       ----------------------------------------------------------------------
       Three r128 con outputEncoding = sRGB trata los colores de material como
       LINEALES. Si se pasan tal cual en hexadecimal (que es sRGB), todo se
       renderiza lavado: un azul marino sale celeste. Hay que convertirlos.
       ====================================================================== */
    function aLineal(c) { if (c && c.convertSRGBToLinear) c.convertSRGBToLinear(); }

    function corregirColorSRGB(raiz) {
      raiz.traverse(function (o) {
        if (o.isLight && o.color && !o.__srgbOk) { aLineal(o.color); o.__srgbOk = true; }
        if (!o.isMesh || !o.material) return;
        var ms = Array.isArray(o.material) ? o.material : [o.material];
        for (var i = 0; i < ms.length; i++) {
          var m = ms[i];
          if (!m || m.__srgbOk) continue;
          aLineal(m.color);
          aLineal(m.emissive);
          m.__srgbOk = true;
        }
      });
    }

    /* ======================================================================
       HELPERS DE GEOMETRÍA
       ====================================================================== */
    function roundedRectShape(w, h, r) {
      var s = new THREE.Shape();
      var x = -w / 2, y = -h / 2;
      r = Math.min(r, Math.min(w, h) / 2);
      s.moveTo(x, y + r);
      s.lineTo(x, y + h - r);
      s.quadraticCurveTo(x, y + h, x + r, y + h);
      s.lineTo(x + w - r, y + h);
      s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
      s.lineTo(x + w, y + r);
      s.quadraticCurveTo(x + w, y, x + w - r, y);
      s.lineTo(x + r, y);
      s.quadraticCurveTo(x, y, x, y + r);
      return s;
    }

    // Caja de esquinas y CANTOS redondeados (el bevel da el borde suave del aluminio)
    function roundedBoxGeo(w, h, d, r, bevel, curveSeg) {
      bevel = bevel === undefined ? Math.min(d * 0.35, 0.02) : bevel;
      var shape = roundedRectShape(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel));
      var geo = new THREE.ExtrudeGeometry(shape, {
        depth: Math.max(0.001, d - bevel * 2),
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 3,
        curveSegments: curveSeg || 18
      });
      geo.translate(0, 0, -(d - bevel * 2) / 2);
      return geo;
    }

    // Cara plana redondeada con UV normalizado (para pantalla / dorso)
    function faceGeo(w, h, r) {
      var geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 24);
      var uv = geo.attributes.uv;
      for (var i = 0; i < uv.count; i++) {
        uv.setXY(i, (uv.getX(i) + w / 2) / w, (uv.getY(i) + h / 2) / h);
      }
      uv.needsUpdate = true;
      return geo;
    }

    function roundRectPath(ctx, x, y, ww, hh, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + ww, y, x + ww, y + hh, r);
      ctx.arcTo(x + ww, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r);
      ctx.arcTo(x, y, x + ww, y, r);
      ctx.closePath();
    }

    /* ======================================================================
       MATERIALES
       ====================================================================== */
    var matAluminio = new THREE.MeshStandardMaterial({
      color: COSMIC_ORANGE, roughness: 0.38, metalness: 0.72
    });
    var matMeseta = new THREE.MeshStandardMaterial({
      color: ORANGE_DEEP, roughness: 0.30, metalness: 0.95
    });
    var matBoton = new THREE.MeshStandardMaterial({
      color: ORANGE_LIGHT, roughness: 0.34, metalness: 0.55
    });
    var matCristalLente = new THREE.MeshStandardMaterial({
      color: 0x0a0f1a, roughness: 0.06, metalness: 0.55
    });
    var matAroLente = new THREE.MeshStandardMaterial({
      color: 0x8d9299, roughness: 0.18, metalness: 1.0
    });
    var matNegro = new THREE.MeshStandardMaterial({
      color: 0x0b0d12, roughness: 0.5, metalness: 0.2
    });

    /* ======================================================================
       PANTALLA — canvas 2D con la marca Lion Tech
       (versión a prueba de "tainted canvas": nunca usa imágenes externas)
       ====================================================================== */
    function drawVectorLionLogo(ctx, cx, cy, scale) {
      scale = scale || 1;
      ctx.save();
      ctx.translate(cx, cy);

      // Huella del león (azul Lion Tech)
      ctx.fillStyle = '#0C6CC0';
      ctx.beginPath();
      ctx.ellipse(38 * scale, 34 * scale, 34 * scale, 25 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      [{ x: 5, y: -4, rx: 11, ry: 15, rot: -0.3 },
       { x: 26, y: -18, rx: 12, ry: 17, rot: -0.1 },
       { x: 52, y: -16, rx: 12, ry: 17, rot: 0.15 },
       { x: 74, y: -2, rx: 11, ry: 15, rot: 0.35 }].forEach(function (t) {
        ctx.beginPath();
        ctx.ellipse(t.x * scale, t.y * scale, t.rx * scale, t.ry * scale, t.rot, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cabeza del león
      ctx.fillStyle = '#001034';
      ctx.beginPath();
      ctx.arc(-26 * scale, -2 * scale, 62 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-52 * scale, -12 * scale, 18 * scale, 8 * scale, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-66 * scale, 8 * scale, 14 * scale, 18 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      for (var i = -4; i <= 4; i++) {
        ctx.fillRect(-84 * scale, i * 11 * scale, 20 * scale, 4.5 * scale);
      }
      ctx.restore();
    }

    function buildScreenTexture() {
      var c = document.createElement('canvas');
      c.width = 540; c.height = 1150;
      var ctx = c.getContext('2d');
      var w = c.width, h = c.height, b = 12;

      var tex = new THREE.CanvasTexture(c);
      if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

      function dibujar(logo) {
        ctx.clearRect(0, 0, w, h);

        // Marco negro del cristal
        ctx.fillStyle = '#07090d';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        roundRectPath(ctx, b, b, w - b * 2, h - b * 2, 46);
        ctx.clip();

        // Fondo blanco limpio, como en tu diseño de Spline
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(b, b, w - b * 2, h - b * 2);

        // Barra de estado
        ctx.fillStyle = '#001034';
        ctx.font = "600 17px 'Inter', sans-serif";
        ctx.textAlign = 'left';
        ctx.fillText('9:41', b + 30, b + 40);
        ctx.textAlign = 'right';
        ctx.fillText('5G   100%', w - b - 30, b + 40);

        // Dynamic Island
        ctx.fillStyle = '#000000';
        roundRectPath(ctx, w / 2 - 62, b + 18, 124, 36, 18);
        ctx.fill();

        // Logo real de Lion Tech, centrado y grande
        if (logo && logo.naturalWidth) {
          var maxW = (w - b * 2) * 0.86;
          var k = maxW / logo.naturalWidth;
          var iw = logo.naturalWidth * k, ih = logo.naturalHeight * k;
          ctx.drawImage(logo, (w - iw) / 2, h * 0.46 - ih / 2, iw, ih);
        }

        // Pie discreto
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0C6CC0';
        ctx.font = "700 17px 'Inter', sans-serif";
        ctx.fillText('ACCESORIOS TELEFÓNICOS', w / 2, h * 0.70);
        ctx.fillStyle = '#4A5568';
        ctx.font = "600 15px 'Inter', sans-serif";
        ctx.fillText('@liontechve  ·  Sabana Grande, Caracas', w / 2, h * 0.735);

        // Barra de inicio
        ctx.fillStyle = 'rgba(0, 16, 52, 0.28)';
        roundRectPath(ctx, w / 2 - 68, h - b - 22, 136, 6, 3);
        ctx.fill();

        ctx.restore();
        tex.needsUpdate = true;
      }

      dibujar(null);
      // El logo va en base64 (data:), que NO contamina el canvas: por eso
      // sí se puede usar como textura WebGL abriendo el HTML con file://
      if (window.LIONTECH_LOGO_B64) {
        var img = new Image();
        img.onload = function () { dibujar(img); };
        img.onerror = function () { console.warn('[demo3d] No cargó el logo incrustado.'); };
        img.src = window.LIONTECH_LOGO_B64;
      }
      return tex;
    }

    /* ======================================================================
       DORSO — textura de aluminio Cosmic Orange con grabado Lion Tech
       ====================================================================== */
    function buildBackTexture() {
      var c = document.createElement('canvas');
      c.width = 540; c.height = 1150;
      var ctx = c.getContext('2d');
      var w = c.width, h = c.height;

      var grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#D2703C');
      grad.addColorStop(0.40, '#C05829');
      grad.addColorStop(0.75, '#B04E22');
      grad.addColorStop(1, '#C2602F');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Reflejo diagonal
      var shine = ctx.createLinearGradient(0, h, w, 0);
      shine.addColorStop(0, 'rgba(255,255,255,0)');
      shine.addColorStop(0.45, 'rgba(255,255,255,0.10)');
      shine.addColorStop(0.55, 'rgba(255,255,255,0.03)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, w, h);

      // Micro-textura de aluminio cepillado
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#3d1a08';
      ctx.lineWidth = 1;
      for (var lx = 0; lx < w; lx += 5) {
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, h); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Grabado de marca en el centro (en vez del logo de Apple: es TU tienda)
      ctx.save();
      ctx.globalAlpha = 0.92;
      drawVectorLionLogo(ctx, w / 2 + 12, h * 0.47, 0.95);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = "800 21px 'Poppins', sans-serif";
      ctx.fillText('LION TECH VENEZUELA', w / 2, h - 62);
      ctx.font = "600 12px 'Inter', sans-serif";
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('ACCESORIOS TELEFÓNICOS · CARACAS', w / 2, h - 40);

      var tex = new THREE.CanvasTexture(c);
      if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      return tex;
    }

    /* ======================================================================
       CONSTRUCCIÓN DEL iPHONE 17 PRO MAX
       ====================================================================== */
    var phone = new THREE.Group();

    // --- Cuerpo de aluminio (unibody con cantos redondeados) ---
    var body = new THREE.Mesh(roundedBoxGeo(PW, PH, PD, PR, 0.028, 22), matAluminio);
    phone.add(body);

    // --- Pantalla ---
    var screen = new THREE.Mesh(
      faceGeo(PW - 0.045, PH - 0.045, PR - 0.022),
      new THREE.MeshBasicMaterial({ map: buildScreenTexture() })
    );
    screen.position.z = PD / 2 + 0.002;
    phone.add(screen);

    // --- Dorso ---
    var back = new THREE.Mesh(
      faceGeo(PW - 0.045, PH - 0.045, PR - 0.022),
      new THREE.MeshStandardMaterial({ map: buildBackTexture(), roughness: 0.74, metalness: 0.05 })
    );
    back.position.z = -PD / 2 - 0.002;
    back.rotation.y = Math.PI;
    phone.add(back);

    /* --- MESETA DE CÁMARAS (el "camera plateau" que cruza casi todo el ancho,
           rasgo distintivo del iPhone 17 Pro) --- */
    var PLAT_W = PW - 0.018;
    var PLAT_H = 0.62;
    var PLAT_D = 0.055;
    var plateau = new THREE.Mesh(
      roundedBoxGeo(PLAT_W, PLAT_H, PLAT_D, 0.21, 0.014, 20),
      matMeseta
    );
    plateau.position.set(0, PH / 2 - PLAT_H / 2 - 0.085, -PD / 2 - PLAT_D / 2 + 0.004);
    phone.add(plateau);

    // Lente: aro metálico + cristal + reflejo
    function makeLens(radius) {
      var g = new THREE.Group();
      var aro = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 0.05, 34),
        matAroLente
      );
      aro.rotation.x = Math.PI / 2;
      g.add(aro);

      var cristal = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.76, radius * 0.76, 0.06, 34),
        matCristalLente
      );
      cristal.rotation.x = Math.PI / 2;
      cristal.position.z = -0.006;
      g.add(cristal);

      var destello = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 0.24, 14, 14),
        new THREE.MeshStandardMaterial({
          color: 0x63c8ff, roughness: 0.05, metalness: 0.2,
          emissive: 0x1d6fa8, emissiveIntensity: 0.7
        })
      );
      destello.position.set(-radius * 0.26, radius * 0.26, -0.035);
      g.add(destello);
      return g;
    }

    // Tres lentes en triángulo, al lado izquierdo de la meseta
    var lensZ = plateau.position.z - PLAT_D / 2 - 0.012;
    var lensBaseY = plateau.position.y;
    var LR = 0.113;

    var lensPositions = [
      [-0.355, lensBaseY + 0.138],   // principal (arriba izq.)
      [-0.355, lensBaseY - 0.138],   // ultra gran angular (abajo izq.)
      [-0.105, lensBaseY - 0.138]    // teleobjetivo (abajo der.)
    ];
    lensPositions.forEach(function (p) {
      var l = makeLens(LR);
      l.position.set(p[0], p[1], lensZ);
      phone.add(l);
    });

    // Flash True Tone + escáner LiDAR, al lado derecho de la meseta
    var flash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.05, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfff2d0, roughness: 0.25, metalness: 0.1,
        emissive: 0xffcf7a, emissiveIntensity: 0.55
      })
    );
    flash.rotation.x = Math.PI / 2;
    flash.position.set(PW * 0.33, lensBaseY + 0.145, lensZ + 0.004);
    phone.add(flash);

    var lidar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.05, 22),
      matCristalLente
    );
    lidar.rotation.x = Math.PI / 2;
    lidar.position.set(PW * 0.33, lensBaseY - 0.030, lensZ + 0.004);
    phone.add(lidar);

    var mic = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.05, 14), matNegro);
    mic.rotation.x = Math.PI / 2;
    mic.position.set(PW * 0.33, lensBaseY - 0.180, lensZ + 0.004);
    phone.add(mic);

    /* --- Botones laterales --- */
    // largo = alto del botón (eje Y); sobresale muy poco en X, como el real
    function makeButton(largo, y, lado) {
      var g = roundedBoxGeo(0.030, largo, PD * 0.62, 0.012, 0.005, 8);
      var b = new THREE.Mesh(g, matBoton);
      b.position.set(lado * (PW / 2 - 0.006), y, 0);
      return b;
    }
    phone.add(makeButton(0.30, 0.42, -1));   // volumen +
    phone.add(makeButton(0.30, 0.05, -1));   // volumen -
    phone.add(makeButton(0.17, 0.76, -1));   // botón de acción
    phone.add(makeButton(0.42, 0.34, 1));    // botón lateral
    phone.add(makeButton(0.22, -0.22, 1));   // control de cámara



    /* ======================================================================
       MATERIALES DEL MODELO IMPORTADO
       ----------------------------------------------------------------------
       Spline exporta la geometría SIN materiales (sale todo gris). Aquí se
       los asignamos leyendo el nombre de cada pieza del modelo.
       ====================================================================== */
    var MOSTRAR_LOGO_APPLE = true;    // logo grabado en el dorso (ponlo en false para quitarlo)

    function rutaDe(o) {
      var r = [];
      while (o) { if (o.name) r.push(o.name); o = o.parent; }
      return r.join('/');
    }

    // Spline mete suelo, luces y guías en el export; aquí sobran porque la
    // escena ya tiene su propia iluminación.
    function limpiarModelo(root) {
      var fuera = [];
      root.traverse(function (o) {
        if (o.isLight) { fuera.push(o); return; }
        if (/^(Floor|Piso|Camino|Path|Directional Light|Luz direccional)$/i.test(o.name || '')) fuera.push(o);
      });
      fuera.forEach(function (o) { if (o.parent) o.parent.remove(o); });
      return fuera.length;
    }

    function pintarModelo(root) {
      var matPantalla = new THREE.MeshBasicMaterial({ map: buildScreenTexture() });
      var matBisel    = new THREE.MeshStandardMaterial({ color: 0x07090d, roughness: 0.42, metalness: 0.30 });
      var matDorso    = new THREE.MeshStandardMaterial({ color: COSMIC_ORANGE, roughness: 0.30, metalness: 0.55 });
      var matMarco    = new THREE.MeshStandardMaterial({ color: COSMIC_ORANGE, roughness: 0.28, metalness: 0.88 });
      var matModulo   = new THREE.MeshStandardMaterial({ color: ORANGE_DEEP,  roughness: 0.30, metalness: 0.65 });
      var matBotones  = new THREE.MeshStandardMaterial({ color: ORANGE_LIGHT, roughness: 0.30, metalness: 0.70 });
      var matCromo    = new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: 0.12, metalness: 1.0 });
      var matVidrio   = new THREE.MeshStandardMaterial({ color: 0x0a0f1a, roughness: 0.05, metalness: 0.55 });

      root.traverse(function (o) {
        if (!o.isMesh) return;
        var ruta = rutaDe(o);
        var n = o.name || '';

        if (/Logo/i.test(ruta)) { o.visible = MOSTRAR_LOGO_APPLE; o.material = matModulo; return; }
        // Las bandas de "Connectors" salen descolocadas en este export: fuera.
        if (/Connectors|Conectores/i.test(ruta)) { o.visible = false; return; }
        if (/Bottom_Details|Detalles_infer/i.test(ruta)) { o.material = matBisel; return; }
        if (/^(Screen|Pantalla)$/i.test(n))  { o.material = matPantalla; return; }
        if (/Screen_Border|Borde_de_pantalla|Borde_negro|Dynamic|Isla_din/i.test(ruta)) { o.material = matBisel; return; }
        if (/Back_Side|Parte_tras/i.test(n)) { o.material = matDorso;  return; }
        if (/Metal_Border|Borde_me|^Metal$/i.test(n)) { o.material = matMarco; return; }
        if (/Button|Botones/i.test(ruta))    { o.material = matBotones; return; }
        if (/^Cube/i.test(n))                { o.material = matModulo; return; }

        if (/Cam1|Cam2|Camera|C.mara/i.test(ruta)) {
          o.geometry.computeBoundingBox();
          var ancho = o.geometry.boundingBox.getSize(new THREE.Vector3()).x;
          o.material = ancho >= 34 ? matCromo : (ancho >= 12 ? matVidrio : matBisel);
          return;
        }
        o.material = matMarco;   // por defecto, aluminio del cuerpo
      });
    }


    /* ======================================================================
       DESPIECE POR CAPAS  (bloque 3)
       ----------------------------------------------------------------------
       El teléfono se abre en láminas paralelas, como los anuncios de
       despiece: cristal, pantalla, chasis, placa, batería, componentes y
       tapa trasera. Tres capas salen del propio modelo; las tripas
       (placa lógica, batería, bobina, motor háptico, altavoz) se construyen
       por código a la medida real del teléfono.
       ====================================================================== */
    var despiece = {
      listo: false,
      capas: {},           // nombre -> THREE.Group
      orden: [
        { k: 'cristal',  z:  0.92, y:  0.20 },
        { k: 'pantalla', z:  0.52, y:  0.11 },
        { k: 'chasis',   z:  0.00, y:  0.00 },
        { k: 'placa',    z: -0.38, y: -0.09 },
        { k: 'bateria',  z: -0.70, y: -0.17 },
        { k: 'varios',   z: -1.00, y: -0.25 },
        { k: 'trasera',  z: -1.34, y: -0.34 }
      ],
      interiores: []       // materiales de las tripas, para desvanecerlas
    };

    // A qué lámina pertenece cada malla del modelo importado
    function capaDeMalla(o) {
      var r = rutaDe(o), n = o.name || '';
      if (/^Screen$/i.test(n)) return 'pantalla';
      if (/Back_Side|Logo|Camera|Cam1|Cam2|^Cube/i.test(r)) return 'trasera';
      return 'chasis';   // marco, bordes, botones, isla dinámica, detalles
    }

    /* ── Tripas construidas por código, escaladas al teléfono real ── */
    function construirInteriores(w, h) {
      function mat(color, rough, metal) {
        return new THREE.MeshStandardMaterial({
          color: color, roughness: rough, metalness: metal, transparent: true, opacity: 1
        });
      }
      var matPCB   = mat(0x0E3A2C, 0.58, 0.20);
      var matChip  = mat(0x14181F, 0.42, 0.55);
      var matOro   = mat(0xC9A227, 0.28, 0.95);
      var matPlata = mat(0xA8AEB6, 0.24, 0.95);
      var matBat   = mat(0x123A6B, 0.42, 0.35);
      var matCobre = mat(0xB06A32, 0.30, 0.90);

      /* — Placa lógica: PCB en la mitad superior, con chips y conectores — */
      var gPlaca = new THREE.Group();
      var pcb = new THREE.Mesh(roundedBoxGeo(w * 0.86, h * 0.32, 0.020, 0.035, 0.005, 12), matPCB);
      pcb.position.y = h * 0.23;
      gPlaca.add(pcb);

      [[-0.26, 0.31, 0.20, 0.075], [ 0.04, 0.32, 0.16, 0.060],
       [ 0.27, 0.27, 0.13, 0.085], [-0.30, 0.17, 0.13, 0.050],
       [ 0.00, 0.15, 0.26, 0.038], [ 0.24, 0.14, 0.14, 0.045]].forEach(function (c) {
        var chip = new THREE.Mesh(
          roundedBoxGeo(w * c[2], h * c[3], 0.016, 0.008, 0.003, 8), matChip);
        chip.position.set(w * c[0], h * c[1], 0.018);
        gPlaca.add(chip);
      });
      [[-0.12, 0.345], [0.18, 0.345], [-0.02, 0.095]].forEach(function (c) {
        var con = new THREE.Mesh(
          roundedBoxGeo(w * 0.17, h * 0.017, 0.014, 0.005, 0.002, 6), matOro);
        con.position.set(w * c[0], h * c[1], 0.018);
        gPlaca.add(con);
      });
      // Blindaje metálico de una esquina
      var blindaje = new THREE.Mesh(
        roundedBoxGeo(w * 0.30, h * 0.085, 0.022, 0.012, 0.004, 8), matPlata);
      blindaje.position.set(-w * 0.24, h * 0.115, 0.020);
      gPlaca.add(blindaje);

      /* — Batería: bloque azul con su pestaña y etiqueta — */
      var gBat = new THREE.Group();
      var bat = new THREE.Mesh(roundedBoxGeo(w * 0.80, h * 0.44, 0.052, 0.030, 0.008, 12), matBat);
      bat.position.y = -h * 0.12;
      gBat.add(bat);
      var etiqueta = new THREE.Mesh(
        roundedBoxGeo(w * 0.46, h * 0.055, 0.008, 0.012, 0.002, 8),
        mat(0xE8EDF3, 0.65, 0.05));
      etiqueta.position.set(0, -h * 0.05, 0.030);
      gBat.add(etiqueta);
      var pestana = new THREE.Mesh(
        roundedBoxGeo(w * 0.14, h * 0.045, 0.010, 0.006, 0.002, 6), matOro);
      pestana.position.set(w * 0.22, h * 0.105, 0.010);
      gBat.add(pestana);

      /* — Componentes sueltos: bobina de carga, motor háptico y altavoz — */
      var gVarios = new THREE.Group();
      for (var i = 0; i < 4; i++) {
        var anillo = new THREE.Mesh(
          new THREE.TorusGeometry(w * (0.14 + i * 0.035), 0.010, 8, 44), matCobre);
        anillo.position.set(0, h * 0.05, 0);
        gVarios.add(anillo);
      }
      var haptico = new THREE.Mesh(
        roundedBoxGeo(w * 0.42, h * 0.055, 0.038, 0.014, 0.005, 8), matPlata);
      haptico.position.set(0, -h * 0.30, 0);
      gVarios.add(haptico);
      var altavoz = new THREE.Mesh(
        roundedBoxGeo(w * 0.26, h * 0.048, 0.034, 0.012, 0.004, 8), matChip);
      altavoz.position.set(-w * 0.26, -h * 0.40, 0);
      gVarios.add(altavoz);
      var camInt = new THREE.Mesh(
        new THREE.CylinderGeometry(w * 0.06, w * 0.075, 0.075, 22), matPlata);
      camInt.rotation.x = Math.PI / 2;
      camInt.position.set(w * 0.25, h * 0.36, 0);
      gVarios.add(camInt);

      return { placa: gPlaca, bateria: gBat, varios: gVarios };
    }

    /* ── Montaje: reparenta las mallas del modelo en láminas y añade tripas ── */
    function prepararDespiece(modelo, w, h) {
      for (var i = 0; i < despiece.orden.length; i++) {
        var g = new THREE.Group();
        despiece.capas[despiece.orden[i].k] = g;
        phone.add(g);
      }

      // attach() conserva la posición en el mundo, pero necesita las matrices
      // al día y una escala sana: 'phone' arranca en 0.001 y eso arruina el cálculo.
      var escalaPrevia = phone.scale.x;
      phone.scale.setScalar(1);
      phone.updateMatrixWorld(true);

      var mallas = [];
      modelo.traverse(function (o) { if (o.isMesh) mallas.push(o); });
      mallas.forEach(function (o) { despiece.capas[capaDeMalla(o)].attach(o); });

      phone.scale.setScalar(escalaPrevia);

      // Cristal frontal: copia de la pantalla, en vidrio
      var pantalla = null;
      despiece.capas.pantalla.traverse(function (o) { if (o.isMesh && !pantalla) pantalla = o; });
      if (pantalla) {
        var cristal = new THREE.Mesh(pantalla.geometry, new THREE.MeshPhysicalMaterial({
          color: 0xBBD8F2, roughness: 0.06, metalness: 0.0,
          transparent: true, opacity: 0.34, clearcoat: 1, side: THREE.DoubleSide
        }));
        cristal.position.copy(pantalla.position);
        cristal.rotation.copy(pantalla.rotation);
        cristal.scale.copy(pantalla.scale);
        cristal.position.z += 0.006;
        despiece.capas.cristal.add(cristal);
      }

      var tripas = construirInteriores(w, h);
      despiece.capas.placa.add(tripas.placa);
      despiece.capas.bateria.add(tripas.bateria);
      despiece.capas.varios.add(tripas.varios);

      // Materiales que hay que desvanecer cuando el teléfono está cerrado
      despiece.interiores = [];
      ['cristal', 'placa', 'bateria', 'varios'].forEach(function (k) {
        despiece.capas[k].traverse(function (o) {
          if (o.isMesh && o.material) {
            o.material.transparent = true;
            despiece.interiores.push({ m: o.material, base: o.material.opacity });
          }
        });
      });

      despiece.listo = true;
    }

    function aplicarDespiece(sep) {
      if (!despiece.listo) return;
      for (var i = 0; i < despiece.orden.length; i++) {
        var o = despiece.orden[i], g = despiece.capas[o.k];
        g.position.set(0, o.y * sep, o.z * sep);
      }
      var visible = sep > 0.015;
      for (var j = 0; j < despiece.interiores.length; j++) {
        despiece.interiores[j].m.opacity = despiece.interiores[j].base * sep;
      }
      despiece.capas.cristal.visible = visible;
      despiece.capas.placa.visible = visible;
      despiece.capas.bateria.visible = visible;
      despiece.capas.varios.visible = visible;
    }

    /* ======================================================================
       MODELO REAL OPCIONAL (iPhone exportado de Spline como .glb)
       ----------------------------------------------------------------------
       Si existe el archivo modelo-iphone.js (que define
       window.LIONTECH_IPHONE_GLB_B64 con el .glb en base64), se usa ESE
       modelo y se oculta el teléfono hecho por código.
       Si no existe, la sección sigue funcionando con el de código.

       Va en base64 y NO como archivo .glb aparte a propósito: así no hace
       falta fetch/XHR, que es justo lo que el navegador bloquea en file://.
       ====================================================================== */
    var MODELO_GIRO_Y = 0;   // Ajusta si el modelo entra mirando para otro lado (Math.PI = media vuelta)

    if (window.LIONTECH_IPHONE_GLB_B64 && THREE.GLTFLoader) {
      try {
        var bin = atob(window.LIONTECH_IPHONE_GLB_B64);
        var buf = new ArrayBuffer(bin.length), bytes = new Uint8Array(buf);
        for (var bi = 0; bi < bin.length; bi++) bytes[bi] = bin.charCodeAt(bi);

        new THREE.GLTFLoader().parse(buf, '', function (gltf) {
          var modelo = gltf.scene;
          limpiarModelo(modelo);

          // Si el export trae materiales propios (el nuevo de Spline sí, con el
          // logo en la pantalla), se respetan tal cual. Solo se repinta pieza a
          // pieza cuando el modelo viene "pelado", sin materiales.
          // Un único material significa "todo del mismo gris": eso NO cuenta
          // como materiales propios, hay que pintar por nombre igualmente.
          var listaMat = (gltf.parser && gltf.parser.json && gltf.parser.json.materials) || [];
          var traeMateriales = listaMat.length >= 4;
          if (traeMateriales) {
            console.log('[demo3d] El modelo trae', listaMat.length, 'materiales propios: se respetan.');
          } else {
            console.log('[demo3d] El modelo viene sin materiales: se pintan por nombre.');
            pintarModelo(modelo);
          }

          // Se reescala a la MISMA caja que el teléfono por código, para que
          // el forro y los accesorios sigan encajando sin retocar nada.
          // Se envuelve en grupos y NUNCA se toca la transformación propia del
          // modelo: si le pisas la escala raíz que trae de Spline, se descoloca.
          var centrado = new THREE.Group();
          centrado.add(modelo);
          var ajustado = new THREE.Group();
          ajustado.add(centrado);
          ajustado.updateMatrixWorld(true);

          var caja = new THREE.Box3().setFromObject(ajustado);
          var tam = caja.getSize(new THREE.Vector3());
          var centro = caja.getCenter(new THREE.Vector3());

          centrado.position.set(-centro.x, -centro.y, -centro.z);
          var k = PH / (tam.y || 1);
          ajustado.scale.setScalar(k);
          ajustado.rotation.y = MODELO_GIRO_Y;

          /* El forro se rehace con las medidas REALES del modelo y con la
             posición real de su módulo de cámara, para que calce de verdad. */
          // IMPORTANTE: refrescar las matrices DESPUÉS de centrar y escalar.
          // Si no, las medidas salen del espacio original y el bisel de la
          // cámara queda descuadrado respecto al módulo real.
          ajustado.updateMatrixWorld(true);

          var mSize = new THREE.Box3().setFromObject(ajustado).getSize(new THREE.Vector3());
          var cajaCam = new THREE.Box3();
          modelo.traverse(function (o) {
            if (o.isMesh && /Camera|Cam1|Cam2|C.mara|^Cube/i.test(rutaDe(o))) cajaCam.expandByObject(o);
          });
          var datosCam = null;
          if (!cajaCam.isEmpty()) {
            var cc = cajaCam.getCenter(new THREE.Vector3());
            var cs = cajaCam.getSize(new THREE.Vector3());
            datosCam = { cx: cc.x, cy: cc.y, w: cs.x, h: cs.y };
          }
          construirForro(mSize.x, mSize.y, mSize.z, datosCam);
          for (var ai = 0; ai < accesorios.length; ai++) {
            if (accesorios[ai].nombre === 'forro') registrarMateriales(accesorios[ai]);
          }
          console.log('[demo3d] Forro ajustado a', mSize.x.toFixed(2), 'x', mSize.y.toFixed(2),
                      'x', mSize.z.toFixed(2),
                      datosCam ? ('| cámara en ' + datosCam.cx.toFixed(2) + ',' + datosCam.cy.toFixed(2) +
                                  ' de ' + datosCam.w.toFixed(2) + 'x' + datosCam.h.toFixed(2)) : '| sin cámara');

          phone.children.slice().forEach(function (c) { c.visible = false; });
          phone.add(ajustado);

          prepararDespiece(modelo, mSize.x, mSize.y);
          aplicarDespiece(0);
          console.log('[demo3d] Modelo GLB cargado. Caja original:',
            tam.x.toFixed(1), tam.y.toFixed(1), tam.z.toFixed(1), '-> escala', k.toFixed(5));
        }, function (err) {
          console.warn('[demo3d] El GLB no se pudo leer; se usa el teléfono por código.', err);
        });
      } catch (e) {
        console.warn('[demo3d] GLB inválido; se usa el teléfono por código.', e);
      }
    }

    phone.scale.setScalar(0.001);
    scene.add(phone);

    /* ======================================================================
       ACCESORIOS — todos generados por código
       ====================================================================== */
    function tintMat(color, rough, metal) {
      return new THREE.MeshStandardMaterial({
        color: color, roughness: rough === undefined ? 0.4 : rough,
        metalness: metal === undefined ? 0.25 : metal,
        transparent: true, opacity: 1
      });
    }

    /* 1) FORRO / FUNDA — carcasa translúcida que calza sobre el teléfono */
    /* 1) FORRO / FUNDA — carcasa detallada que se calza sobre el teléfono.
       Se reconstruye con las medidas REALES del modelo cargado (y con la
       posición real de su módulo de cámara), no con medidas inventadas. */
    var forroObj = new THREE.Group();

    function construirForro(w, h, d, cam) {
      // Vaciar por si se reconstruye al cargar el modelo
      while (forroObj.children.length) forroObj.remove(forroObj.children[0]);

      var t   = 0.038;                 // grosor de la pared del forro
      var R   = Math.min(w, h) * 0.20; // radio de esquina del teléfono
      var sW  = w + t * 2, sH = h + t * 2, sR = R + t;
      var sD  = d + t;                 // profundidad total (trasera + laterales)
      var labio = 0.017;               // cuánto sobresale el labio sobre el cristal

      /* ── Materiales ── */
      var matRail = new THREE.MeshPhysicalMaterial({          // rieles soft-touch mate
        color: 0x0A3F7A, roughness: 0.68, metalness: 0.04,
        clearcoat: 0.22, clearcoatRoughness: 0.7,
        transparent: true, opacity: 1, side: THREE.DoubleSide
      });
      var matTapa = new THREE.MeshPhysicalMaterial({          // trasera esmerilada
        color: 0x2E8BE0, roughness: 0.40, metalness: 0.08,
        clearcoat: 1, clearcoatRoughness: 0.16,
        transparent: true, opacity: 0.40, side: THREE.DoubleSide
      });
      var matDetalle = new THREE.MeshPhysicalMaterial({       // bisel de cámara y botones
        color: 0x072C56, roughness: 0.52, metalness: 0.20,
        clearcoat: 0.6, transparent: true, opacity: 1
      });
      var matAnillo = new THREE.MeshStandardMaterial({        // aro MagSafe
        color: 0x8FC4F5, roughness: 0.5, metalness: 0.2,
        transparent: true, opacity: 0.45
      });

      /* ── Rieles laterales: anillo extruido con el hueco del teléfono ── */
      var exterior = roundedRectShape(sW, sH, sR);
      exterior.holes.push(new THREE.Path(
        roundedRectShape(w + 0.006, h + 0.006, R).getPoints(56)
      ));
      var railGeo = new THREE.ExtrudeGeometry(exterior, {
        depth: sD + labio, bevelEnabled: true,
        bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 22
      });
      railGeo.translate(0, 0, -(sD + labio) / 2);
      forroObj.add(new THREE.Mesh(railGeo, matRail));

      /* ── Labio frontal: reborde fino que sobresale del cristal ── */
      var labioShape = roundedRectShape(w + 0.006, h + 0.006, R);
      labioShape.holes.push(new THREE.Path(
        roundedRectShape(w - 0.062, h - 0.062, R - 0.038).getPoints(56)
      ));
      var labioGeo = new THREE.ExtrudeGeometry(labioShape, {
        depth: labio, bevelEnabled: false, curveSegments: 22
      });
      labioGeo.translate(0, 0, d / 2);
      forroObj.add(new THREE.Mesh(labioGeo, matRail));

      /* ── Tapa trasera esmerilada, con recorte real para la cámara ── */
      var cx = cam ? cam.cx : 0, cy = cam ? cam.cy : h * 0.30;
      var cw = cam ? cam.w : w * 0.52, ch = cam ? cam.h : w * 0.52;
      var recW = cw + 0.042, recH = ch + 0.042, recR = Math.min(recW, recH) * 0.26;

      var tapaShape = roundedRectShape(sW - 0.012, sH - 0.012, sR - 0.006);
      tapaShape.holes.push(new THREE.Path(
        roundedRectShape(recW, recH, recR).getPoints(40)
          .map(function (pt) { return new THREE.Vector2(pt.x + cx, pt.y + cy); })
      ));
      var tapaGeo = new THREE.ExtrudeGeometry(tapaShape, {
        depth: 0.018, bevelEnabled: false, curveSegments: 22
      });
      tapaGeo.translate(0, 0, -sD / 2);
      forroObj.add(new THREE.Mesh(tapaGeo, matTapa));

      /* ── Bisel elevado alrededor del recorte de la cámara ── */
      var biselShape = roundedRectShape(recW + 0.050, recH + 0.050, recR + 0.022);
      biselShape.holes.push(new THREE.Path(
        roundedRectShape(recW, recH, recR).getPoints(40)
      ));
      var biselGeo = new THREE.ExtrudeGeometry(biselShape, {
        depth: 0.048, bevelEnabled: true,
        bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 22
      });
      biselGeo.translate(0, 0, -sD / 2 - 0.042);
      var bisel = new THREE.Mesh(biselGeo, matDetalle);
      bisel.position.set(cx, cy, 0);
      forroObj.add(bisel);

      /* ── Cubrebotones: pequeños relieves sobre los botones reales ── */
      function cubreBoton(largo, y, lado) {
        var g = roundedBoxGeo(0.034, largo, d * 0.72, 0.014, 0.006, 10);
        var m = new THREE.Mesh(g, matDetalle);
        m.position.set(lado * (sW / 2 - 0.016), y, 0);
        return m;
      }
      forroObj.add(cubreBoton(h * 0.135, h * 0.185, -1));   // volumen +
      forroObj.add(cubreBoton(h * 0.135, h * 0.030, -1));   // volumen -
      forroObj.add(cubreBoton(h * 0.075, h * 0.320, -1));   // acción
      forroObj.add(cubreBoton(h * 0.185, h * 0.150,  1));   // lateral

      /* ── Aro MagSafe insinuado bajo la tapa ── */
      var aro = new THREE.Mesh(
        new THREE.TorusGeometry(w * 0.27, 0.012, 8, 48), matAnillo
      );
      aro.position.set(0, -h * 0.02, -sD / 2 + 0.004);
      forroObj.add(aro);

      /* ── Rejilla inferior: hueco para el puerto y los altavoces ── */
      var puerto = new THREE.Mesh(
        roundedBoxGeo(w * 0.20, 0.030, sD * 0.9, 0.014, 0.004, 10),
        new THREE.MeshBasicMaterial({ color: 0x061a30, transparent: true, opacity: 0.9 })
      );
      puerto.position.set(0, -sH / 2 + 0.012, 0);
      forroObj.add(puerto);

      return forroObj;
    }

    function buildForro() {
      return construirForro(PW, PH, PD, null);
    }

    /* 2) CARGADOR — adaptador de corriente con patas metálicas */
    function buildCargador() {
      var g = new THREE.Group();
      var cuerpo = new THREE.Mesh(
        roundedBoxGeo(0.52, 0.52, 0.42, 0.13, 0.03, 16),
        tintMat(WHITE_PLASTIC, 0.45, 0.05)
      );
      g.add(cuerpo);

      // Patas
      var pataGeo = roundedBoxGeo(0.055, 0.20, 0.03, 0.012, 0.004, 8);
      var pataMat = tintMat(0xc9ced6, 0.22, 1.0);
      [-0.09, 0.09].forEach(function (x) {
        var p = new THREE.Mesh(pataGeo, pataMat);
        p.position.set(x, 0.33, 0);
        g.add(p);
      });

      // Puerto USB-C
      var puerto = new THREE.Mesh(
        roundedBoxGeo(0.17, 0.055, 0.04, 0.026, 0.006, 10),
        tintMat(0x11151c, 0.6, 0.2)
      );
      puerto.position.set(0, -0.26, 0);
      puerto.rotation.x = Math.PI / 2;
      g.add(puerto);

      // Sello de marca
      var sello = new THREE.Mesh(
        new THREE.CircleGeometry(0.09, 26),
        tintMat(LION_BLUE, 0.5, 0.1)
      );
      sello.position.z = 0.212;
      g.add(sello);

      return g;
    }

    /* 3) CABLE USB-C — tubo curvo con conectores en las puntas */
    function buildCable() {
      var g = new THREE.Group();
      // Lazo suelto de cable, como cuando lo dejas caer sobre el mostrador
      var curva = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.82, -0.34, 0.10),
        new THREE.Vector3(-0.34, 0.20, -0.18),
        new THREE.Vector3(0.26, 0.34, 0.16),
        new THREE.Vector3(0.44, -0.16, -0.14),
        new THREE.Vector3(0.02, -0.44, 0.14),
        new THREE.Vector3(-0.36, -0.16, -0.08),
        new THREE.Vector3(-0.10, 0.14, 0.12),
        new THREE.Vector3(0.72, 0.02, -0.06)
      ]);
      var tubo = new THREE.Mesh(
        new THREE.TubeGeometry(curva, 140, 0.026, 10, false),
        tintMat(WHITE_PLASTIC, 0.55, 0.05)
      );
      g.add(tubo);

      // Conectores USB-C en las puntas
      var conMat = tintMat(0xc3c9d1, 0.25, 0.95);
      [[-0.82, -0.34, 0.10, 0.9], [0.72, 0.02, -0.06, -0.4]].forEach(function (p) {
        var con = new THREE.Mesh(roundedBoxGeo(0.075, 0.19, 0.045, 0.02, 0.006, 10), conMat);
        con.position.set(p[0], p[1], p[2]);
        con.rotation.z = p[3];
        g.add(con);
      });
      return g;
    }

    /* 4) POWER BANK — batería portátil con LEDs de carga */
    function buildPowerBank() {
      var g = new THREE.Group();
      var cuerpo = new THREE.Mesh(
        roundedBoxGeo(0.62, 1.05, 0.20, 0.10, 0.025, 16),
        tintMat(LION_NAVY, 0.35, 0.55)
      );
      g.add(cuerpo);

      // LEDs
      for (var i = 0; i < 4; i++) {
        var led = new THREE.Mesh(
          new THREE.CircleGeometry(0.028, 16),
          new THREE.MeshStandardMaterial({
            color: 0x3B9EFF, emissive: 0x3B9EFF, emissiveIntensity: 1.1,
            transparent: true, opacity: 1
          })
        );
        led.position.set(-0.12 + i * 0.08, -0.36, 0.102);
        g.add(led);
      }

      var etiqueta = new THREE.Mesh(
        roundedBoxGeo(0.34, 0.10, 0.01, 0.05, 0.002, 10),
        tintMat(LION_BLUE, 0.4, 0.3)
      );
      etiqueta.position.set(0, 0.24, 0.101);
      g.add(etiqueta);

      // Puertos
      var puertoMat = tintMat(0x0a0d13, 0.6, 0.2);
      [-0.13, 0.13].forEach(function (x) {
        var p = new THREE.Mesh(roundedBoxGeo(0.13, 0.05, 0.06, 0.024, 0.005, 8), puertoMat);
        p.position.set(x, 0.53, 0);
        g.add(p);
      });
      return g;
    }

    /* 5) AUDÍFONOS — estuche de carga con los dos auriculares */
    function buildAudifonos() {
      var g = new THREE.Group();
      var estuche = new THREE.Mesh(
        roundedBoxGeo(0.56, 0.46, 0.24, 0.11, 0.03, 16),
        tintMat(WHITE_PLASTIC, 0.4, 0.05)
      );
      g.add(estuche);

      var linea = new THREE.Mesh(
        roundedBoxGeo(0.57, 0.012, 0.245, 0.006, 0.002, 8),
        tintMat(0xd3d8de, 0.5, 0.1)
      );
      linea.position.y = 0.10;
      g.add(linea);

      var ledC = new THREE.Mesh(
        new THREE.CircleGeometry(0.022, 14),
        new THREE.MeshStandardMaterial({
          color: 0x2ee06a, emissive: 0x2ee06a, emissiveIntensity: 1.2,
          transparent: true, opacity: 1
        })
      );
      ledC.position.set(0, -0.10, 0.122);
      g.add(ledC);

      // Auriculares flotando junto al estuche
      var budMat = tintMat(WHITE_PLASTIC, 0.35, 0.08);
      [-1, 1].forEach(function (s) {
        var bud = new THREE.Group();
        var cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 18), budMat);
        bud.add(cabeza);
        // CapsuleGeometry no existe en Three r128; caemos a un cilindro.
        var talloGeo = THREE.CapsuleGeometry
          ? new THREE.CapsuleGeometry(0.032, 0.20, 6, 12)
          : new THREE.CylinderGeometry(0.032, 0.032, 0.24, 12);
        var tallo = new THREE.Mesh(talloGeo, budMat);
        tallo.position.y = -0.17;
        bud.add(tallo);
        bud.position.set(s * 0.46, 0.16, 0.05);
        bud.rotation.z = s * 0.22;
        g.add(bud);
      });
      return g;
    }

    /* --- Registro de accesorios: cada uno con su órbita y su ventana de scroll --- */
    var accesorios = [
      { nombre: 'forro',     obj: buildForro(),      pos: [0, 0, 0],           spin: [0.0, 0.0, 0.0], desde: 0.05, hasta: 0.30 },
      { nombre: 'cargador',  obj: buildCargador(),   pos: [-1.62, 0.78, 0.35], spin: [0.4, 0.7, 0.2], desde: 0.32, hasta: 0.55 },
      { nombre: 'cable',     obj: buildCable(),      pos: [-1.55, -0.80, 0.25], spin: [0.2, 0.5, 0.3], desde: 0.32, hasta: 0.55 },
      { nombre: 'powerbank', obj: buildPowerBank(),  pos: [1.70, 0.62, -0.15], spin: [0.3, 0.6, 0.2], desde: 0.35, hasta: 0.55 },
      { nombre: 'audifonos', obj: buildAudifonos(),  pos: [-1.62, 0.55, 0.30], spin: [0.5, 0.8, 0.3], desde: 0.85, hasta: 0.99 }
    ];

    function registrarMateriales(a) {
      a.mats = [];
      a.obj.traverse(function (o) {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          a.mats.push({ m: o.material, base: o.material.opacity });
        }
      });
    }

    accesorios.forEach(function (a) {
      a.obj.position.set(a.pos[0], a.pos[1], a.pos[2]);
      a.obj.visible = false;
      // Guardamos los materiales para poder animar su opacidad
      registrarMateriales(a);
      scene.add(a.obj);
    });

    function setAccesorioOpacidad(a, t) {
      var visible = t > 0.01;
      a.obj.visible = visible;
      if (!visible) return;
      for (var i = 0; i < a.mats.length; i++) {
        a.mats[i].m.opacity = a.mats[i].base * t;
      }
    }

    /* ======================================================================
       RENDER
       ====================================================================== */
    resize();
    window.addEventListener('resize', function () {
      resize();
      ScrollTrigger.refresh();
    }, { passive: true });

    var reloj = 0;
    function render() {
      reloj += 0.016;
      corregirColorSRGB(scene);
      // Flotación suave e independiente de cada accesorio
      accesorios.forEach(function (a, i) {
        if (!a.obj.visible) return;
        a.obj.rotation.x += a.spin[0] * 0.004;
        a.obj.rotation.y += a.spin[1] * 0.004;
        a.obj.rotation.z += a.spin[2] * 0.002;
        a.obj.position.y = a.pos[1] + Math.sin(reloj * 0.8 + i * 1.3) * 0.07;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    if (prefersReducedMotion) {
      phone.scale.setScalar(1);
      phone.rotation.set(0.08, -0.3, 0);
      return;
    }

    /* ======================================================================
       COREOGRAFÍA DE SCROLL
       ====================================================================== */
    var caption1 = document.querySelector('.phone3d-caption--1');
    var caption2 = document.querySelector('.phone3d-caption--2');
    var caption3 = document.querySelector('.phone3d-caption--3');
    var caption4 = document.querySelector('.phone3d-caption--4');
    var scrollCue = document.getElementById('phone3dScrollCue');

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }

    function windowOpacity(p, inStart, inEnd, outStart, outEnd) {
      if (p < inStart || p > outEnd) return 0;
      if (p < inEnd) return clamp01((p - inStart) / (inEnd - inStart));
      if (p > outStart) return clamp01((outEnd - p) / (outEnd - outStart));
      return 1;
    }

    /* Coreografía del giro por fotogramas clave [progreso, rotación Y].
       Pensada para que en el bloque 2 (cargadores) se vea el DORSO con la
       meseta de cámaras, y en el bloque 3 el teléfono quede de frente. */
    var ROT_KEYS = [
      [0.00, -0.60],
      [0.28, 2.05],                    // bloque 1 (forros): gira hasta enseñar el dorso
      [0.50, Math.PI + 0.35],          // bloque 2 (cargadores): dorso y cámaras
      [0.62, Math.PI * 2 - 1.15],      // bloque 3 (despiece): tres cuartos marcado
      [0.82, Math.PI * 2 - 0.60],      // gira despacio mientras está abierto
      [1.00, Math.PI * 2 + 0.40]       // bloque 4 (Sabana Grande): de frente
    ];

    function rotacionEn(p) {
      for (var i = 0; i < ROT_KEYS.length - 1; i++) {
        var a = ROT_KEYS[i], b = ROT_KEYS[i + 1];
        if (p <= b[0]) {
          var t = clamp01((p - a[0]) / (b[0] - a[0]));
          t = t * t * (3 - 2 * t);     // suavizado
          return a[1] + (b[1] - a[1]) * t;
        }
      }
      return ROT_KEYS[ROT_KEYS.length - 1][1];
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p = self.progress;

        // Escala de entrada y salida. Entrada más corta (antes 0.12) para
        // que no quede un tramo "vacío" justo al bajar del Hero, antes de
        // que aparezca el teléfono.
        var scaleVal;
        if (p < 0.07) scaleVal = p / 0.07;
        else if (p > 0.95) scaleVal = (1 - p) / 0.05;
        else scaleVal = 1;

        /* Separación de las láminas: abre, mantiene y vuelve a cerrar */
        var sep = 0;
        if (p > 0.55 && p < 0.86) {
          if (p < 0.68) sep = (p - 0.55) / 0.13;
          else if (p < 0.76) sep = 1;
          else sep = 1 - (p - 0.76) / 0.10;
        }
        sep = clamp01(sep);
        aplicarDespiece(sep);
        scaleVal *= (1 - sep * 0.26);
        phone.position.x = -sep * 0.34;   // encoge un poco para que quepa el abanico
        scaleVal = Math.max(0.001, scaleVal);

        phone.rotation.y = rotacionEn(p);
        phone.rotation.x = 0.08 + Math.sin(p * Math.PI) * 0.06;

        // En el bloque 3 sube y encoge un poco para no quedar tapado por el texto
        var subida = clamp01((p - 0.83) / 0.07);
        phone.position.y = Math.sin(p * Math.PI * 2) * 0.06 + subida * 0.44;
        scaleVal *= (1 - subida * 0.15);
        phone.scale.setScalar(scaleVal);

        // El forro acompaña al teléfono; los demás orbitan por su cuenta
        function registrarMateriales(a) {
      a.mats = [];
      a.obj.traverse(function (o) {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          a.mats.push({ m: o.material, base: o.material.opacity });
        }
      });
    }

    accesorios.forEach(function (a) {
          var t = windowOpacity(p, a.desde, a.desde + 0.06, a.hasta - 0.06, a.hasta);
          setAccesorioOpacidad(a, t);
          if (a.nombre === 'forro') {
            a.obj.rotation.copy(phone.rotation);
            a.obj.scale.setScalar(scaleVal);
            a.obj.position.set(0, phone.position.y, 0);
          } else {
            // Entra deslizándose desde su lado hacia su posición final
            a.obj.position.x = a.pos[0] * (0.55 + 0.45 * t);
            a.obj.scale.setScalar(0.6 + 0.4 * t);
          }
        });

        if (scrollCue) scrollCue.style.opacity = String(1 - clamp01(p / 0.05));

        var t1 = windowOpacity(p, 0.05, 0.12, 0.23, 0.29);
        if (caption1) {
          caption1.style.opacity = String(t1);
          caption1.style.transform = 'translateX(' + (-(1 - t1) * 90).toFixed(2) + 'px)';
          caption1.style.filter = 'blur(' + ((1 - t1) * 8).toFixed(2) + 'px)';
        }

        var t2 = windowOpacity(p, 0.33, 0.39, 0.49, 0.55);
        if (caption2) {
          caption2.style.opacity = String(t2);
          caption2.style.transform = 'translateX(' + ((1 - t2) * 90).toFixed(2) + 'px)';
          caption2.style.filter = 'blur(' + ((1 - t2) * 8).toFixed(2) + 'px)';
        }

        // Bloque 3 — despiece: entra desde la derecha
        var t3 = windowOpacity(p, 0.57, 0.63, 0.75, 0.81);
        if (caption3) {
          caption3.style.opacity = String(t3);
          caption3.style.transform = 'translateX(' + ((1 - t3) * 90).toFixed(2) + 'px)';
          caption3.style.filter = 'blur(' + ((1 - t3) * 8).toFixed(2) + 'px)';
        }

        // Bloque 4 — cierre: entra desde abajo
        var t4 = windowOpacity(p, 0.86, 0.91, 0.96, 0.995);
        if (caption4) {
          caption4.style.opacity = String(t4);
          caption4.style.transform = 'translateY(' + ((1 - t4) * 70).toFixed(2) + 'px)';
          caption4.style.filter = 'blur(' + ((1 - t4) * 8).toFixed(2) + 'px)';
        }
      }
    });

  } catch (e) {
    console.error('[demo3d] Error inicializando la demo 3D:', e);
  }
})();
