#!/usr/bin/env python3
"""Draw the website's MacBook illustration: a MacBook Air-style laptop whose
screen shows the Bijoy keyboard layout. Writes docs/macbook.svg (inlined into
docs/index.html between the MACBOOK markers)."""
import pathlib, re

D = "◌"  # dotted circle, shows where a kar sits
# key: (normal, shifted)
LAYOUT = {
    "1": ("১", ""), "2": ("২", ""), "3": ("৩", ""), "4": ("৪", "৳"), "5": ("৫", ""),
    "6": ("৬", ""), "7": ("৭", "ঁ"), "8": ("৮", ""), "9": ("৯", ""), "0": ("০", ""),
    "q": ("ঙ", "ং"), "w": ("য", "য়"), "e": ("ড", "ঢ"), "r": ("প", "ফ"), "t": ("ট", "ঠ"),
    "y": ("চ", "ছ"), "u": ("জ", "ঝ"), "i": ("হ", "ঞ"), "o": ("গ", "ঘ"), "p": ("ড়", "ঢ়"),
    "a": (D + "ৃ", "র্"), "s": (D + "ু", D + "ূ"), "d": (D + "ি", D + "ী"), "f": (D + "া", "অ"),
    "g": (D + "্", "।"), "h": ("ব", "ভ"), "j": ("ক", "খ"), "k": ("ত", "থ"), "l": ("দ", "ধ"),
    "z": (D + "্র", D + "্য"), "x": ("ও", D + "ৗ"), "c": (D + "ে", D + "ৈ"), "v": ("র", "ল"),
    "b": ("ন", "ণ"), "n": ("স", "ষ"), "m": ("ম", "শ"), "\\": ("ৎ", "ঃ"),
}
ROWS = [
    (0.0, list("`1234567890-="), ("delete", 1.5)),
    (1.5, list("qwertyuiop[]\\"), None),
    (1.8, list("asdfghjkl;'"), ("return", 1.7)),
    (2.3, list("zxcvbnm,./"), ("shift", 2.2)),
]
LEAD = ["tab", "caps", "shift"]

