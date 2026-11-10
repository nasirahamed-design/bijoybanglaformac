<p align="center"><img src="Branding/logo.svg" width="360" alt="Bijoy Bangla for Mac"></p>

# Bijoy Bangla for macOS

**Download:** [bijoybanglaformac.com](https://bijoybanglaformac.com) - free and open source (MIT)

A native macOS input method. Once installed, the input menu in the top bar
lists two entries:

- **বিজয় ইউনিকোড** - type Unicode Bangla with the Bijoy key positions
- **বিজয় ক্লাসিক** - same keys, classic Bijoy (ANSI) output for SutonnyMJ and other MJ fonts, for print and DTP
- **English** - normal English typing

Switch with **Control-Space** (macOS toggles between the last two input
sources) or by clicking the input menu. The same menu has
**Show Bijoy Keyboard Layout…** for an on-screen chart.

Output is standard Unicode (NFC), so it works in browsers, WordPress, Word,
Pages, Facebook and with any Bangla font. Requires macOS 13 or later, Apple
Silicon or Intel.

## How typing works

The current word is shown underlined while you type it and is committed when
you press Space, Return, Tab, punctuation, or click elsewhere. Backspace
edits the word being typed.

| You want | Type | Result |
|---|---|---|
| Kar before the letter (ি ে ৈ) | kar first, then the letter | `d j` = কি, `c j` = কে, `C h` = বৈ |
| ো / ৌ | `c` + letter + `f` / `X` | `c j f` = কো, `c j X` = কৌ |
| Full vowels | `g` then the kar | `gf` আ, `gd` ই, `gD` ঈ, `gs` উ, `gS` ঊ, `ga` ঋ, `gc` এ, `gC` ঐ, `gX` ঔ |
| অ, ও | `F`, `x` | |
| Juktakkhor | `g` between letters | `j g N` = ক্ষ, `n g k` = স্ত, `d j g k` = ক্তি |
| Reph | `A` after the letter | `j m A` = কর্ম |
| র-ফলা / য-ফলা | `z` / `Z` | `r z` = প্র, `j Z` = ক্য, `v Z` = র‍্য |
| Visible hasanta | `g g` | ক্‌ |
| ং ঃ ঁ ৎ ৳ । | `Q` `\|` `&` `\` `$` `G` | |

Keys are read by physical position, so it works whether your English layout
is US, UK or Irish.

### Full layout (key: normal / Shift)

```
q ঙ/ং   w য/য়   e ড/ঢ   r প/ফ   t ট/ঠ   y চ/ছ   u জ/ঝ   i হ/ঞ   o গ/ঘ   p ড়/ঢ়
a ৃ/র্   s ু/ূ    d ি/ী    f া/অ   g ্/।    h ব/ভ   j ক/খ   k ত/থ   l দ/ধ
z ্র/্য  x ও/ৗ   c ে/ৈ    v র/ল   b ন/ণ   n স/ষ   m ম/শ
1-0 ১-০   Shift-4 ৳   Shift-7 ঁ   \ ৎ   Shift-\ ঃ
```

## Build and try it on your Mac

Needs Xcode or the Command Line Tools (`xcode-select --install`).

```bash
./build.sh          # runs the engine tests, then builds build/BijoyBangla.app
./install-dev.sh    # installs into ~/Library/Input Methods and enables it
```

Then choose **বিজয় ইউনিকোড** from the input menu. If it doesn't appear, log
out and back in once (macOS sometimes caches the input source list).

After code changes, run `./build.sh && ./install-dev.sh` again.

## Making the DMG

```bash
./release.sh --backup      # personal backup copy, no Developer ID needed
./release.sh               # public release: signed + notarized
```

Both write `build/BijoyBangla-<version>.dmg` containing
`Install Bijoy Bangla.pkg` and `Activation Guide.pdf`. The public release
needs `DEV_ID_APP`, `DEV_ID_INSTALLER` and a stored notarytool profile; see
the manual for the one-time setup.

The Activation Guide's source is `Distribution/activation-guide.html`.

## Uninstall

Choose **Uninstall Bijoy Bangla…** from the input menu, or run `./uninstall.sh`.

## Project layout

```
Sources/BijoyEngine.swift     key map + Bijoy-to-Unicode conversion (pure, tested)
Sources/ClassicConverter.swift  Unicode to Bijoy ANSI for SutonnyMJ (runs bijoy-classic.js)
Resources/bijoy-classic.js    Unicode to Bijoy ANSI table (MIT, see License)
Sources/InputController.swift InputMethodKit controller, modes, input menu
Sources/InputSources.swift    register / enable / select input sources
Sources/LayoutWindow.swift    on-screen layout chart
Sources/AboutWindow.swift     About window
Sources/Uninstaller.swift     uninstall from the input menu
Sources/main.swift            IMK server, --install / --uninstall
Resources/Info.plist          input method + two-mode definition
Tests/cases.json              engine test words (keys -> expected Unicode)
Scripts/make-icons.swift      draws the menu bar and app icons
Scripts/make-logo.py          generates the logo files in Branding/
Branding/                     logo (SVG + PNG, light and dark), laptop icon, favicon
docs/                         website (GitHub Pages, bijoybanglaformac.com) + JS engine for the demo
Installer/                    pkg scripts, installer screens, distribution.xml
Distribution/                 Activation Guide (HTML source + PDF)
```

To add a test, append `{"keys": "...", "expected": "..."}` to
`Tests/cases.json`; `build.sh` refuses to build if any test fails.

## License

MIT, see [LICENSE](LICENSE).

The Unicode to Bijoy (ANSI) table in `Resources/bijoy-classic.js` comes from
[@abdalgolabs/ansi-unicode-converter](https://www.npmjs.com/package/@abdalgolabs/ansi-unicode-converter)
1.0.5, MIT licence, copyright (c) 2026 abdnahid. Its licence text is kept in
that file. Independent project, not affiliated with Ananda
Computers. Bijoy is a trademark of its owner.
