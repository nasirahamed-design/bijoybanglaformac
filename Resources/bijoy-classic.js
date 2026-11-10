/*
 * bijoy-classic.js - Unicode Bangla to Bijoy (ANSI) conversion for
 * SutonnyMJ and other MJ fonts, used by the বিজয় ক্লাসিক input mode.
 *
 * The conversion table and logic are from @abdalgolabs/ansi-unicode-converter
 * 1.0.5 (npm), used under the MIT licence below, wrapped so it runs in
 * macOS's JavaScriptCore with no module system.
 *
 * MIT License Copyright (c) 2026 abdnahid
 *
 * Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice
 * (including the next paragraph) shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var BijoyClassic = (function () {
  var dataExports = {};
  (function (exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctUnicode = exports.correctBijoy = exports.bijoyRoFolaReplacements = exports.bijoyKarReplacements = exports.uni2bijoy_string_conversion_map = exports.bijoy_string_conversion_map = void 0;
exports.bijoy_string_conversion_map = {
    "i¨": "র‌্য",
    "ª¨": "্র্য",
    "°": "ক্ক",
    "±": "ক্ট",
    "³": "ক্ত",
    "K¡": "ক্ব",
    "¯Œ": "স্ক্র",
    "µ": "ক্র",
    "K¬": "ক্ল",
    "¶è": "ক্ষ্ণ",
    "þ": "হ্ম",
    "²": "ক্ষ্ম",
    "ÿè": "ক্ষ্ম",
    "•¶": "ঙ্ক্ষ",
    "•ÿ": "ঙ্ক্ষ",
    "¶": "ক্ষ",
    "ÿ": "ক্ষ",
    "·": "ক্স",
    "´": "ক্ম",
    "¸": "গু",
    "»": "গ্ধ",
    "Mœ": "গ্ন",
    "M¥": "গ্ম",
    "MÖƒ": "গ্রূ",
    "Mø": "গ্ল",
    "M¬": "গ্ল",
    "M­": "গ্ল",
    "Nœ": "ঘ্ন",
    "¼": "ঙ্ক",
    "•L": "ঙ্খ",
    "½": "ঙ্গ",
    "•N": "ঙ্ঘ",
    "•": "ক্স",
    "”P": "চ্চ",
    "”Q¡": "চ্ছ্ব",
    "”Q": "চ্ছ",
    "”T": "চ্ঞ",
    "¾¡": "জ্জ্ব",
    "¾": "জ্জ",
    "À": "জ্ঝ",
    "Á": "জ্ঞ",
    "R¡": "জ্ব",
    "R¦": "জ্ব",
    "Â": "ঞ্চ",
    "Ã": "ঞ্ছ",
    "Ä": "ঞ্জ",
    "Å": "ঞ্ঝ",
    "Æ": "ট্ট",
    "U¡": "ট্ব",
    "U¥": "ট্ম",
    "Ç": "ড্ড",
    "È": "ণ্ট",
    "É": "ণ্ঠ",
    "Ý": "ন্স",
    "Ê": "ণ্ড",
    "Ð": "ণ্ড",
    "š‘": "ন্তু",
    "Y\\^": "ণ্ব",
    "Ë¡": "ত্ত্ব",
    "šÍ¡": "ন্ত্ব",
    "š—¡": "ন্ত্ব",
    "Ë": "ত্ত",
    "Ì": "ত্থ",
    "Z¥": "ত্ম",
    "Í": "ত্ম",
    "Z¡": "ত্ব",
    "Zœ": "ত্ন",
    "Î": "ত্র",
    "_¡": "থ্ব",
    "˜M": "দ্গ",
    "˜N": "দ্ঘ",
    "Ï": "দ্দ",
    "×": "দ্ধ",
    "›Ø": "ন্দ্ব",
    "˜¡": "দ্ব",
    "Ø": "দ্ব",
    "™£": "দ্ভ্র",
    "™¢": "দ্ভ",
    "Ù": "দ্ম",
    "`ªƒ": "দ্রূ",
    "aªƒ": "ধ্রূ",
    "aŸ": "ধ্ব",
    "a¥": "ধ্ম",
    "›U": "ন্ট",
    "Ú": "ন্ঠ",
    "Û": "ন্ড",
    "šÍ": "ন্ত",
    "š—": "ন্ত",
    "š¿": "ন্ত্র",
    "š’": "ন্থ",
    "›`": "ন্দ",
    "Ü": "ন্ধ",
    "Yœ": "ণ্ন",
    "Yè": "ণ্ন",
    "bœ": "ন্ন",
    "š\\^": "ন্ব",
    "b¥": "ন্ম",
    "š§": "ন্ম",
    "Þ": "প্ট",
    "ß": "প্ত",
    "cœ": "প্ন",
    "à": "প্প",
    "c¬": "প্ল",
    "cø": "প্ল",
    "c­": "প্ল",
    "á": "প্স",
    "cÖƒ": "প্রূ",
    "d¬": "ফ্ল",
    "â": "ব্জ",
    "ã": "ব্দ",
    "ä": "ব্ধ",
    "eŸ": "ব্ব",
    "e­": "ব্ল",
    "eø": "ব্ল",
    "eªƒ": "ব্রূ",
    "åƒ": "ভ্রূ",
    "å": "ভ্র",
    "f‚": "ভূ",
    "gœ": "ম্ন",
    "¤œ": "ম্ন",
    "¤ú": "ম্প",
    "¤c": "ম্প",
    "ç": "ম্ফ",
    "¤\\^": "ম্ব",
    "¤¢": "ম্ভ",
    "¤£": "ম্ভ্র",
    "¤§": "ম্ম",
    "¤ø": "ম্ল",
    "gø": "ম্ল",
    "¤¬": "ম্ল",
    "g¬": "ম্ল",
    "¤ª": "ম্র",
    "iƒ": "রূ",
    "é": "ল্ক",
    "ê": "ল্গ",
    "ë": "ল্ট",
    "ì": "ল্ড",
    "í": "ল্প",
    "î": "ল্ফ",
    "j¦": "ল্ব",
    "j¥": "ল্ম",
    "jø": "ল্ল",
    "j­": "ল্ল",
    "kÖƒ": "শ্রূ",
    "kªƒ": "শ্রূ",
    "ï": "শু",
    "ð": "শ্চ",
    "ñ": "শ্ছ",
    "kœ": "শ্ন",
    "k¦": "শ্ব",
    "k\\^": "শ্ব",
    "k¥": "শ্ম",
    "kø": "শ্ল",
    "k¬": "শ্ল",
    "k­": "শ্ল",
    "®‹": "ষ্ক",
    "®Œ": "ষ্ক্র",
    "ó": "ষ্ট",
    "ô": "ষ্ঠ",
    "ò": "ষ্ণ",
    "®ú": "ষ্প",
    "®c": "ষ্প",
    "õ": "ষ্ফ",
    "®§": "ষ্ম",
    "¯‹": "স্ক",
    "¯y‹": "স্কু",
    "÷": "স্ট",
    "ö": "স্খ",
    "¯Í": "স্ত",
    "¯—": "স্ত",
    "¯‘": "স্তু",
    "¯¿": "স্ত্র",
    "¯’": "স্থ",
    "mœ": "স্ন",
    "¯œ": "স্ন",
    "¯ú": "স্প",
    "ù": "স্ফ",
    "¯ª": "স্র",
    "¯\\^": "স্ব",
    "¯§": "স্ম",
    "mªƒ": "স্রূ",
    "¯­": "স্ল",
    "¯ø": "স্ল",
    "mø": "স্ল",
    "û": "হু",
    "nŸ": "হ্ব",
    "nè": "হ্ণ",
    "ý": "হ্ন",
    "n¬": "হ্ল",
    "nƒ": "হৃ",
    "ü": "হৃ",
    "©": "র্",
    Av: "আ",
    A: "অ",
    B: "ই",
    C: "ঈ",
    D: "উ",
    E: "ঊ",
    F: "ঋ",
    G: "এ",
    H: "ঐ",
    I: "ও",
    J: "ঔ",
    K: "ক",
    L: "খ",
    M: "গ",
    N: "ঘ",
    O: "ঙ",
    P: "চ",
    Q: "ছ",
    R: "জ",
    S: "ঝ",
    T: "ঞ",
    U: "ট",
    V: "ঠ",
    W: "ড",
    X: "ঢ",
    Y: "ণ",
    Z: "ত",
    _: "থ",
    "`": "দ",
    a: "ধ",
    b: "ন",
    c: "প",
    d: "ফ",
    e: "ব",
    f: "ভ",
    g: "ম",
    h: "য",
    i: "র",
    j: "ল",
    k: "শ",
    l: "ষ",
    m: "স",
    n: "হ",
    o: "ড়",
    p: "ঢ়",
    q: "য়",
    r: "ৎ",
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
    v: "া",
    w: "ি",
    x: "ী",
    y: "ু",
    z: "ু",
    "–": "ু",
    "“": "ু",
    "æ": "ু",
    "~": "ূ",
    "‚": "ূ",
    "„": "ৃ",
    "‡": "ে",
    "†": "ে",
    "‰": "ৈ",
    "\\ˆ": "ৈ",
    "Š": "ৗ",
    "Ô": "‘",
    "Õ": "’",
    "\\|": "।",
    "Ò": "“",
    "Ó": "”",
    s: "ং",
    t: "ঃ",
    u: "ঁ",
    "ª": "্র",
    "Ö": "্র",
    "«": "্র",
    "¨": "্য",
    "\\&": "্",
    "…": "ৃ",
    "Ñ": "—"
};
exports.uni2bijoy_string_conversion_map = {
    "।": "|",
    "‘": "Ô",
    "’": "Õ",
    "“": "Ò",
    "”": "Ó",
    "্র্য": "ª¨",
    "র‌্য": "i¨",
    "ক্ক": "°",
    "ক্ট": "±",
    "ক্ত": "³",
    "ক্ব": "K¡",
    "স্ক্র": "¯Œ",
    "ক্র": "µ",
    "ক্ল": "K¬",
    "ক্ষ্ন": "¶è",
    "ক্ষ্ণ": "¶è",
    "হ্ম": "þ",
    "ক্ষ্ম": "²",
    "ঙ্ক্ষ": "•¶",
    "ক্ষ": "¶",
    "ক্স": "·",
    "ক্ম": "´",
    "ঙ্গু": "½y",
    "গু": "¸",
    "গ্ধ": "»",
    "গ্ন": "Mœ",
    "গ্ম": "M¥",
    "গ্লু": "Møæ",
    "গ্ল": "Mø",
    "গ্রু": "Mªæ",
    "ঘ্ন": "Nœ",
    "ঙ্ক": "¼",
    "ঙ্খ": "•L",
    "ঙ্গ": "½",
    "ঙ্ঘ": "•N",
    "চ্চ": "”P",
    "চ্ছ": "”Q",
    "চ্ছ্ব": "”Q¡",
    "চ্ঞ": "”T",
    "জ্জ্ব": "¾¡",
    "জ্জ": "¾",
    "জ্ঝ": "À",
    "জ্ঞ": "Á",
    "জ্ব": "R¡",
    "ঞ্চ": "Â",
    "ঞ্ছ": "Ã",
    "ঞ্জ": "Ä",
    "ঞ্ঝ": "Å",
    "ট্ট": "Æ",
    "ট্ব": "U¡",
    "ট্ম": "U¥",
    "ড্ড": "Ç",
    "ণ্ট": "È",
    "ণ্ঠ": "É",
    "ন্স": "Ý",
    "ণ্ড": "Ð",
    "ন্তু": "š‘",
    "ণ্ব": "Y^",
    "ত্ত্ব": "Ë¡",
    "ন্ত্ব": "šÍ¡",
    "ত্ত": "Ë",
    "ত্থ": "Ì",
    "ত্ন": "Zœ",
    "ত্ম": "Z¥",
    "ত্ব": "Z¡",
    "ত্রু": "Îæ",
    "ত্রূ": "Îƒ",
    "থ্ব": "_¡",
    "দ্গ": "˜M",
    "দ্ঘ": "˜N",
    "দ্দ": "Ï",
    "দ্ধ": "×",
    "ন্দ্ব": "›Ø",
    "দ্ব": "Ø",
    "দ্ভ্র": "™£",
    "দ্ভ": "™¢",
    "দ্ম": "Ù",
    "দ্রু": "`ªæ",
    "শ্রু": "kÖæ",
    "প্রু": "cÖæ",
    "প্লু": "cøæ",
    "ধ্ব": "aŸ",
    "ধ্ম": "a¥",
    "ন্ট": "›U",
    "ন্ঠ": "Ú",
    "ন্ড": "Û",
    "ন্ত্র": "š¿",
    "ন্ত": "šÍ",
    "স্ত্র": "¯¿",
    "ত্র": "Î",
    "ন্থ": "š’",
    "ন্দ": "›`",
    "ন্ধ": "Ü",
    "ণ্ণ": "Yœ",
    "ণ্ন": "Yœ",
    "ন্ন": "bœ",
    "ন্ব": "š^",
    "ন্ম": "b¥",
    "প্ট": "Þ",
    "প্ত": "ß",
    "প্ন": "cœ",
    "প্প": "à",
    "প্ল": "cø",
    "প্স": "á",
    "ফ্ল": "d¬",
    "ব্জ": "â",
    "ব্দ": "ã",
    "ব্ধ": "ä",
    "ব্ব": "eŸ",
    "ব্ল": "eø",
    "ভ্র": "å",
    "ম্ন": "gœ",
    "ম্প": "¤ú",
    "ম্ফ": "ç",
    "ম্ব": "¤^",
    "ম্ভ": "¤¢",
    "ম্ভ্র": "¤£",
    "ম্ম": "¤§",
    "ম্ল": "¤ø",
    "ড়ু": "o–",
    "ঢ়ু": "p–",
    "রু": "iæ",
    "রূ": "iƒ",
    "ল্ক": "é",
    "ল্গ": "ê",
    "ল্প": "í",
    "ল্ট": "ë",
    "ল্ড": "ì",
    "ল্ফ": "î",
    "ল্ব": "j¦",
    "ল্ম": "j¥",
    "ল্ল": "jø",
    "শু": "ï",
    "শ্চ": "ð",
    "শ্ছ": "ñ",
    "শ্ন": "kœ",
    "শ্ব": "k¦",
    "শ্ম": "k¥",
    "শ্ল": "kø",
    "ষ্ক": "®‹",
    "ষ্ক্র": "®Œ",
    "ষ্ট": "ó",
    "ষ্ঠ": "ô",
    "ষ্ণ": "ò",
    "ষ্প": "®ú",
    "ষ্ফ": "õ",
    "ষ্ম": "®§",
    "স্ক": "¯‹",
    "স্ট": "÷",
    "স্খ": "ö",
    "স্তু": "¯‘",
    "স্ত": "¯Í",
    "স্থ": "¯’",
    "স্ন": "mœ",
    "স্প": "¯ú",
    "স্ফ": "ù",
    "স্ব": "¯^",
    "স্ম": "¯§",
    "স্ল": "¯ø",
    "হ্ব": "nŸ",
    "হু": "û",
    "হ্ণ": "nè",
    "হ্ন": "ý",
    "হ্ল": "n¬",
    "হৃ": "ü",
    "র্": "©",
    "্র": "ª",
    "্য": "¨",
    "্": "&",
    "আ": "Av",
    "অ": "A",
    "ই": "B",
    "ঈ": "C",
    "উ": "D",
    "ঊ": "E",
    "ঋ": "F",
    "এ": "G",
    "ঐ": "H",
    "ও": "I",
    "ঔ": "J",
    "ক": "K",
    "খ": "L",
    "গ": "M",
    "ঘ": "N",
    "ঙ": "O",
    "চ": "P",
    "ছ": "Q",
    "জ": "R",
    "ঝ": "S",
    "ঞ": "T",
    "ট": "U",
    "ঠ": "V",
    "ড": "W",
    "ঢ": "X",
    "ণ": "Y",
    "ত": "Z",
    "থ": "_",
    "দ": "`",
    "ধ": "a",
    "ন": "b",
    "প": "c",
    "ফ": "d",
    "ব": "e",
    "ভ": "f",
    "ম": "g",
    "য": "h",
    "র": "i",
    "ল": "j",
    "শ": "k",
    "ষ": "l",
    "স": "m",
    "হ": "n",
    "ড়": "o",
    "ঢ়": "p",
    "য়": "q",
    "ৎ": "r",
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
    "া": "v",
    "ি": "w",
    "ী": "x",
    "ু": "y",
    "ূ": "~",
    "…": "...",
    "ৃ": "…",
    "ে": "‡",
    "ৈ": "‰",
    "ৗ": "Š",
    "ং": "s",
    "ঃ": "t",
    "ঁ": "u",
    "—": "Ñ"
};
exports.bijoyKarReplacements = {
    "¨y": "y¨",
    "¨~": "~¨",
    vu: "uv",
    "¨u": "u¨",
    Ky: "Kz",
    "K~": "K‚",
    Py: "Pz",
    "P~": "P‚",
    Qy: "Qz",
    "Q~": "Q‚",
    Sy: "Sz",
    "S~": "S‚",
    Uy: "Uz",
    "U~": "U‚",
    Vy: "Vz",
    "V~": "V‚",
    Wy: "Wz",
    "W~": "W‚",
    Xy: "Xz",
    "X~": "X‚",
    Zy: "Zz",
    "Z~": "Z‚",
    dy: "dz",
    "d~": "d‚",
    fy: "fz",
    "f~": "f‚",
    "¶y": "¶z",
    "¶~": "¶‚",
    "Áy": "Áz",
    "Á~": "Á‚",
    "þy": "þz",
    "þ~": "þ‚",
    "¾y": "¾z",
    "¾~": "¾‚",
    "°y": "°z",
    "°~": "°‚",
    "¼y": "¼z",
    "¼~": "¼‚",
    "Üy": "Üz",
    "Ü~": "Ü‚",
    "×y": "×z",
    "×~": "x‚",
    "äy": "äz",
    "ä~": "ä‚",
    "§…": "§„",
    "¥…": "¥„",
    "c…": "c„",
    "N…": "N„",
    "g…": "g„",
    "e…": "e„",
    "k…": "k„",
    "L…": "L„",
    "M…": "M„",
    "m…": "m„",
    "l…": "l„",
    "R…": "R„",
    "_…": "_„",
    "`…": "`„",
    "a…": "a„",
    "b…": "b„",
    "j…": "j„",
    "h…": "h„",
    "Y…": "Y„",
    "j&¸": "êy",
    "'‡": "'†",
    '"‡': '"†',
    "{‡": "{†",
    "-‡": "-†",
    "'‰": "'ˆ",
    '"‰': '"ˆ',
    "{‰": "{ˆ",
    "-‰": "-ˆ",
    "©y": "©z",
    "©~": "©‚",
    "‹y": "‹z",
    "‹~": "‹‚",
    "÷y": "÷z",
    "÷~": "÷‚",
    "ùy": "ùz",
    "ù~": "ù‚"
};
exports.bijoyRoFolaReplacements = {
    "&iæ": "ªæ",
    "&iƒ": "ªƒ",
    "Mª": "MÖ",
    "cª": "cÖ",
    "dª": "d«",
    "Nªæ": "Nªy",
    "Pªæ": "Pªy",
    "Qªæ": "Qªy",
    "Sªæ": "Sªy",
    "Uªæ": "Uªy",
    "Vªæ": "Vªy",
    "Wªæ": "Wªy",
    "Xªæ": "Xªy",
    "Yªæ": "Yªy",
    "bªæ": "bªy",
    "d«æ": "d«y",
    "hªæ": "hªy",
    "jªæ": "jªy",
    "lªæ": "lªy",
    "nªæ": "nªy",
    "åy": "åæ",
    "Nªƒ": "Nª~",
    "Pªƒ": "Pª~",
    "Qªƒ": "Qª~",
    "Sªƒ": "Sª~",
    "Uªƒ": "Uª~",
    "Vªƒ": "Vª~",
    "Wªƒ": "Wª~",
    "Xªƒ": "Xª~",
    "Yªƒ": "Yª~",
    "bªƒ": "bª~",
    "d«ƒ": "d«~",
    "hªƒ": "hª~",
    "jªƒ": "jª~",
    "lªƒ": "lª~",
    "nªƒ": "nª~",
    "å~": "åƒ",
    "”Q&e": "”Q¡",
    "kª": "kÖ",
    "mª": "mÖ",
    "g&å": "¤£"
};
exports.correctBijoy = { "&ª": "ª" };
exports.correctUnicode = { "šত্ম": "ন্ত", "¯ত্ম": "স্ত" };

  })(dataExports);

  var coreExports = {};
  (function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bijoyToUnicode = bijoyToUnicode;
exports.unicodeToBijoy = unicodeToBijoy;
exports.isUnicode = isUnicode;
exports.convertMixedToUnicode = convertMixedToUnicode;
// src/core.ts
const data_1 = require("./data");
let bijoyPatterns = null;
let uni2bijoyPatterns = null;
// --- Helpers ---
function buildConversionPatterns(map) {
    const patterns = [];
    for (const key in map) {
        if (Object.prototype.hasOwnProperty.call(map, key)) {
            patterns.push({
                regex: new RegExp(key, "g"),
                replacement: map[key],
            });
        }
    }
    return patterns;
}
function ensureBijoyPatterns() {
    if (!bijoyPatterns) {
        bijoyPatterns = buildConversionPatterns(data_1.bijoy_string_conversion_map);
    }
}
function ensureUni2BijoyPatterns() {
    if (!uni2bijoyPatterns) {
        uni2bijoyPatterns = buildConversionPatterns(data_1.uni2bijoy_string_conversion_map);
    }
}
function replaceMultiple(text, map, useRegex) {
    let result = text;
    for (const key in map) {
        if (Object.prototype.hasOwnProperty.call(map, key)) {
            const pattern = useRegex ? new RegExp(key, "g") : key;
            result = result.replace(pattern, map[key]);
        }
    }
    return result;
}
// --- Bangla Character Checkers ---
const IsBanglaHalant = (n) => n === "্";
const IsBanglaPreKar = (n) => ["ি", "ৈ", "ে"].includes(n);
const IsBanglaPostKar = (n) => ["া", "ো", "ৌ", "ৗ", "ু", "ূ", "ী", "ৃ"].includes(n);
const IsBanglaKar = (n) => IsBanglaPreKar(n) || IsBanglaPostKar(n);
const IsBanglaNukta = (n) => ["ং", "ঃ", "ঁ"].includes(n);
const IsBanglaBanjonborno = (n) => /[ক-হড়-য়ংঃঁৎ]/.test(n);
const IsSpace = (n) => [" ", "\t", "\n", "\r"].includes(n);
// --- Core Re-arrangement Logic (The Complex Part) ---
function ReArrangeUnicodeConvertedText(n) {
    // Note: Converted logic exactly from original JS, added type safety
    for (let t = 0; t < n.length; t++) {
        // Logic 1: Moving Pre-Kar before Nukta/Kar
        if (t > 0 &&
            n.charAt(t) === "্" &&
            (IsBanglaKar(n.charAt(t - 1)) || IsBanglaNukta(n.charAt(t - 1))) &&
            t < n.length - 1) {
            let f = n.substring(0, t - 1);
            f += n.charAt(t);
            f += n.charAt(t + 1);
            f += n.charAt(t - 1);
            f += n.substring(t + 2, n.length);
            n = f;
        }
        // Logic 2: Re-ordering Ra + Halant
        if (t > 0 &&
            t < n.length - 1 &&
            n.charAt(t) === "্" &&
            n.charAt(t - 1) === "র" &&
            n.charAt(t - 2) !== "্" &&
            IsBanglaKar(n.charAt(t + 1))) {
            let e = n.substring(0, t - 1);
            e += n.charAt(t + 1);
            e += n.charAt(t - 1);
            e += n.charAt(t);
            e += n.substring(t + 2, n.length);
            n = e;
        }
        // Logic 3: Handling Ref (Reph)
        if (t < n.length - 1 &&
            n.charAt(t) === "র" &&
            IsBanglaHalant(n.charAt(t + 1)) &&
            !IsBanglaHalant(n.charAt(t - 1))) {
            let i = 1;
            while (true) {
                if (t - i < 0)
                    break;
                if (IsBanglaBanjonborno(n.charAt(t - i)) &&
                    IsBanglaHalant(n.charAt(t - i - 1))) {
                    i += 2;
                }
                else if (i === 1 && IsBanglaKar(n.charAt(t - i))) {
                    i++;
                }
                else {
                    break;
                }
            }
            let o = n.substring(0, t - i);
            o += n.charAt(t);
            o += n.charAt(t + 1);
            o += n.substring(t - i, t);
            o += n.substring(t + 2, n.length);
            n = o;
            t += 1;
            continue;
        }
        // Logic 4: Pre-Kar re-arrangement
        if (t < n.length - 1 &&
            IsBanglaPreKar(n.charAt(t)) &&
            !IsSpace(n.charAt(t + 1))) {
            let r = 1;
            while (IsBanglaBanjonborno(n.charAt(t + r))) {
                if (IsBanglaHalant(n.charAt(t + r + 1)))
                    r += 2;
                else
                    break;
            }
            let u = n.substring(0, t);
            u += n.substring(t + 1, t + r + 1);
            let h = 0;
            if (n.charAt(t) === "ে" && n.charAt(t + r + 1) === "া") {
                u += "ো";
                h = 1;
            }
            else if (n.charAt(t) === "ে" && n.charAt(t + r + 1) === "ৗ") {
                u += "ৌ";
                h = 1;
            }
            else {
                u += n.charAt(t);
            }
            u += n.substring(t + r + h + 1, n.length);
            n = u;
            t += r;
        }
        // Logic 5: Chandra Bindu
        if (t < n.length - 1 &&
            n.charAt(t) === "ঁ" &&
            IsBanglaPostKar(n.charAt(t + 1))) {
            let s = n.substring(0, t);
            s += n.charAt(t + 1);
            s += n.charAt(t);
            s += n.substring(t + 2, n.length);
            n = s;
        }
    }
    return n;
}
function ReArrangeUnicodeText(n) {
    let o = 0;
    for (let t = 0; t < n.length; t++) {
        // Logic 1: Moving Pre-Kar
        if (t < n.length && IsBanglaPreKar(n.charAt(t))) {
            let r = 1;
            while (IsBanglaBanjonborno(n.charAt(t - r))) {
                if (t - r < 0 || t - r <= o)
                    break;
                if (IsBanglaHalant(n.charAt(t - r - 1)))
                    r += 2;
                else
                    break;
            }
            let f = n.substring(0, t - r);
            f += n.charAt(t);
            f += n.substring(t - r, t);
            f += n.substring(t + 1, n.length);
            n = f;
            o = t + 1;
            continue;
        }
        // Logic 2: Handling Ref (Reph) reverse
        if (t < n.length - 1 &&
            IsBanglaHalant(n.charAt(t)) &&
            n.charAt(t - 1) === "র") {
            let i = 1;
            let e = 0;
            while (true) {
                if (IsBanglaBanjonborno(n.charAt(t + i)) &&
                    IsBanglaHalant(n.charAt(t + i + 1))) {
                    i += 2;
                }
                else if (IsBanglaBanjonborno(n.charAt(t + i)) &&
                    IsBanglaPreKar(n.charAt(t + i + 1))) {
                    e = 1;
                    break;
                }
                else {
                    break;
                }
            }
            let u = n.substring(0, t - 1);
            u += n.substring(t + i + 1, t + i + e + 1);
            u += n.substring(t + 1, t + i + 1);
            u += n.charAt(t - 1);
            u += n.charAt(t);
            u += n.substring(t + i + e + 1, n.length);
            n = u;
            t += i + e;
            o = t + 1;
            continue;
        }
    }
    return n;
}
function replaceFirstLetter(n, t, i) {
    return n.replace(new RegExp("^" + t, "gm"), i);
}
function replaceLastLetter(n, t, i) {
    return n.replace(new RegExp(t + "$", "gm"), i);
}
// --- Main Exported Functions ---
function bijoyToUnicode(text) {
    if (!text)
        return "";
    if (isUnicode(text)) {
        return text;
    }
    ensureBijoyPatterns();
    let n = text;
    n = replaceMultiple(n, data_1.correctBijoy, true);
    if (bijoyPatterns) {
        for (const pattern of bijoyPatterns) {
            n = n.replace(pattern.regex, pattern.replacement);
        }
    }
    n = replaceMultiple(n, data_1.correctUnicode, true);
    n = ReArrangeUnicodeConvertedText(n);
    return n.replace(/অা/g, "আ");
}
function unicodeToBijoy(text) {
    if (!text)
        return "";
    let n = text;
    n = n
        .replace(/ব়/g, "র")
        .replace(/ড়/g, "ড়")
        .replace(/ঢ়/g, "ঢ়")
        .replace(/য়/g, "য়");
    n = n.replace(/ো/g, "ো").replace(/ৌ/g, "ৌ").replace(/্র্য/g, "্র‍্য");
    n = replaceLastLetter(n, "র্", "i&");
    n = replaceLastLetter(n, "র্‌", "i&");
    n = ReArrangeUnicodeText(n);
    ensureUni2BijoyPatterns();
    if (uni2bijoyPatterns) {
        for (const pattern of uni2bijoyPatterns) {
            n = n.replace(pattern.regex, pattern.replacement);
        }
    }
    n = replaceFirstLetter(n, "‡", "†");
    n = replaceFirstLetter(n, "‰", "ˆ");
    n = n
        .replace(/\(‡/g, "(†")
        .replace(/\[‡/g, "[†")
        .replace(/Ô‡/g, "Ô†")
        .replace(/Ò‡/g, "Ò†");
    n = n
        .replace(/\(‰/g, "(ˆ")
        .replace(/\[‰/g, "[ˆ")
        .replace(/Ô‰/g, "Ôˆ")
        .replace(/Ò‰/g, "Òˆ");
    n = replaceMultiple(n, data_1.bijoyKarReplacements, true);
    n = replaceMultiple(n, data_1.bijoyRoFolaReplacements, true);
    return n;
}
/**
 * Detects if a string contains Unicode Bangla characters.
 * Range: \u0980 to \u09FF
 */