W, H = 800, 480
out = []
a = out.append
a(f'<svg class="macbook" viewBox="0 0 {W} {H}" role="img" aria-labelledby="mbTitle">')
a('<title id="mbTitle">MacBook showing the Bijoy Bangla keyboard layout</title>')
a('''<defs>
  <linearGradient id="mb-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E7A49"/><stop offset=".55" stop-color="#075233"/><stop offset="1" stop-color="#03301D"/></linearGradient>
  <radialGradient id="mb-glow" cx=".78" cy=".2" r=".6"><stop offset="0" stop-color="#E0303F" stop-opacity=".55"/><stop offset="1" stop-color="#E0303F" stop-opacity="0"/></radialGradient>
  <linearGradient id="mb-deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9ECEE"/><stop offset=".45" stop-color="#C9CED2"/><stop offset="1" stop-color="#8E959B"/></linearGradient>
  <linearGradient id="mb-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDD2D6"/><stop offset="1" stop-color="#A9B0B5"/></linearGradient>
  <linearGradient id="mb-shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="mb-key" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2EF"/></linearGradient>
</defs>''')
# shadow under the laptop
a(f'<ellipse cx="400" cy="466" rx="380" ry="10" fill="#000" opacity=".18"/>')
# lid: aluminium edge, black bezel, screen
a('<rect x="78" y="6" width="644" height="428" rx="22" fill="url(#mb-lid)"/>')
a('<rect x="81" y="9" width="638" height="422" rx="19" fill="#0B0D0E"/>')
SX, SY, SW, SH = 93, 21, 614, 404
a(f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="9" fill="url(#mb-wall)"/>')
a(f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="9" fill="url(#mb-glow)"/>')
# menu bar with the input menu icon
a(f'<rect x="{SX}" y="{SY}" width="{SW}" height="17" fill="#000" opacity=".28"/>')
a('<circle cx="108" cy="29.5" r="3.4" fill="#fff" opacity=".9"/>')
for i, w in enumerate([22, 18, 20, 26]):
    a(f'<rect x="{122 + sum([22,18,20,26][:i]) + i*10}" y="27.5" width="{w}" height="4" rx="2" fill="#fff" opacity=".6"/>')
a('<rect x="606" y="23.5" width="18" height="12" rx="3" fill="#fff"/>')
a('<text x="615" y="33" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="9" font-weight="700" fill="#075233">U</text>')
a('<rect x="632" y="27.5" width="18" height="4" rx="2" fill="#fff" opacity=".6"/><rect x="658" y="27.5" width="36" height="4" rx="2" fill="#fff" opacity=".6"/>')
# notch
a('<path d="M368 21 h64 v8 q0 6 -6 6 h-52 q-6 0 -6 -6 z" fill="#0B0D0E"/>')

# layout window
WX, WY, WW, WH = 110, 100, 580, 262
a(f'<rect x="{WX}" y="{WY+6}" width="{WW}" height="{WH}" rx="12" fill="#000" opacity=".25"/>')
a(f'<rect x="{WX}" y="{WY}" width="{WW}" height="{WH}" rx="12" fill="#F8F8F3"/>')
for i, c in enumerate(["#FF5F57", "#FEBC2E", "#28C840"]):
    a(f'<circle cx="{WX+18+i*16}" cy="{WY+16}" r="5" fill="{c}"/>')
a(f'<text x="{WX+WW/2}" y="{WY+20}" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="11" font-weight="600" fill="#15201A">Bijoy Bangla Keyboard Layout</text>')

U, G = 34.0, 3.6       # key unit and gap
KX, KY = WX + 20, WY + 36
BN = "'Hind Siliguri','Kohinoor Bangla','Noto Sans Bengali',sans-serif"
EN = "-apple-system,Helvetica,Arial,sans-serif"

def key(x, y, w, k=None, label=None):
    mapped = k in LAYOUT
    fill = "url(#mb-key)" if mapped else "#E3E9E5"
    a(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{U:.1f}" rx="5" fill="{fill}" stroke="#C8D2CB" stroke-width=".8"/>')
    if label:
        a(f'<text x="{x+6:.1f}" y="{y+U-7:.1f}" font-family="{EN}" font-size="8" fill="#56645C">{label}</text>')
        return
    if k is None:
        return
    if mapped:
        n, s = LAYOUT[k]
        a(f'<text x="{x+w/2:.1f}" y="{y+U-9:.1f}" text-anchor="middle" font-family="{BN}" font-size="15" font-weight="600" fill="#064B2C">{n}</text>')
        if s:
            a(f'<text x="{x+w-4:.1f}" y="{y+11:.1f}" text-anchor="end" font-family="{BN}" font-size="9" fill="#E0303F">{s}</text>')
        a(f'<text x="{x+4:.1f}" y="{y+10:.1f}" font-family="{EN}" font-size="7" fill="#8A968F">{k.upper() if k.isalpha() else k}</text>')
    else:
        esc = {"<": "&lt;", "&": "&amp;"}.get(k, k)
        a(f'<text x="{x+w/2:.1f}" y="{y+U/2+4:.1f}" text-anchor="middle" font-family="{EN}" font-size="10" fill="#8A968F">{esc}</text>')

y = KY
for r, (lead, keys, tail) in enumerate(ROWS):
    x = KX
    if lead:
        key(x, y, lead * U, label=LEAD[r - 1]); x += lead * U + G
    for k in keys:
        key(x, y, U, k); x += U + G
    if tail:
        key(x, y, tail[1] * U, label=tail[0])
    y += U + G
# space row
key(KX, y, 1.3 * U, label="fn")
key(KX + 1.3 * U + G, y, 1.3 * U, label="control")
key(KX + 2.6 * U + 2 * G, y, 1.3 * U, label="option")
key(KX + 3.9 * U + 3 * G, y, 1.6 * U, label="command")
sx = KX + 5.5 * U + 4 * G
sw = 5.4 * U
key(sx, y, sw)
a(f'<text x="{sx+sw/2:.1f}" y="{y+U/2+4:.1f}" text-anchor="middle" font-family="{EN}" font-size="8" fill="#56645C">space</text>')
key(sx + sw + G, y, 1.6 * U, label="command")
key(sx + sw + 1.6 * U + 2 * G, y, 1.3 * U, label="option")
# legend
ly = WY + WH - 14
a(f'<text x="{WX+WW/2}" y="{ly}" text-anchor="middle" font-family="{EN}" font-size="9" fill="#56645C">'
  f'Big letter: normal key<tspan dx="18" fill="#E0303F">Small red letter: with Shift</tspan><tspan dx="18">g then a kar = full vowel</tspan></text>')

# subtle reflection on the screen
a(f'<path d="M{SX} {SY} h{SW*0.55} l-{SW*0.35} {SH} h-{SW*0.2} z" fill="url(#mb-shine)"/>')
# base: deck + front lip + thumb notch
a('<path d="M14 434 H786 V440 Q786 446 778 448 L740 458 Q730 461 716 461 H84 Q70 461 60 458 L22 448 Q14 446 14 440 Z" fill="url(#mb-deck)"/>')
a('<rect x="14" y="434" width="772" height="3" fill="#F4F6F7"/>')
a('<path d="M346 434 h108 v2 q0 5 -6 5 h-96 q-6 0 -6 -5 z" fill="#A3AAAF"/>')
a('</svg>')

svg = "\n".join(out)
root = pathlib.Path(__file__).resolve().parent.parent
(root / "docs/macbook.svg").write_text('<?xml version="1.0" encoding="utf-8"?>\n' + svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1))
idx = root / "docs/index.html"
html = idx.read_text()
new = "<!-- MACBOOK -->\n" + svg + "\n<!-- /MACBOOK -->"
if "<!-- MACBOOK -->" in html:
    html = re.sub(r"<!-- MACBOOK -->.*?<!-- /MACBOOK -->", lambda m: new, html, flags=re.S)
else:
    html = re.sub(r'<div class="tile"><svg viewBox="0 0 400 190".*?</svg></div>',
                  lambda m: '<div class="mac-hero">' + new + '</div>', html, count=1, flags=re.S)
idx.write_text(html)
print("ok")
