// bijoy-engine.js - JavaScript copy of Sources/BijoyEngine.swift for the
// website demo. Keep the two in step; Tests/cases.json checks both.
(function (root) {
  const H = 0x09CD, NUKTA = 0x09BC, RA = 0x09B0, YA = 0x09AF;
  const EKAR = 0x09C7, AAKAR = 0x09BE, AUMARK = 0x09D7, OKAR = 0x09CB, AUKAR = 0x09CC;
  const ZWJ = 0x200D, ZWNJ = 0x200C;
  const c = (...v) => ["consonant", v], t = (...v) => ["text", v];
  const pre = v => ["preKar", v], post = v => ["postKar", v];

  const TABLE = {
    "1": t(0x09E7), "2": t(0x09E8), "3": t(0x09E9), "4": t(0x09EA), "5": t(0x09EB),
    "6": t(0x09EC), "7": t(0x09ED), "8": t(0x09EE), "9": t(0x09EF), "0": t(0x09E6),
    "$": t(0x09F3), "&": t(0x0981), "\\": t(0x09CE), "|": t(0x0983),
    q: c(0x0999), Q: t(0x0982), w: c(0x09AF), W: c(0x09AF, 0x09BC),
    e: c(0x09A1), E: c(0x09A2), r: c(0x09AA), R: c(0x09AB),
    t: c(0x099F), T: c(0x09A0), y: c(0x099A), Y: c(0x099B),
    u: c(0x099C), U: c(0x099D), i: c(0x09B9), I: c(0x099E),
    o: c(0x0997), O: c(0x0998), p: c(0x09A1, 0x09BC), P: c(0x09A2, 0x09BC),
    a: post(0x09C3), A: ["reph"], s: post(0x09C1), S: post(0x09C2),
    d: pre(0x09BF), D: post(0x09C0), f: post(0x09BE), F: t(0x0985),
    g: ["hasanta"], G: t(0x0964), h: c(0x09AC), H: c(0x09AD),
    j: c(0x0995), J: c(0x0996), k: c(0x09A4), K: c(0x09A5),
    l: c(0x09A6), L: c(0x09A7),
    z: ["raPhala"], Z: ["yaPhala"], x: t(0x0993), X: post(0x09D7),
    c: pre(0x09C7), C: pre(0x09C8), v: c(0x09B0), V: c(0x09B2),
    b: c(0x09A8), B: c(0x09A3), n: c(0x09B8), N: c(0x09B7),
    m: c(0x09AE), M: c(0x09B6),
  };
  const INDEP = { 0x09BE: 0x0986, 0x09BF: 0x0987, 0x09C0: 0x0988, 0x09C1: 0x0989, 0x09C2: 0x098A,
                  0x09C3: 0x098B, 0x09C7: 0x098F, 0x09C8: 0x0990, 0x09D7: 0x0994 };

  const isCons = v => (v >= 0x0995 && v <= 0x09B9) || v === 0x09DC || v === 0x09DD || v === 0x09DF;
  const isDep = v => (v >= 0x09BE && v <= 0x09CC) || v === 0x09D7 || (v >= 0x0981 && v <= 0x0983);

  function render(keys) {
    const out = [];
    let pending = null, armed = false;
    const last = () => out.length ? out[out.length - 1] : null;
    const flush = () => { if (pending !== null) out.push(pending); pending = null; armed = false; };
    const indep = k => {
      if (last() !== H || !(k in INDEP)) return false;
      out.pop(); flush(); out.push(INDEP[k]); return true;
    };
    const cstart = end => {
      let j = end;
      if (j > 0 && out[j - 1] === NUKTA) j--;
      return j > 0 && isCons(out[j - 1]) ? j - 1 : null;
    };
    for (const ch of keys) {
      const key = TABLE[ch];
      if (!key) { flush(); out.push(ch.codePointAt(0)); continue; }
      const [kind, v] = key;
      if (kind === "preKar") {
        if (indep(v)) continue;
        flush(); pending = v; armed = false;
      } else if (kind === "postKar") {
        if (indep(v)) continue;
        flush();
        if (last() === EKAR && v === AAKAR) out[out.length - 1] = OKAR;
        else if (last() === EKAR && v === AUMARK) out[out.length - 1] = AUKAR;
        else out.push(v);
      } else if (kind === "consonant") {
        if (pending !== null && armed && last() !== H) flush();
        out.push(...v);
        if (pending !== null) armed = true;
      } else if (kind === "hasanta") {
        out.push(last() === H ? ZWNJ : H);
      } else if (kind === "raPhala") {
        out.push(H, RA);
      } else if (kind === "yaPhala") {
        if (last() === RA && !(out.length >= 2 && out[out.length - 2] === H)) out.push(ZWJ);
        out.push(H, YA);
      } else if (kind === "reph") {
        let i = out.length;
        while (i > 0 && isDep(out[i - 1])) i--;
        let start = cstart(i);
        if (start === null) { out.push(RA, H); continue; }
        while (start >= 2 && out[start - 1] === H) {
          const prev = cstart(start - 1);
          if (prev === null) break;
          start = prev;
        }
        out.splice(start, 0, RA, H);
      } else {
        flush(); out.push(...v);
      }
    }
    flush();
    return String.fromCodePoint(...out);
  }

  const SHIFTED = { "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*",
    "9": "(", "0": ")", "-": "_", "=": "+", "[": "{", "]": "}", ";": ":", "'": "\"",
    "\\": "|", ",": "<", ".": ">", "/": "?", "`": "~" };
  const CODES = { Backquote: "`", Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]",
    Backslash: "\\", Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/" };

  /** Physical key (KeyboardEvent.code) + Shift -> US-layout character. */
  function usChar(code, shift) {
    let base = null;
    if (/^Key[A-Z]$/.test(code)) base = code.slice(3).toLowerCase();
    else if (/^Digit\d$/.test(code)) base = code.slice(5);
    else base = CODES[code] || null;
    if (!base) return null;
    if (!shift) return base;
    return /[a-z]/.test(base) ? base.toUpperCase() : (SHIFTED[base] || base);
  }

  const api = { render, usChar, isMapped: ch => ch in TABLE };
  if (typeof module !== "undefined") module.exports = api; else root.Bijoy = api;
})(this);
