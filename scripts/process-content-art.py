#!/usr/bin/env python3
"""Copy generated dialogue backgrounds and knock out Aspia sprite backgrounds."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path("/opt/cursor/artifacts/assets")
ART = ROOT / "public" / "art"
ASPIA = ART / "aspia"

BACKGROUNDS = [
    "quest-dialogue-bg-nightlab.png",
    "quest-dialogue-bg-phlebotomy.png",
    "quest-dialogue-bg-centrifuge.png",
    "quest-dialogue-bg-nursestation.png",
    "quest-dialogue-bg-reception.png",
    "quest-dialogue-bg-courtyard.png",
]

SPRITES = {
    "aspia-chibi-neutral.png": "chibi-neutral.png",
    "aspia-chibi-think.png": "chibi-think.png",
    "aspia-chibi-happy.png": "chibi-happy.png",
    "aspia-chibi-worry.png": "chibi-worry.png",
    "aspia-chibi-explain.png": "chibi-explain.png",
    "aspia-chibi-determined.png": "chibi-determined.png",
    "aspia-chibi-scope.png": "chibi-scope.png",
    "aspia-chibi-pipette.png": "chibi-pipette.png",
    "aspia-chibi-tubes.png": "chibi-tubes.png",
    "aspia-chibi-analyzer.png": "chibi-analyzer.png",
}


def knock_out_flat_bg(im: Image.Image, tol: int = 28) -> Image.Image:
    """Flood-fill from the edges so interior beige (shirt) is preserved."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    samples = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    br = sum(c[0] for c in samples) // 4
    bg = sum(c[1] for c in samples) // 4
    bb = sum(c[2] for c in samples) // 4
    limit = tol * 3

    def is_bg(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a == 0:
            return False
        return abs(r - br) + abs(g - bg) + abs(b - bb) <= limit

    q: deque[tuple[int, int]] = deque()
    seen = bytearray(w * h)

    def push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not seen[y * w + x]:
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(x, y):
            continue
        r, g, b, _a = px[x, y]
        px[x, y] = (r, g, b, 0)
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)

    return rgba


def chroma_remaining_bg(im: Image.Image, bg_rgb: tuple[int, int, int], limit: int = 50) -> Image.Image:
    """Remove leftover flat-bg pockets that flood-fill could not reach (e.g. between arm and torso)."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    br, bg, bb = bg_rgb
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if abs(r - br) + abs(g - bg) + abs(b - bb) <= limit:
                px[x, y] = (r, g, b, 0)
    return rgba


def crop_to_alpha(im: Image.Image, pad: int = 24) -> Image.Image:
    alpha = im.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def main() -> None:
    ASPIA.mkdir(parents=True, exist_ok=True)
    for name in BACKGROUNDS:
        src = SRC / name
        if not src.exists():
            raise SystemExit(f"missing {src}")
        dst = ART / name
        dst.write_bytes(src.read_bytes())
        print(f"bg {dst.relative_to(ROOT)}")

    for src_name, dst_name in SPRITES.items():
        src = SRC / src_name
        if not src.exists():
            raise SystemExit(f"missing {src}")
        src_im = Image.open(src).convert("RGBA")
        sw, sh = src_im.size
        corners = [src_im.getpixel((0, 0)), src_im.getpixel((sw - 1, 0)), src_im.getpixel((0, sh - 1)), src_im.getpixel((sw - 1, sh - 1))]
        bg_rgb = (
            sum(c[0] for c in corners) // 4,
            sum(c[1] for c in corners) // 4,
            sum(c[2] for c in corners) // 4,
        )
        out = knock_out_flat_bg(src_im)
        out = chroma_remaining_bg(out, bg_rgb)
        out = crop_to_alpha(out)
        dst = ASPIA / dst_name
        out.save(dst, "PNG", optimize=True)
        print(f"sprite {dst.relative_to(ROOT)} {out.size}")


if __name__ == "__main__":
    main()
