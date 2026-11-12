#!/usr/bin/env python3
"""Build the Bangla page docs/bn/index.html from docs/index.html.

The English page carries every Bangla string in its `const BN = {...}` table
(used by the language switch). This script writes a real Bangla copy of the
page, so search engines can index Bangla text at https://bijoybanglaformac.com/bn/:

  - every element with data-i18n="key" gets the Bangla text from the table
  - <html lang="bn" data-page="bn">, Bangla title, description and share text
  - canonical and og:url point to /bn/
  - relative links and images get "../" so they still work one folder down

Run it after every change to docs/index.html:   python3 Scripts/make-bn.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "docs/index.html"
OUT = ROOT / "docs/bn/index.html"

HEAD = {
    "title": "বিজয় ফর ম্যাক - ম্যাকের জন্য বিনামূল্যের বিজয় বাংলা কীবোর্ড",
    "description": "বিজয় ফর ম্যাক: পরিচিত বিজয় লেআউটে MacBook, iMac ও Mac mini-তে বাংলা লিখুন। ইউনিকোড বাংলা ও SutonnyMJ, macOS 13 ও পরবর্তী সংস্করণের জন্য বিনামূল্যে।",
    "head1": ["ম্যাকে বিজয় লেআউটে", "বাংলা লিখুন"],
}


def bn_table(html):
    start = html.index("const BN = {")
    end = html.index("\n  };", start)
    body = html[start:end]
    table = {}
    for m in re.finditer(r'(\w+):\s*("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\')', body):
        raw = m.group(2)[1:-1]
        table[m.group(1)] = re.sub(r"\\(.)", r"\1", raw)
    return table


def replace_inner(html, key, value):
    """Replace the contents of every element carrying data-i18n="key"."""
    pos = 0
    needle = f'data-i18n="{key}"'
    while True:
        at = html.find(needle, pos)
        if at < 0:
            return html
        open_start = html.rfind("<", 0, at)
        open_end = html.index(">", at) + 1
        tag = re.match(r"<(\w+)", html[open_start:]).group(1)
        depth, i = 1, open_end
        pattern = re.compile(rf"<(/?){tag}\b[^>]*>")
        while depth:
            m = pattern.search(html, i)
            depth += -1 if m.group(1) else 1
            i = m.end()
        close_start = m.start()
        html = html[:open_end] + value + html[close_start:]
        pos = open_end + len(value)


def relink(html):
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r"(?:[a-z]+:|/|#|\.\./)", url) or url == "":
            return m.group(0)
        return f'{attr}="../{url}"'
    return re.sub(r'\b(src|href|poster)="([^"]*)"', fix, html)


def main():
    html = SRC.read_text(encoding="utf-8")
    bn = bn_table(html)
    cut = html.index('<script src="bijoy-engine.js">')
    page, scripts = html[:cut], html[cut:]

    missing = []
    for key, value in bn.items():
        if f'data-i18n="{key}"' in page:
            page = replace_inner(page, key, value)
        elif key not in ("hintEmpty", "hintSpace"):
            missing.append(key)

    page = page.replace('<html lang="en" data-page="en">', '<html lang="bn" data-page="bn">', 1)
    page = re.sub(r"<title>[^<]*</title>", f"<title>{HEAD['title']}</title>", page, count=1)
    for name in ('name="description"', 'property="og:description"', 'name="twitter:description"'):
        page = re.sub(rf'(<meta {name} content=")[^"]*(">)', rf"\g<1>{HEAD['description']}\g<2>", page, count=1)
    for name in ('property="og:title"', 'name="twitter:title"'):
        page = re.sub(rf'(<meta {name} content=")[^"]*(">)', rf"\g<1>{HEAD['title']}\g<2>", page, count=1)
    page = page.replace('<link rel="canonical" href="https://bijoybanglaformac.com/">',
                        '<link rel="canonical" href="https://bijoybanglaformac.com/bn/">', 1)
    page = page.replace('<meta property="og:url" content="https://bijoybanglaformac.com/">',
                        '<meta property="og:url" content="https://bijoybanglaformac.com/bn/">', 1)
    page = page.replace('<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="bn_BD">',
                        '<meta property="og:locale" content="bn_BD">\n<meta property="og:locale:alternate" content="en_GB">', 1)
    # Headline and trust line as plain Bangla text for readers without JavaScript
    l1, l2 = HEAD["head1"]
    page = re.sub(r'(<h1 class="tw" id="twHead" aria-label=")[^"]*("><span class="tw-ghost" aria-hidden="true">).*?(</span>)',
                  lambda m: m.group(1) + f"{l1} {l2}" + m.group(2) + f"{l1}<br>{l2}" + m.group(3), page, count=1, flags=re.S)
    trust = re.search(r"trust: '([^']*)'\n    }\n  };", scripts) or re.search(r"bn: \{\s*head: \[[^\]]*\],\s*trust: '([^']*)'", scripts)
    if trust:
        t = trust.group(1)
        page = re.sub(r'(<span class="tw" id="twTrust" aria-label=")[^"]*("><span class="tw-ghost" aria-hidden="true">)[^<]*(</span>)',
                      lambda m: m.group(1) + t + m.group(2) + t + m.group(3), page, count=1)

    out = relink(page) + relink_scripts(scripts)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(out, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(bn)} Bangla strings)")
    if missing:
        print("not on the page (fine if intended):", ", ".join(missing), file=sys.stderr)


def relink_scripts(scripts):
    # Only the <script src="..."> tags need "../"; code inside the scripts uses absolute paths
    return re.sub(r'<script src="(?![a-z]+:|/)([^"]+)"', r'<script src="../\1"', scripts)


if __name__ == "__main__":
    main()
