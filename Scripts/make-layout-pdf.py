#!/usr/bin/env python3
"""Printable one-page Bijoy keyboard layout (A4 landscape).

Writes Distribution/keyboard-layout.html and renders it with WeasyPrint to
docs/Bijoy-Keyboard-Layout.pdf (linked from the website's layout section).
Needs: weasyprint and the Noto Sans Bengali font.
"""
import pathlib, subprocess

D = "◌"
MAP = {
    "1": ("১", ""), "2": ("২", ""), "3": ("৩", ""), "4": ("৪", "৳"), "5": ("৫", ""), "6": ("৬", ""),
    "7": ("৭", "ঁ"), "8": ("৮", ""), "9": ("৯", ""), "0": ("০", ""),
    "q": ("ঙ", "ং"), "w": ("য", "য়"), "e": ("ড", "ঢ"), "r": ("প", "ফ"), "t": ("ট", "ঠ"), "y": ("চ", "ছ"),
    "u": ("জ", "ঝ"), "i": ("হ", "ঞ"), "o": ("গ", "ঘ"), "p": ("ড়", "ঢ়"),
    "a": (D + "ৃ", "র্"), "s": (D + "ু", D + "ূ"), "d": (D + "ি", D + "ী"), "f": (D + "া", "অ"), "g": (D + "্", "।"),
    "h": ("ব", "ভ"), "j": ("ক", "খ"), "k": ("ত", "থ"), "l": ("দ", "ধ"),
    "z": (D + "্র", D + "্য"), "x": ("ও", D + "ৗ"), "c": (D + "ে", D + "ৈ"), "v": ("র", "ল"), "b": ("ন", "ণ"),
    "n": ("স", "ষ"), "m": ("ম", "শ"), "\\": ("ৎ", "ঃ"),
}
ROWS = [
    (None, list("`1234567890-="), ("delete", 1.6)),
    (("tab", 1.6), list("qwertyuiop[]\\"), None),
    (("caps", 1.9), list("asdfghjkl;'"), ("return", 1.9)),
    (("shift", 2.4), list("zxcvbnm,./"), ("shift", 2.4)),
]
TIPS = [
    ("কি", "d j", "ি, ে, ৈ are typed before the consonant and move into place"),
    ("আ ই উ এ", "g f · g d · g s · g c", "g then a vowel sign gives the full vowel"),
    ("ক্ষ", "j g N", "g joins two consonants into a যুক্তাক্ষর"),
    ("কর্ম", "j m A", "Shift-A after a consonant adds রেফ"),
    ("প্র · ক্য", "r z · j Z", "z adds র-ফলা, Shift-Z adds য-ফলা"),
    ("কো · কৌ", "c j f · c j X", "ে + consonant + া or ৗ"),
]

def key(k):
    m = MAP.get(k)
    en = k.upper() if k.isalpha() else k
    if not m:
        return f'<div class="k blank"><span class="en">{en}</span></div>'
    alt = f'<span class="alt">{m[1]}</span>' if m[1] else ""
    return f'<div class="k"><span class="en">{en}</span>{alt}<span class="bn">{m[0]}</span></div>'

rows = []
for lead, keys, tail in ROWS:
    parts = []
    if lead: parts.append(f'<div class="k lbl" style="flex-grow:{lead[1]}">{lead[0]}</div>')
    parts += [key(k) for k in keys]
    if tail: parts.append(f'<div class="k lbl" style="flex-grow:{tail[1]}">{tail[0]}</div>')
    rows.append('<div class="row">' + "".join(parts) + "</div>")
rows.append('<div class="row"><div class="k lbl" style="flex-grow:5">control-space · switch Bangla / English</div>'
            '<div class="k lbl space" style="flex-grow:6">space</div><div class="k lbl" style="flex-grow:3.4"></div></div>')
tips = "".join(f'<div class="tip"><b>{a}</b><kbd>{b}</kbd><span>{c}</span></div>' for a, b, c in TIPS)

html = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Bijoy keyboard layout</title>
<style>
@page {{ size: A4 landscape; margin: 12mm 13mm; }}
body {{ font-family: "Noto Sans", "Noto Sans Bengali", sans-serif; color: #15201A; margin: 0; }}
header {{ display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #0B6B3F; padding-bottom: 4mm; margin-bottom: 6mm; }}
h1 {{ font: 700 20pt "Noto Sans", sans-serif; margin: 0; color: #0B6B3F; }}
h1 span {{ font-family: "Noto Sans Bengali"; color: #15201A; font-size: 17pt; margin-left: 4mm; }}
header p {{ margin: 0; font-size: 9.5pt; color: #56645C; }}
.kb {{ background: #EEF7F1; border-radius: 4mm; padding: 3mm; }}
.row {{ display: flex; gap: 1.6mm; margin-bottom: 1.6mm; }}
.row:last-child {{ margin-bottom: 0; }}
.k {{ position: relative; flex: 1 1 0; height: 15mm; border: 0.35mm solid #C8D2CB; border-radius: 2mm; background: #fff; }}
.k .en {{ position: absolute; left: 1.6mm; top: 1mm; font-size: 8pt; color: #56645C; }}
.k .alt {{ position: absolute; right: 1.6mm; top: 0.8mm; font: 600 11pt "Noto Sans Bengali"; color: #E0303F; }}
.k .bn {{ position: absolute; left: 0; right: 0; bottom: 1.4mm; text-align: center; font: 700 19pt/1 "Noto Sans Bengali"; color: #064B2C; }}
.k.blank {{ background: transparent; }}
.k.lbl {{ background: transparent; font-size: 8pt; color: #56645C; padding: 1.5mm; box-sizing: border-box; }}
.k.space {{ text-align: center; }}
.legend {{ display: flex; gap: 8mm; margin: 3mm 0 4mm; font-size: 9.5pt; color: #56645C; }}
.legend b {{ color: #064B2C; font-family: "Noto Sans Bengali"; }} .legend i {{ font-style: normal; color: #E0303F; font-family: "Noto Sans Bengali"; }}
.tips {{ display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 5mm; }}
.tip {{ display: grid; grid-template-columns: 20mm 36mm 1fr; align-items: center; gap: 3mm; font-size: 9pt; padding: 1.6mm 3mm; border: 0.3mm solid #DCE5DE; border-radius: 2mm; }}
.tip b {{ font: 700 13pt "Noto Sans Bengali"; color: #0B6B3F; }}
kbd {{ font: 600 9pt "Noto Sans Mono", monospace; background: #F1F4F2; border-radius: 1mm; padding: 0.6mm 1.4mm; }}
footer {{ margin-top: 4mm; font-size: 8.5pt; color: #7a7f85; text-align: center; }}
</style></head><body>
<header><h1>Bijoy keyboard layout <span>বিজয় কীবোর্ড লেআউট</span></h1><p>Bijoy Bangla for Mac · bijoybanglaformac.com</p></header>
<div class="kb">{"".join(rows)}</div>
<div class="legend"><span><b>Big green letter</b>: the key on its own</span><span><i>Small red letter</i>: with Shift</span><span>◌ marks where a vowel sign joins the letter</span></div>
<div class="tips">{tips}</div>
<footer>Free and open source · Works with বিজয় ইউনিকোড and বিজয় ক্লাসিক · Not affiliated with Ananda Computers</footer>
</body></html>"""

root = pathlib.Path(__file__).resolve().parent.parent
src = root / "Distribution/keyboard-layout.html"
src.write_text(html, encoding="utf-8")
subprocess.run(["weasyprint", str(src), str(root / "docs/Bijoy-Keyboard-Layout.pdf")], check=True)
print("wrote docs/Bijoy-Keyboard-Layout.pdf")
