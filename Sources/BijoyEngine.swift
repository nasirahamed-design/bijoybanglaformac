// BijoyEngine.swift
// Pure Bijoy keystroke -> Unicode Bangla conversion. No AppKit, so it can be
// unit-tested with a plain `swiftc` build (see Tests/main.swift).
//
// The engine is stateless from the outside: give it the list of keys typed for
// the current word (as US-layout characters) and it returns the Unicode text.
// Backspace is simply "drop the last key and render again".

import Foundation

public enum BijoyKey {
    case consonant([Unicode.Scalar])  // ক খ ... including ড় ঢ় য় (decomposed)
    case preKar(Unicode.Scalar)       // ি ে ৈ - typed BEFORE the consonant in Bijoy
    case postKar(Unicode.Scalar)      // া ী ু ূ ৃ ৗ
    case text([Unicode.Scalar])       // vowels, signs, digits, punctuation
    case hasanta                      // g  (্, juktakkhor link)
    case raPhala                      // z  (্র)
    case yaPhala                      // Z  (্য)
    case reph                         // A  (র্ placed before the last consonant cluster)
}

public enum U {
    static func s(_ v: UInt32) -> Unicode.Scalar { Unicode.Scalar(v)! }
    public static let hasanta = s(0x09CD)
    public static let nukta   = s(0x09BC)
    public static let ra      = s(0x09B0)
    public static let ya      = s(0x09AF)
    public static let eKar    = s(0x09C7)
    public static let aaKar   = s(0x09BE)
    public static let auMark  = s(0x09D7)
    public static let oKar    = s(0x09CB)
    public static let auKar   = s(0x09CC)
    public static let zwj     = s(0x200D)
    public static let zwnj    = s(0x200C)
}

public enum BijoyLayout {
    private static func c(_ v: UInt32...) -> BijoyKey { .consonant(v.map(U.s)) }
    private static func t(_ v: UInt32...) -> BijoyKey { .text(v.map(U.s)) }
    private static func pre(_ v: UInt32) -> BijoyKey { .preKar(U.s(v)) }
    private static func post(_ v: UInt32) -> BijoyKey { .postKar(U.s(v)) }

    /// Bijoy key positions, keyed by the character the same physical key
    /// produces on a US keyboard.
    public static let table: [Character: BijoyKey] = [
        // Number row
        "1": t(0x09E7), "2": t(0x09E8), "3": t(0x09E9), "4": t(0x09EA), "5": t(0x09EB),
        "6": t(0x09EC), "7": t(0x09ED), "8": t(0x09EE), "9": t(0x09EF), "0": t(0x09E6),
        "$": t(0x09F3),          // ৳
        "&": t(0x0981),          // ঁ
        "\\": t(0x09CE),         // ৎ
        "|": t(0x0983),          // ঃ

        // Top row
        "q": c(0x0999), "Q": t(0x0982),            // ঙ  ং
        "w": c(0x09AF), "W": c(0x09AF, 0x09BC),    // য  য়
        "e": c(0x09A1), "E": c(0x09A2),            // ড  ঢ
        "r": c(0x09AA), "R": c(0x09AB),            // প  ফ
        "t": c(0x099F), "T": c(0x09A0),            // ট  ঠ
        "y": c(0x099A), "Y": c(0x099B),            // চ  ছ
        "u": c(0x099C), "U": c(0x099D),            // জ  ঝ
        "i": c(0x09B9), "I": c(0x099E),            // হ  ঞ
        "o": c(0x0997), "O": c(0x0998),            // গ  ঘ
        "p": c(0x09A1, 0x09BC), "P": c(0x09A2, 0x09BC), // ড়  ঢ়

        // Home row
        "a": post(0x09C3), "A": .reph,             // ৃ  র্
        "s": post(0x09C1), "S": post(0x09C2),      // ু  ূ
        "d": pre(0x09BF),  "D": post(0x09C0),      // ি  ী
        "f": post(0x09BE), "F": t(0x0985),         // া  অ
        "g": .hasanta,     "G": t(0x0964),         // ্  ।
        "h": c(0x09AC), "H": c(0x09AD),            // ব  ভ
        "j": c(0x0995), "J": c(0x0996),            // ক  খ
        "k": c(0x09A4), "K": c(0x09A5),            // ত  থ
        "l": c(0x09A6), "L": c(0x09A7),            // দ  ধ

        // Bottom row
        "z": .raPhala,     "Z": .yaPhala,          // ্র  ্য
        "x": t(0x0993),    "X": post(0x09D7),      // ও  ৗ
        "c": pre(0x09C7),  "C": pre(0x09C8),       // ে  ৈ
        "v": c(0x09B0), "V": c(0x09B2),            // র  ল
        "b": c(0x09A8), "B": c(0x09A3),            // ন  ণ
        "n": c(0x09B8), "N": c(0x09B7),            // স  ষ
        "m": c(0x09AE), "M": c(0x09B6),            // ম  শ
    ]

