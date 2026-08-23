"""Compose 左綴じ wrap: back | 12mm spine | front."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
SPINE_MM = 12
PAGE_MM = 210


def main() -> None:
    front = Image.open(ROOT / 'cover-a4.png').convert('RGB')
    back = Image.open(ROOT / 'back-a4.png').convert('RGB')
    spine = Image.open(ROOT / 'spine-12mm.png').convert('RGB')
    h = front.height
    sw = round(front.width * SPINE_MM / PAGE_MM)
    spine = spine.resize((sw, h), Image.Resampling.LANCZOS)
    back = back.resize(front.size, Image.Resampling.LANCZOS)
    wrap = Image.new('RGB', (back.width + sw + front.width, h), (255, 255, 255))
    wrap.paste(back, (0, 0))
    wrap.paste(spine, (back.width, 0))
    wrap.paste(front, (back.width + sw, 0))
    out = ROOT / 'wrap-a4-12mm.png'
    wrap.save(out, 'PNG', optimize=True)
    print('wrote', out, wrap.size)
    preview = wrap.copy()
    preview.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    prev = ROOT / 'wrap-preview.png'
    preview.save(prev, 'PNG', optimize=True)
    print('wrote', prev, preview.size)


if __name__ == '__main__':
    main()