function isUnicode(text) {
    const unicodePattern = /[\u0980-\u09FF]/;
    return unicodePattern.test(text);
}
function convertMixedToUnicode(text) {
    if (!text)
        return "";
    // Split by spaces to evaluate chunks
    const words = text.split(/(\s+)/); // Preserves spaces for perfect reconstruction
    return words.map(word => {
        // 1. Skip if it's just whitespace
        if (word.trim().length === 0)
            return word;
        // 2. Check if the word contains Unicode Bengali characters
        // If it's already Unicode, return it untouched
        if (isUnicode(word)) {
            return word;
        }
        // 3. Check if it contains ASCII/ANSI characters commonly used in Bijoy
        // We only convert if it looks like Bijoy (contains common Bijoy characters)
        // Adjust the regex based on your b2u character map
        const looksLikeBijoy = /[A-Za-z|†|‡|¶|¡]/.test(word);
        if (looksLikeBijoy) {
            return bijoyToUnicode(word);
        }
        // 4. If it's English/Numbers and not Bijoy, return as is
        return word;
    }).join('');
}

  })(coreExports, function () { return dataExports; });

  // Fixes on top of the converter for live typing:
  //  - joiner characters (ZWJ/ZWNJ) mean nothing in MJ fonts
  //  - ৳ is "$" in Bijoy, । is "|"
  function toClassic(text) {
    if (!text) return "";
    var s = coreExports.unicodeToBijoy(text);
    return s.replace(/[\u200C\u200D]/g, "")
            .replace(/৳/g, "$")
            .replace(/।/g, "|");
  }

  return { toClassic: toClassic, toUnicode: coreExports.bijoyToUnicode };
})();
if (typeof module !== "undefined") module.exports = BijoyClassic;
