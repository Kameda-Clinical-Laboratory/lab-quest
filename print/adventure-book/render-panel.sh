#!/usr/bin/env bash
# Render one print HTML to PNG. Chrome sometimes hangs after writing the file.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="${1:?usage: render-panel.sh cover|spine|back}"
USER_DIR="$(mktemp -d /tmp/lq-cover-chrome.XXXXXX)"
cleanup() { rm -rf "$USER_DIR"; }
trap cleanup EXIT

case "$NAME" in
  cover) HTML="$ROOT/cover.html"; OUT="$ROOT/cover-a4.png"; W=794; H=1123 ;;
  back)  HTML="$ROOT/back.html";  OUT="$ROOT/back-a4.png";  W=794; H=1123 ;;
  spine) HTML="$ROOT/spine.html"; OUT="$ROOT/spine-12mm.png"; W=46; H=1123 ;;
  *) echo "unknown panel: $NAME" >&2; exit 1 ;;
esac

rm -f "$OUT"
timeout 25 google-chrome \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-extensions \
  --disable-background-networking \
  --disable-sync \
  --disable-default-apps \
  --no-first-run \
  --hide-scrollbars \
  --user-data-dir="$USER_DIR" \
  --force-device-scale-factor=3 \
  --window-size="$W,$H" \
  --virtual-time-budget=8000 \
  --screenshot="$OUT" \
  "file://$HTML" \
  || true

if [[ ! -s "$OUT" ]]; then
  echo "$NAME render failed" >&2
  exit 1
fi
echo "wrote $OUT ($(wc -c < "$OUT") bytes)"
