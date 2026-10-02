#!/usr/bin/env bash
# Auto-deploy of the liontechve.com landing. Complete release or nothing.
# Env: DRY_RUN=1 builds and checks without publishing. BRANCH=<name> overrides main (tests only).
set -euo pipefail

BASE=/srv/landing-deploy
REPO="$BASE/repo.git"
BRANCH="${BRANCH:-main}"
DRY_RUN="${DRY_RUN:-0}"
PROD_ROOT=/var/www/liontech_landing              # F0: replace with the verified nginx root of :8888
STAGING_ROOT=/var/www/liontech_landing_staging   # F0: replace with the verified nginx root of :8892
PROD_URL=http://127.0.0.1:8888
STAGING_URL=http://127.0.0.1:8892
PROD_HOST=liontechve.com
STAGING_HOST=staging.liontechve.com
RELOAD_NGINX=1                                   # F0: set to 0 if nginx has no open_file_cache
KEEP=10
STATE="$BASE/state/deployed_sha"
LOG="$BASE/log/deploy.log"
ALERT="$BASE/state/ALERTA"

log()  { printf '%s [%s] %s\n' "$(date -u +%FT%TZ)" "$BRANCH" "$*" | tee -a "$LOG"; }
fail() { log "FALLA: $*"; printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" > "$ALERT"; exit 1; }
swap() { ln -sfn "$2" "$1.new" && mv -T "$1.new" "$1"; }   # atomic: rename(2) of a symlink
reload_nginx() { [[ "$RELOAD_NGINX" == 1 ]] && sudo /usr/sbin/nginx -t -q && sudo /usr/sbin/nginx -s reload; return 0; }
http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 -H "Host: $2" "$1"; }

exec 9>"$BASE/state/lock"
flock -n 9 || exit 0

# 1. new commit?
git --git-dir="$REPO" fetch --quiet --prune origin "+refs/heads/$BRANCH:refs/heads/$BRANCH"
NEW=$(git --git-dir="$REPO" rev-parse "$BRANCH")
OLD=$(cat "$STATE" 2>/dev/null || echo none)
if [[ "$NEW" == "$OLD" && "$DRY_RUN" != 1 ]]; then exit 0; fi
log "commit: $OLD -> $NEW (dry_run=$DRY_RUN)"

# 2. exact checkout of that commit, with LFS content
WORK="$BASE/work/$NEW"
rm -rf "$WORK"
git clone --quiet --no-checkout "$REPO" "$WORK"
git -C "$WORK" checkout --quiet "$NEW"
git -C "$WORK" lfs pull || fail "git lfs pull fallo en $NEW"

# 3. build the closure; refuses on any missing, forbidden, LFS-pointer or CSP-blocked file
CSP=$(curl -sI --max-time 15 -H "Host: $PROD_HOST" "$PROD_URL/" | tr -d '\r' \
      | sed -n 's/^[Cc]ontent-[Ss]ecurity-[Pp]olicy: //p')
[[ -n "$CSP" ]] || log "AVISO: produccion no devolvio CSP; se omite el control de origenes"
REL="$BASE/releases/$(date -u +%Y%m%d%H%M%S)-${NEW:0:12}"
python3 "$BASE/bin/build_release.py" --src "$WORK" --out "$REL" --csp "$CSP" >>"$LOG" 2>&1 \
  || { rm -rf "$REL"; fail "build rechazado para $NEW (detalle en $LOG)"; }

# 4. content checks that are not about files
if grep -Eiq '<meta[^>]+name=["'\'']robots["'\''][^>]+noindex' "$REL"/*.html; then
  fail "noindex escrito en el HTML de $NEW (en prod lo decide nginx por host)"
fi

if [[ "$DRY_RUN" == 1 ]]; then
  log "DRY RUN OK: release completa en $REL (no publicada)"
  rm -rf "$WORK"
  exit 0
fi

# 5. staging first
PREV_STAGING=$(readlink -f "$STAGING_ROOT")
swap "$STAGING_ROOT" "$REL"; reload_nginx
code=$(http_code "$STAGING_URL/" "$STAGING_HOST")
if [[ "$code" != 200 ]]; then
  swap "$STAGING_ROOT" "$PREV_STAGING"; reload_nginx
  fail "staging respondio $code con $NEW; staging restaurado"
fi

# 6. atomic swap in production
PREV_PROD=$(readlink -f "$PROD_ROOT")
swap "$PROD_ROOT" "$REL"; reload_nginx
rollback() { swap "$PROD_ROOT" "$PREV_PROD"; reload_nginx; fail "ROLLBACK a $(basename "$PREV_PROD"): $*"; }

# 7. verify the origin by file, never by HTTP response hash (Cloudflare rewrites HTML)
( cd "$(readlink -f "$PROD_ROOT")" && sha256sum -c --quiet "$REL.sha256" ) \
  || rollback "el docroot no coincide con el manifiesto de $NEW"
for page in $(cd "$REL" && ls -1 *.html); do
  path="/$page"; [[ "$page" == index.html ]] && path="/"
  code=$(http_code "$PROD_URL$path" "$PROD_HOST")
  [[ "$code" == 200 ]] || rollback "$path respondio $code"
done

# 8. record and prune (never the live prod/staging releases, never the baseline)
echo "$NEW" > "$STATE"
rm -f "$ALERT"
rm -rf "$WORK"
live_prod=$(readlink -f "$PROD_ROOT"); live_staging=$(readlink -f "$STAGING_ROOT")
ls -1dt "$BASE"/releases/*/ | sed 's:/$::' | grep -v -- '-baseline' | tail -n +$((KEEP + 1)) \
  | while read -r d; do
      [[ "$d" == "$live_prod" || "$d" == "$live_staging" ]] && continue
      rm -rf "$d" "$d.sha256" "$d.manifest.json"
    done
log "PUBLICADO $NEW en $(basename "$REL")"