    /// Kar typed straight after a lone hasanta (g) becomes the full vowel:
    /// g f = আ, g d = ই, g c = এ ...
    static let independent: [Unicode.Scalar: Unicode.Scalar] = [
        U.s(0x09BE): U.s(0x0986), // আ
        U.s(0x09BF): U.s(0x0987), // ই
        U.s(0x09C0): U.s(0x0988), // ঈ
        U.s(0x09C1): U.s(0x0989), // উ
        U.s(0x09C2): U.s(0x098A), // ঊ
        U.s(0x09C3): U.s(0x098B), // ঋ
        U.s(0x09C7): U.s(0x098F), // এ
        U.s(0x09C8): U.s(0x0990), // ঐ
        U.s(0x09D7): U.s(0x0994), // ঔ
    ]

    public static func isMapped(_ c: Character) -> Bool { table[c] != nil }

    /// Text shown on the on-screen layout chart for a key.
    public static func label(for c: Character) -> String {
        guard let key = table[c] else { return "" }
        let dotted = "\u{25CC}"
        func str(_ v: [Unicode.Scalar]) -> String { var s = ""; s.unicodeScalars.append(contentsOf: v); return s }
        switch key {
        case .consonant(let v), .text(let v):
            let s = str(v)
            if let f = v.first, isDependentSign(f) { return dotted + s }
            return s
        case .preKar(let k), .postKar(let k): return dotted + str([k])
        case .hasanta: return dotted + "\u{09CD}"
        case .raPhala: return dotted + "\u{09CD}\u{09B0}"
        case .yaPhala: return dotted + "\u{09CD}\u{09AF}"
        case .reph:    return "\u{09B0}\u{09CD}"
        }
    }
}

func isConsonant(_ s: Unicode.Scalar) -> Bool {
    let v = s.value
    return (0x0995...0x09B9).contains(v) || v == 0x09DC || v == 0x09DD || v == 0x09DF
}

func isDependentSign(_ s: Unicode.Scalar) -> Bool {
    let v = s.value
    return (0x09BE...0x09CC).contains(v) || v == 0x09D7 || (0x0981...0x0983).contains(v)
}

public enum BijoyEngine {
    public static func render(_ keys: [Character]) -> String {
        var st = State()
        for k in keys { st.feed(k) }
        return st.finish()
    }

    struct State {
        var out: [Unicode.Scalar] = []
        var pending: Unicode.Scalar? = nil   // pre-base kar waiting for its consonant
        var armed = false                    // pending kar has a consonant to sit after

        mutating func flush() {
            if let p = pending { out.append(p) }
            pending = nil
            armed = false
        }

        /// `g` followed by a kar is a full vowel (g d = ই), even straight after
        /// a consonant: ইমেইল = gd c m gd V, কই = j g d. A kar can never
        /// follow a real hasanta, so the g was not a juktakkhor link.
        mutating func independentVowel(for kar: Unicode.Scalar) -> Bool {
            guard out.last == U.hasanta, let v = BijoyLayout.independent[kar] else { return false }
            out.removeLast()
            flush()              // the pending ি/ে/ৈ belongs to the letter before the g
            out.append(v)
            return true
        }

