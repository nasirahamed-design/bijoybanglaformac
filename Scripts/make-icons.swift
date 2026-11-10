// make-icons.swift - run by build.sh on the Mac:
//   swift Scripts/make-icons.swift <output-dir>
// Draws the top-bar icons (template images) and the app icon set.

import Cocoa

let out = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "build/icons")
try FileManager.default.createDirectory(at: out, withIntermediateDirectories: true)

func banglaFont(_ size: CGFloat, bold: Bool) -> NSFont {
    let names = bold ? ["KohinoorBangla-Semibold", "BanglaSangamMN-Bold"] : ["KohinoorBangla-Regular", "BanglaSangamMN"]
    for n in names { if let f = NSFont(name: n, size: size) { return f } }
    return NSFont.systemFont(ofSize: size, weight: bold ? .semibold : .regular)
}

func rep(pixels: Int, draw: (CGFloat) -> Void) -> NSBitmapImageRep {
    let r = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
                             bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                             colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: r)
    draw(CGFloat(pixels))
    NSGraphicsContext.restoreGraphicsState()
    return r
}

func centered(_ text: String, font: NSFont, color: NSColor, in size: CGFloat, yNudge: CGFloat = 0) {
    let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: color]
    let s = NSAttributedString(string: text, attributes: attrs)
    let b = s.size()
    s.draw(at: NSPoint(x: (size - b.width) / 2, y: (size - b.height) / 2 + yNudge * size))
}

/// Template menu icon: black glyph inside a rounded outline, 16pt @1x and @2x.
func menuIcon(_ text: String, bangla: Bool, name: String) throws {
    let image = NSImage(size: NSSize(width: 16, height: 16))
    for px in [16, 32] {
        let r = rep(pixels: px) { s in
            let inset = s * 0.06
            let box = NSBezierPath(roundedRect: NSRect(x: inset, y: inset, width: s - 2 * inset, height: s - 2 * inset),
                                   xRadius: s * 0.2, yRadius: s * 0.2)
            NSColor.black.setStroke()
            box.lineWidth = s / 16
            box.stroke()
            let font = bangla ? banglaFont(s * 0.62, bold: true) : NSFont.systemFont(ofSize: s * 0.5, weight: .bold)
            centered(text, font: font, color: .black, in: s, yNudge: bangla ? 0.02 : 0)
        }
        r.size = NSSize(width: 16, height: 16)
        image.addRepresentation(r)
    }
    guard let tiff = image.tiffRepresentation(using: .lzw, factor: 0) else { fatalError("tiff") }
    try tiff.write(to: out.appendingPathComponent(name))
}

try menuIcon("বা", bangla: true, name: "Bangla.tiff")
try menuIcon("EN", bangla: false, name: "English.tiff")

// App icon (About panel, Finder)
let iconset = out.appendingPathComponent("AppIcon.iconset")
try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)
for (pt, scale) in [(16, 1), (16, 2), (32, 1), (32, 2), (128, 1), (128, 2), (256, 1), (256, 2), (512, 1), (512, 2)] {
    let px = pt * scale
    let r = rep(pixels: px) { s in
        let rect = NSRect(x: s * 0.1, y: s * 0.1, width: s * 0.8, height: s * 0.8)
        let path = NSBezierPath(roundedRect: rect, xRadius: s * 0.18, yRadius: s * 0.18)
        NSGradient(colors: [NSColor(red: 0.0, green: 0.42, blue: 0.31, alpha: 1),
                            NSColor(red: 0.0, green: 0.30, blue: 0.22, alpha: 1)])!.draw(in: path, angle: -90)
        NSColor(red: 0.86, green: 0.12, blue: 0.20, alpha: 1).setFill()
        NSBezierPath(ovalIn: NSRect(x: s * 0.62, y: s * 0.62, width: s * 0.16, height: s * 0.16)).fill()
        centered("অ", font: banglaFont(s * 0.46, bold: true), color: .white, in: s, yNudge: -0.02)
    }
    let suffix = scale == 2 ? "@2x" : ""
    try r.representation(using: .png, properties: [:])!
        .write(to: iconset.appendingPathComponent("icon_\(pt)x\(pt)\(suffix).png"))
}
print("Icons written to \(out.path)")
