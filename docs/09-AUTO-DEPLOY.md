---
titulo: Runbook de auto-deploy de la landing liontechve.com
version: 2
estado: listo para ejecutar tras resolver §2 (bloqueantes)
emisor: Henry (frontend)
ejecutor: Claude Code del responsable de despliegue, en el VPS
contexto_previo: Sesion-Landing-liontechve-2026-09-15_30.md
---

# Auto-deploy de la landing: `git push origin main` → producción, completa o nada

> **Claude ejecutor: este documento es tu tarea.** Léelo entero antes del primer
> comando. Ejecuta las fases de §4 **en orden**. Cada fase tiene un **criterio de
> salida**; si no se cumple, **detente y reporta** con la plantilla de §8. No
> improvises pasos fuera de este documento sobre producción.

---

## 1. Reglas para el ejecutor (no negociables)

1. **Nunca reinicies `cloudflared`** ni edites `/etc/cloudflared/config.yml`. Un
   reinicio tumba los 14 hostnames del túnel por ~31 s (medido el 15-sep). Nada de
   este runbook lo necesita.
2. **No toques** `liontechve_wp` (:8891, la reversión), `hitreek_wp` (:8889),
   `mechanic_wp` (:8890) ni las cabeceras de seguridad de nginx.
3. **Producción se verifica por el archivo en el origen** (`sha256sum -c`), nunca
   por el hash de la respuesta HTTP: Cloudflare reescribe el HTML.
4. **Toda ruta marcada `‹VERIFICAR›` es un supuesto.** Confírmala en F0 leyendo la
   configuración real. No la escribas en ningún archivo hasta confirmarla.
5. **Lo único que se permite recargar es nginx** (`nginx -t` y después
   `nginx -s reload`, que es graceful).
6. **Las decisiones de §2 son de Daniel.** Si no están resueltas, puedes hacer F0
   (solo lectura) y **nada más**.
7. **El contenido es de Henry.** Si el build rechaza una release por contenido
   (faltan archivos, CSP), no corrijas el HTML: repórtalo a Henry.
8. Cualquier resultado inesperado → **detente**, no reintentes a ciegas y reporta.

---

## 2. Bloqueantes: decisiones de Daniel antes de F1

Con auto-deploy, el repositorio pasa a ser la **fuente de verdad de producción**.
Estos hallazgos de gobernanza de la sesión 15–30 sep dejan de ser opcionales.

