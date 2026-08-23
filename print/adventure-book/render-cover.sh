#!/usr/bin/env bash
# Render cover.html to A4 PNG. Chrome sometimes hangs after writing the file.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/cover-a4.png"
USER_DIR="$(mktemp -d /tmp/lq-cover-chrome.XXXXXX)"
cleanup() { rm -rf "$USER_DIR"; }
trap cleanup EXIT

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
  --window-size=794,1123 \
  --virtual-time-budget=8000 \
  --screenshot="$OUT" \
  "file://$ROOT/cover.html" \
  || true

if [[ ! -s "$OUT" ]]; then
  echo "cover render failed" >&2
  exit 1
fi
echo "wrote $OUT ($(wc -c < "$OUT") bytes)"
