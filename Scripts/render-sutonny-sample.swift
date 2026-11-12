// Renders the Bijoy Classic sample line in SutonnyMJ to a picture for the website,
// for phones and computers that do not have the font. Run on a Mac that has
// SutonnyMJ installed, from the project folder:
//
//     swift Scripts/render-sutonny-sample.swift
//
// Writes docs/img/classic-sutonnymj.png (transparent, 3x for sharp screens).
import AppKit

let text = "Avgvi \u{2021}mvbvi evsjv"       // classic Bijoy text for আমার সোনার বাংলা
let size: CGFloat = 30, scale: CGFloat = 3

func sutonny() -> NSFont? {
    if let f = NSFont(name: "SutonnyMJ", size: size) { return f }
    for family in ["SutonnyMJ", "SutonnyOMJ"] {
        if let member = NSFontManager.shared.availableMembers(ofFontFamily: family)?.first,
           let name = member.first as? String, let f = NSFont(name: name, size: size) { return f }
    }
    return nil
}

guard let font = sutonny() else {
    print("SutonnyMJ is not installed on this Mac."); exit(1)
}
let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor(red: 0.08, green: 0.13, blue: 0.10, alpha: 1)]
let str = NSAttributedString(string: text, attributes: attrs)
let bounds = str.boundingRect(with: NSSize(width: 2000, height: 400), options: [.usesLineFragmentOrigin, .usesFontLeading])
let w = ceil(bounds.width) + 4, h = ceil(bounds.height) + 4

guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(w * scale), pixelsHigh: Int(h * scale),
                                 bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                                 colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { exit(1) }
rep.size = NSSize(width: w, height: h)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
str.draw(with: NSRect(x: 2, y: 2, width: w, height: h), options: [.usesLineFragmentOrigin, .usesFontLeading])
NSGraphicsContext.restoreGraphicsState()

let out = URL(fileURLWithPath: "docs/img/classic-sutonnymj.png")
try! rep.representation(using: .png, properties: [:])!.write(to: out)
print("Wrote \(out.path) (\(Int(w)) x \(Int(h)) points, font: \(font.fontName))")