| # | Decisión | Estado |
|---|---|---|
| D1 | **Repositorio canónico.** El repo de Henry apunta a `webmaster541/Landing_Liontech`; el registro de sesión menciona `webmaster541/liontech-landings` (público, auto-sincronizado desde uno privado). Tiene que quedar **uno solo**. | ☐ |
| D2 | **Propiedad:** organización de Lion Tech (recomendado; Henry con push y sin admin, como `dlobo056/lion-intranet`) o cuenta personal. | ☐ |
| D3 | **Privado**, y la sincronización pública cortada (fotos de empleadas y `.HEIC` con EXIF, hallazgo #4). Esa sincronización es `.github/workflows/deploy-landings.yml` en `Landing_Liontech`: en cada push a `main` que toque `pages/`, `css/`, `js/`, `images/` o `videos/`, copia esas carpetas al repo **público** `webmaster541/liontech-landings` como `deploy@liontechve.com`. Se corta deshabilitando o borrando ese workflow y revocando el secreto `LANDINGS_DEPLOY_TOKEN`. El auto-deploy de este runbook **no lo necesita**: el VPS lee directo del repo privado. | ☐ |
| D4 | **Quién puede pushear a `main`.** Todo push a `main` publica. | ☐ |
| D5 | **Identidad del bot `deploy@liontechve.com`:** quién la controla, o retirarla. | ☐ |
| D6 | **CSP vs. recursos externos:** `lion-tech-care.html` carga Leaflet desde `unpkg.com` e `index.html` embebe `maps.google.com`. Si la CSP vigente no los permite, el build los va a rechazar. O Henry los autohospeda, o se amplía la CSP. | ☐ |
| D8 | **Commit `c9278aa` pendiente de publicar** (mueve fotos de tienda de `personal/` a `images/LionTech/tienda/`). Está solo en el clon local de Henry. Al pushearlo a `main`, `deploy-landings.yml` copia esas fotos al repo **público**. Daniel decide si se publica, y si se publica antes o después de cortar la sincronización pública (D3). Hasta entonces Henry no pushea `main` desde un clon que contenga ese commit. | ☐ |
| D7 | **Canal de alertas** (correo, Telegram o healthcheck externo). Sin canal, un deploy fallido pasa en silencio, igual que el hueco de F5. | ☐ (no bloquea F1–F5; bloquea F6) |

---

## 3. Cómo se garantiza que la landing llegue completa

### 3.1 El flujo

```
Henry (PC)                          GitHub (main)         VPS · systemd timer cada 2 min
──────────                          ─────────────         ────────────────────────────────
commit → git push origin main
  └─ hook pre-push: build --check   ─── si falla: NO sube
     (misma lógica que el VPS)
                                    main @ <sha>  ◀────── git fetch (deploy key solo lectura)
                                                          ¿sha nuevo? no → fin
                                                          checkout exacto de <sha> + git lfs pull
                                                          build_release.py  ──── rechaza → ALERTA, prod intacta
                                                          staging :8892 (swap) ─ ≠200 → staging vuelve atrás
                                                          prod :8888 (swap atómico de symlink)
                                                          sha256 en origen + HTTP 200 por página
                                                            └─ falla → rollback automático + ALERTA
                                                          registrar <sha>
```

Tiempo del push a producción: **≤ 3 minutos**.

### 3.2 Las cinco garantías

| Riesgo de "a medias" | Qué lo impide |
|---|---|
| Página que referencia una imagen no commiteada | `build_release.py` parte de las páginas de entrada, sigue cada enlace interno y cada `src`/`href`/`poster`/`srcset`/`url()` y cada ruta citada en el JS. **Si falta un solo archivo, no se publica nada.** Además, el hook `pre-push` lo detecta en la PC de Henry antes de subir. |
| Videos publicados como punteros LFS de 130 bytes | `git lfs pull` obligatorio; el build rechaza cualquier archivo que empiece con `version https://git-lfs`. |
| Copia parcial durante la publicación | La release se arma completa en su propio directorio y se activa con un `rename(2)` atómico del symlink. Nginx sirve la versión vieja o la nueva, **nunca una mezcla**. |
| Recurso externo bloqueado por la CSP (mapa roto) | El build lee la CSP real de producción y rechaza scripts, estilos o iframes de orígenes que la CSP no permita. |
| Fuga de material privado | Solo se copia la clausura de referencias. `personal/`, `Ideas/`, `docs/`, `.py`, `.heic`, `*.backup*` y `.rar` provocan un rechazo si alguna página los referencia, y si nadie los referencia simplemente no se copian. |

### 3.3 Qué se publica (medido el 2026-09-30 sobre el repo de Henry)

- **Páginas de entrada:** `pages/index.html`, `pages/lion-tech-care.html`.
- **Descubierta por enlace:** `pages/en-construccion.html`, enlazada desde el index (`?sitio=care|hitreek|mechanic`).
- **Total:** 61 archivos, 83 MB (el repo tiene ~350 MB en `images/` y `videos/`).
- **Estructura publicada:** `pages/<x>.html` → `/<x>.html` en la raíz del docroot;
  todo lo demás conserva su ruta (`images/...`, `videos/...`). Desde la raíz,
  `../images/x` e `images/x` resuelven igual a `/images/x`, y el HTML usa las dos
  formas. **Esta estructura es obligatoria**: servir `pages/` como subcarpeta
  rompe las rutas `images/...` del JS y de los atributos `poster`.
- **Fuera de alcance** (decisión de Daniel): Hi-Treek y Mechanic siguen en
  WordPress. `hi-treek.html` y `mechanic-ve.html` no se publican aunque cambien.
  Para sumarlos en el futuro se agregan a `ENTRY_PAGES` en `build_release.py`.
  `mechanic-ve.html` hoy referencia `../personal/` y 58 imágenes no commiteadas,
  así que el build lo rechazaría.

### 3.4 Archivos de este sistema (en el repo)

| Archivo | Dónde corre | Qué hace |
|---|---|---|
| `tools/deploy/build_release.py` | VPS y PC de Henry | Arma la release completa o la rechaza; `--check` para uso local |
| `tools/deploy/deploy.sh` | VPS | Fetch → build → staging → prod → verificación → rollback |
| `.githooks/pre-push` | PC de Henry | Bloquea un push a `main` que produciría una landing incompleta |

**Seguridad:** el VPS **no ejecuta** los scripts desde cada checkout. Se instalan
una vez en `/srv/landing-deploy/bin/` desde un commit revisado (F1.5), y solo se
actualizan a mano. Si no fuera así, cualquier push a `main` ejecutaría código
arbitrario en el VPS.

---

## 4. Fases del ejecutor

Variables usadas en todo el runbook (confirmadas en F0):

```bash
BASE=/srv/landing-deploy
PROD_ROOT=‹VERIFICAR›       # root de nginx del server :8888
STAGING_ROOT=‹VERIFICAR›    # root de nginx del server :8892
REPO_SSH=git@github.com:‹D1›.git
```

### F0 — Reconocimiento (solo lectura; se puede hacer antes de §2)

```bash
# 1. roots y caché de archivos de nginx para :8888 y :8892
nginx -T 2>/dev/null | grep -nE 'listen .*(8888|8892)|^\s*root |open_file_cache|server_name'
# 2. ¿el docroot ya es un symlink?
ls -ld "$PROD_ROOT" "$STAGING_ROOT"; readlink -f "$PROD_ROOT"
# 3. CSP vigente
curl -sI -H 'Host: liontechve.com' http://127.0.0.1:8888/ | grep -i content-security-policy
# 4. herramientas
git --version; git lfs version; python3 --version; rsync --version | head -1; flock -V
# 5. inventario de lo que está vivo hoy (para comparar en F2)
( cd "$PROD_ROOT" && find . -type f | sort ) > /root/landing-prod-inventory-$(date +%F).txt
df -h "$(dirname "$PROD_ROOT")" /srv
```

**Criterio de salida:** rutas reales de `PROD_ROOT` y `STAGING_ROOT` conocidas; se
sabe si hay `open_file_cache`; CSP copiada; `python3 ≥ 3.8`, `git-lfs` y `flock`
presentes (si falta alguno: `apt-get install -y git-lfs python3 util-linux`);
≥ 2 GB libres (10 releases × 83 MB, más el espejo del repo). Reportar con §8 y
esperar §2 antes de F1.

### F1 — Instalación (requiere §2 D1–D5 resueltas)

```bash
# F1.1 usuario sin shell
useradd --system --home "$BASE" --shell /usr/sbin/nologin landing-deploy
install -d -o landing-deploy -g landing-deploy -m 0750 \
  "$BASE" "$BASE/bin" "$BASE/releases" "$BASE/state" "$BASE/log" "$BASE/work" "$BASE/.ssh"

# F1.2 deploy key de SOLO LECTURA (no un token personal: el de dlobo056 vence el 14-oct)
sudo -u landing-deploy ssh-keygen -t ed25519 -N "" -f "$BASE/.ssh/id_ed25519" -C "landing-deploy@vps"
cat "$BASE/.ssh/id_ed25519.pub"
#   → GitHub › repo D1 › Settings › Deploy keys › Add › SIN "Allow write access"
sudo -u landing-deploy sh -c "ssh-keyscan github.com >> $BASE/.ssh/known_hosts"

# F1.3 espejo del repo
sudo -u landing-deploy git lfs install --skip-repo
sudo -u landing-deploy git clone --mirror "$REPO_SSH" "$BASE/repo.git"

# F1.4 permisos sobre los docroots (el padre debe permitir crear el .new del symlink)
chown landing-deploy:landing-deploy "$(dirname "$PROD_ROOT")"   # ‹VERIFICAR› que ese padre no aloje otros sitios;
                                                                # si los aloja, usar ACL: setfacl -m u:landing-deploy:rwx <padre>

# F1.5 instalar los scripts desde un commit revisado (no desde cada push)
C=$(git --git-dir="$BASE/repo.git" rev-parse main)
for f in build_release.py deploy.sh; do
  git --git-dir="$BASE/repo.git" show "$C:tools/deploy/$f" > "$BASE/bin/$f"
done
chmod 0750 "$BASE"/bin/*; chown -R landing-deploy:landing-deploy "$BASE"
sha256sum "$BASE"/bin/* | tee "$BASE/bin/INSTALLED-FROM-$C.sha256"
# editar en $BASE/bin/deploy.sh: PROD_ROOT, STAGING_ROOT y RELOAD_NGINX con los valores de F0

# F1.6 si F0 encontró open_file_cache: permitir SOLO el reload de nginx
cat > /etc/sudoers.d/landing-deploy <<'EOF'
landing-deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -t -q, /usr/sbin/nginx -s reload
EOF
chmod 0440 /etc/sudoers.d/landing-deploy && visudo -cf /etc/sudoers.d/landing-deploy
# si no hay open_file_cache: RELOAD_NGINX=0 y no crear este archivo
```

**Criterio de salida:** `sudo -u landing-deploy git --git-dir=$BASE/repo.git fetch`
funciona sin pedir credenciales; `$BASE/bin` tiene los dos scripts y su `.sha256`.

### F2 — Ensayo en seco (no publica nada)

```bash
sudo -u landing-deploy env DRY_RUN=1 "$BASE/bin/deploy.sh"; echo "exit=$?"
tail -n 30 "$BASE/log/deploy.log"
R=$(ls -1dt "$BASE"/releases/*/ | head -1)
# ¿qué cambia respecto de lo que está vivo?
( cd "$R" && find . -type f | sort ) > /tmp/release-inventory.txt
diff /root/landing-prod-inventory-*.txt /tmp/release-inventory.txt
# videos reales, no punteros
find "$R/videos" -type f -size -2k
```

**Criterio de salida:** `exit=0`, `DRY RUN OK` en el log y ningún video menor a
2 KB. El `diff` va en el reporte (§8) para que Henry y Daniel vean qué va a
cambiar en producción: hoy vive la cuarta versión, que salió de otro repositorio.

**Si el log muestra `BUILD REFUSED`:** detente. Cada línea dice qué falta y qué
página lo pide (ver §7). Es trabajo de Henry, no del ejecutor.

### F3 — Migración única de los docroots a symlink (ventana acordada con Daniel)

Primero staging, después producción. Es el único paso que toca producción a mano.

```bash
for ROOT in "$STAGING_ROOT" "$PROD_ROOT"; do
  B="$BASE/releases/$(date -u +%Y%m%d%H%M%S)-baseline-$(basename "$ROOT")"
  cp -a "$ROOT" "$B"
  ( cd "$B" && find . -type f -exec sha256sum {} + ) > "$B.sha256"
  ln -s "$B" "$ROOT.new"
  mv "$ROOT" "$ROOT.pre-symlink"      # se conserva: es la reversión de F3
  mv -T "$ROOT.new" "$ROOT"
  nginx -t && nginx -s reload
  ( cd "$(readlink -f "$ROOT")" && sha256sum -c --quiet "$B.sha256" ) && echo "OK $ROOT"
done
chown -h landing-deploy:landing-deploy "$PROD_ROOT" "$STAGING_ROOT"
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: liontechve.com' http://127.0.0.1:8888/
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: staging.liontechve.com' http://127.0.0.1:8892/
```

**Reversión de F3:** `mv -T "$ROOT.pre-symlink" "$ROOT"` (antes, borrar el symlink
con `rm "$ROOT"`, sin barra final) y `nginx -s reload`.

**Criterio de salida:** los dos `OK`, los dos `200` y el sitio visualmente igual
que antes.

### F4 — Primer deploy real (manual)

```bash
systemctl start landing-deploy.service        # instalar antes las unidades de §5
journalctl -u landing-deploy.service -n 50 --no-pager
cat "$BASE/state/deployed_sha"; readlink -f "$PROD_ROOT"
```

Después correr los controles externos de §6 y abrir `https://liontechve.com`,
`/lion-tech-care.html` y `/en-construccion.html?sitio=care` en un navegador:
videos, mapa, imágenes y logos de marcas.

**Criterio de salida:** `PUBLICADO <sha>` en el log, controles de §6 en verde y
las tres páginas completas.

### F5 — Pruebas de falla (obligatorias antes de activar el timer)

Usan una rama de prueba; `main` no se toca. Henry crea `deploy-test` desde `main`.

| Prueba | Cómo | Resultado esperado |
|---|---|---|
| Archivo faltante | En `deploy-test`, Henry agrega `<img src="../images/no-existe.webp">` al index y pushea sin hook (`--no-verify`) | `BUILD REFUSED … MISSING images/no-existe.webp`, `ALERTA` creada, prod intacta |
| Rollback | Con la rama buena, forzar un 500 en staging no sirve (staging corta antes). Probar el rollback manual de §7.3 y cronometrarlo | Vuelta atrás en < 5 s, `sha256sum -c` OK |
| Idempotencia | Correr el servicio dos veces seguidas sin commits nuevos | La segunda corrida sale sin hacer nada |

```bash
sudo -u landing-deploy env BRANCH=deploy-test "$BASE/bin/deploy.sh"; echo "exit=$?"
cat "$BASE/state/ALERTA"; readlink -f "$PROD_ROOT"     # debe seguir en la release de F4
rm -f "$BASE/state/ALERTA"
```

**Criterio de salida:** las tres pruebas se comportan como en la tabla. Después
Henry borra `deploy-test`.

### F6 — Activar el automático (requiere D7)

```bash
systemctl enable --now landing-deploy.timer
systemctl list-timers landing-deploy.timer
```

Conectar `$BASE/state/ALERTA` al canal de D7 y sumarlo al reporte diario de F5
(`/root/f5/LATEST.md`).

**Criterio de salida:** Henry hace un commit trivial en `main` y en ≤ 3 minutos
está en producción, con `PUBLICADO` en el log.

---

## 5. Unidades systemd

`/etc/systemd/system/landing-deploy.service`

```ini
[Unit]
Description=Auto-deploy landing liontechve.com (GitHub main)
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=landing-deploy
Group=landing-deploy
ExecStart=/srv/landing-deploy/bin/deploy.sh
TimeoutStartSec=900
ProtectSystem=strict
# ‹VERIFICAR› sustituir por el directorio PADRE de PROD_ROOT y de STAGING_ROOT
ReadWritePaths=/srv/landing-deploy /var/www
ProtectHome=true
PrivateTmp=true
# true solo si RELOAD_NGINX=0; con sudo para el reload de nginx debe ser false
NoNewPrivileges=false
```

`/etc/systemd/system/landing-deploy.timer`

```ini
[Unit]
Description=Busca commits nuevos en main cada 2 minutos

[Timer]
OnBootSec=2min
OnUnitActiveSec=2min
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl daemon-reload
systemd-analyze verify /etc/systemd/system/landing-deploy.service
```

---

## 6. Controles externos después de cada deploy

Las dos regresiones del 16-sep (`www`→apex y HTTP→HTTPS) se perdieron por
omisión. El deploy no toca nginx, así que no puede romperlas, pero se vigilan
igual. Van a la vigilancia F5, no al script de deploy:

```bash
curl -sI http://liontechve.com/      | grep -qi '^location: https://liontechve.com/' && echo ok-https
curl -sI https://www.liontechve.com/ | grep -qi '^location: https://liontechve.com/' && echo ok-www
curl -sI https://liontechve.com/     | grep -qi '^strict-transport-security'         && echo ok-hsts
```

---

## 7. Operación diaria

### 7.1 Henry (una vez por clon, en su PC)

```bash
git config core.hooksPath .githooks                             # activa el pre-push
python tools/deploy/build_release.py --src . --check            # chequeo manual
```

### 7.2 Henry (cada cambio)

```bash
git add -A pages/ images/ videos/        # commitear TODO lo que las páginas usan
git commit -m "fix: update Chacao store hours"
git push origin main                     # el hook valida; ≤ 3 min después, en vivo
```

- Para trabajar sin publicar: `git switch -c wip/<tema>`. **Solo `main` publica.**
- Para deshacer algo publicado: `git revert <sha> && git push origin main`. El
  rollback manual (7.3) no alcanza por sí solo: el timer no republica un sha que
  ya publicó, pero el próximo push volvería a incluir el cambio malo.

### 7.3 Responsable del VPS

```bash
cat /srv/landing-deploy/state/deployed_sha                  # qué está publicado
tail -n 30 /srv/landing-deploy/log/deploy.log
journalctl -u landing-deploy.service --since today
systemctl stop landing-deploy.timer                          # pausar (start para retomar)

# rollback manual (segundos, sin cloudflared)
ls -1dt /srv/landing-deploy/releases/*/
R=/srv/landing-deploy/releases/<release-anterior>
ln -sfn "$R" "$PROD_ROOT.new" && mv -T "$PROD_ROOT.new" "$PROD_ROOT" && nginx -s reload
( cd "$R" && sha256sum -c --quiet "$R.sha256" ) && echo ok
```

### 7.4 Qué significa cada rechazo del build

| Mensaje | Significa | Lo resuelve |
|---|---|---|
| `MISSING <ruta> (referenced by <página>)` | Una página usa un archivo que no está en el commit | Henry: commitear el archivo o quitar la referencia |
| `NOT-IN-HEAD <ruta>` (solo `--check`) | El archivo existe en la PC pero no está commiteado | Henry: `git add` + commit |
| `LFS-POINTER <ruta>` | El video no se descargó de LFS | VPS: `git lfs` instalado y cuota LFS del repo |
| `FORBIDDEN <ruta>` | Una página referencia `personal/`, `.heic`, un backup, etc. | Henry: mover el recurso a `images/` |
| `CSP-BLOCKED <host>` | Script, estilo o iframe de un origen no permitido por la CSP | Henry (autohospedar) o Daniel (CSP) — D6 |
| `noindex escrito en el HTML` | El HTML trae `robots noindex` | Henry: quitarlo (en prod lo decide nginx por host) |

---

## 8. Plantilla de reporte del ejecutor (al cerrar cada fase o al detenerse)

```
Fase: F<n> — <nombre>
Resultado: completada | detenida
Criterio de salida: cumplido | no cumplido → <cuál>
Evidencia:
  - <comando>: <salida relevante>
Cambios hechos en el VPS: <lista exacta, o "ninguno">
Reversión disponible: <cómo>
Necesita decisión de: Daniel | Henry | nadie → <qué>
```

---

## 9. Estado del lado de Henry al 2026-09-30 (a resolver antes de F2)

Medido con `build_release.py --check` sobre el repo local:

- ❌ `pages/index.html` usa `images/logo-yummy-rides-v2.png` e
  `images/logo-zoom-trim.jpg`, que **no están commiteadas**. Hoy el hook bloquea
  el push a `main` por esto.
- ⚠️ Hay un commit sin pushear (`c9278aa`, decisión de Daniel: D8) y cambios sin commitear en
  `pages/index.html` y `pages/mechanic-ve.html`.
- ⚠️ D6: `unpkg.com` (Leaflet en Care) y `maps.google.com` (iframe en el index).
- ✅ Los 61 archivos restantes de la clausura existen y están en `HEAD`.

`.gitignore` sugerido, para que el material de trabajo no llegue al repositorio
(la clausura ya impide que llegue a producción):

```gitignore
*.backup*.html
pages/index2.html
/*.py
*_text.txt
*.pdf
personal/
Ideas/
propuestas/
Frames/
*.heic
*.HEIC
```

---

## 10. Checklist final

- [ ] §2 D1–D8 resueltas
- [ ] F0 reportado con rutas reales y CSP
- [ ] F1 instalado; scripts con hash registrado
- [ ] F2 en seco sin rechazos; diff contra producción revisado por Henry y Daniel
- [ ] F3 migración a symlink (staging y prod) con `sha256sum -c` OK
- [ ] F4 primer deploy, las tres páginas completas en el navegador
- [ ] F5 las tres pruebas de falla se comportan como en la tabla
- [ ] F6 timer activo y alerta conectada; commit trivial publicado en ≤ 3 min
- [ ] `cloudflared` no se reinició; `liontechve_wp` intacto
