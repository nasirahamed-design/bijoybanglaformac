#!/usr/bin/env python3
"""Generate the Bijoy Bangla for Mac logo files in Branding/.

Text is converted to outlines, so the SVGs look the same everywhere with no
font installed. Needs fontTools and Noto Sans Bold:
    pip install fonttools
    python3 Scripts/make-logo.py [path/to/NotoSans-Bold.ttf]
"""
import os
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT = sys.argv[1] if len(sys.argv) > 1 else "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Branding")

GREEN_TOP, GREEN_BOTTOM = "#11975A", "#075233"
RED = "#E0303F"
INK_LIGHT, INK_DARK = "#15201A", "#E7EFEA"

font = TTFont(FONT)
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
hmtx = font["hmtx"]


def text_path(text, size, tracking=0.0):
    """SVG path data for `text` with the baseline at y=0, plus its width."""
    scale = size / upm
    pen = SVGPathPen(glyphs)
    x = 0.0
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x, 0))
        glyphs[name].draw(tpen)
        x += hmtx[name][0] * scale
        if i < len(text) - 1:
            x += tracking
    return pen.getCommands(), x


def laptop(screen_text=True):
    """The laptop drawing, 400 x 190 units."""
    parts = [
        '<rect x="30" y="2" width="340" height="164" rx="12" fill="#26302B"/>',
        '<rect x="40" y="12" width="320" height="144" rx="4" fill="url(#bbm-scr)"/>',
        '<rect x="196" y="5" width="8" height="3" rx="1.5" fill="#0F1712"/>',
        '<path d="M2 168 H398 L392 181 Q389 187 380 187 H20 Q11 187 8 181 Z" fill="url(#bbm-base)"/>',
        '<rect x="168" y="168" width="64" height="6" rx="3" fill="#7D8882"/>',
    ]
    if not screen_text:
        # Icon only: the screen becomes the flag, sun set toward the left
        parts.insert(3, f'<circle cx="178" cy="84" r="44" fill="{RED}"/>')
    else:
        parts.insert(3, f'<circle cx="334" cy="36" r="10" fill="{RED}"/>')
        d, w = text_path("Bijoy Bangla", 44)
        parts.append(f'<path transform="translate({200 - w / 2:.2f} 101)" d="{d}" fill="#fff"/>')
    return "\n  ".join(parts)


DEFS = f'''<defs>
    <linearGradient id="bbm-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{GREEN_TOP}"/><stop offset="1" stop-color="{GREEN_BOTTOM}"/></linearGradient>
    <linearGradient id="bbm-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3DAD6"/><stop offset="1" stop-color="#8F9A94"/></linearGradient>
  </defs>'''


def full_logo(ink):
    """Laptop + '---- FOR MAC ----' underneath. ink=None uses currentColor."""
    d, w = text_path("FOR MAC", 26, tracking=9)
    line_y, text_base = 226, 235.5
    gap = 16
    left_end = 200 - w / 2 - gap
    right_start = 200 + w / 2 + gap
    fill = ink or "currentColor"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 248" role="img" aria-label="Bijoy Bangla for Mac">
  <title>Bijoy Bangla for Mac</title>
  {DEFS}
  {laptop()}
  <rect x="6" y="{line_y - 1.5}" width="{left_end - 6:.2f}" height="3" rx="1.5" fill="{RED}"/>
  <rect x="{right_start:.2f}" y="{line_y - 1.5}" width="{394 - right_start:.2f}" height="3" rx="1.5" fill="{RED}"/>
  <path transform="translate({200 - w / 2:.2f} {text_base})" d="{d}" fill="{fill}"/>
</svg>
'''


def icon_only():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 190" role="img" aria-label="Bijoy Bangla for Mac">
  {DEFS}
  {laptop(screen_text=False)}
</svg>
'''


def favicon():
    """Square favicon: the screen-less laptop centred in a 400 x 400 box."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -70 400 330">
  {DEFS}
  {laptop(screen_text=False)}
</svg>
'''


os.makedirs(OUT, exist_ok=True)
files = {
    "logo.svg": full_logo(INK_LIGHT),
    "logo-dark.svg": full_logo(INK_DARK),
    "logo-currentcolor.svg": full_logo(None),
    "laptop.svg": icon_only(),
    "favicon.svg": favicon(),
}
for name, svg in files.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg)
    print("wrote", os.path.join("Branding", name))