        mutating func feed(_ ch: Character) {
            guard let key = BijoyLayout.table[ch] else {
                flush()
                out.append(contentsOf: ch.unicodeScalars)
                return
            }
            switch key {
            case .preKar(let k):
                if independentVowel(for: k) { return }
                flush()
                pending = k
                armed = false

            case .postKar(let k):
                if independentVowel(for: k) { return }
                flush()
                if out.last == U.eKar && k == U.aaKar {
                    out[out.count - 1] = U.oKar          // ে + া = ো
                } else if out.last == U.eKar && k == U.auMark {
                    out[out.count - 1] = U.auKar         // ে + ৗ = ৌ
                } else {
                    out.append(k)
                }

            case .consonant(let cs):
                // A pending kar waits until the whole conjunct is typed
                // (d j g k = ক্তি), so only flush when this consonant starts
                // a new cluster.
                if pending != nil && armed && out.last != U.hasanta { flush() }
                out.append(contentsOf: cs)
                if pending != nil { armed = true }

            case .hasanta:
                // g g gives a visible hasanta (্ + ZWNJ)
                if out.last == U.hasanta { out.append(U.zwnj) } else { out.append(U.hasanta) }

            case .raPhala:
                out.append(U.hasanta)
                out.append(U.ra)

            case .yaPhala:
                // র + ্য needs ZWJ so it shows as ya-phala, not reph
                if out.last == U.ra && !(out.count >= 2 && out[out.count - 2] == U.hasanta) {
                    out.append(U.zwj)
                }
                out.append(U.hasanta)
                out.append(U.ya)

            case .reph:
                insertReph()

            case .text(let v):
                flush()
                out.append(contentsOf: v)
            }
        }

        /// Start index of the consonant (with optional nukta) that ends at `end`.
        func consonantStart(endingAt end: Int) -> Int? {
            var j = end
            if j > 0 && out[j - 1] == U.nukta { j -= 1 }
            guard j > 0, isConsonant(out[j - 1]) else { return nil }
            return j - 1
        }

        mutating func insertReph() {
            var i = out.count
            while i > 0 && isDependentSign(out[i - 1]) { i -= 1 }
            guard var start = consonantStart(endingAt: i) else {
                out.append(U.ra)
                out.append(U.hasanta)
                return
            }
            while start >= 2 && out[start - 1] == U.hasanta,
                  let prev = consonantStart(endingAt: start - 1) {
                start = prev
            }
            out.insert(contentsOf: [U.ra, U.hasanta], at: start)
        }

        mutating func finish() -> String {
            flush()
            var s = ""
            s.unicodeScalars.append(contentsOf: out)
            return s
        }
    }
}

/// Maps a macOS virtual key code (physical key position) to the character it
/// produces on a US keyboard, so Bijoy works whatever the user's English
/// layout is (UK, Irish, US...).
public enum KeyCodes {
    private static let normal: [UInt16: Character] = [
        0: "a", 1: "s", 2: "d", 3: "f", 4: "h", 5: "g", 6: "z", 7: "x", 8: "c", 9: "v",
        11: "b", 12: "q", 13: "w", 14: "e", 15: "r", 16: "y", 17: "t",
        18: "1", 19: "2", 20: "3", 21: "4", 22: "6", 23: "5", 24: "=", 25: "9", 26: "7",
        27: "-", 28: "8", 29: "0", 30: "]", 31: "o", 32: "u", 33: "[", 34: "i", 35: "p",
        37: "l", 38: "j", 39: "'", 40: "k", 41: ";", 42: "\\", 43: ",", 44: "/",
        45: "n", 46: "m", 47: ".", 50: "`",
    ]
    private static let shifted: [Character: Character] = [
        "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*",
        "9": "(", "0": ")", "-": "_", "=": "+", "[": "{", "]": "}", ";": ":", "'": "\"",
        "\\": "|", ",": "<", ".": ">", "/": "?", "`": "~",
    ]

    public static func usCharacter(keyCode: UInt16, shift: Bool) -> Character? {
        guard let base = normal[keyCode] else { return nil }
        guard shift else { return base }
        if base.isLetter { return Character(base.uppercased()) }
        return shifted[base] ?? base
    }

    /// Keyboard rows for the on-screen chart.
    public static let rows: [[Character]] = [
        ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
        ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    ]

    public static func shiftedCharacter(_ c: Character) -> Character {
        if c.isLetter { return Character(c.uppercased()) }
        return shifted[c] ?? c
    }
}
