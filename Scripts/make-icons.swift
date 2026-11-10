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

// App icon (About panel, Finder, installer): the laptop with the flag on its
// screen, on a light rounded square. Same drawing as Branding/laptop.svg.
func drawLaptop(in s: CGFloat) {
    // Light tile
    let tile = NSRect(x: s * 0.1, y: s * 0.1, width: s * 0.8, height: s * 0.8)
    let tilePath = NSBezierPath(roundedRect: tile, xRadius: s * 0.18, yRadius: s * 0.18)
    NSGradient(colors: [NSColor(red: 0.98, green: 0.99, blue: 0.98, alpha: 1),
                        NSColor(red: 0.90, green: 0.94, blue: 0.91, alpha: 1)])!.draw(in: tilePath, angle: -90)
    NSColor(red: 0.80, green: 0.87, blue: 0.82, alpha: 1).setStroke()
    tilePath.lineWidth = max(1, s / 256)
    tilePath.stroke()

    // Laptop is 400 x 190 units, drawn 0.68 of the icon wide, centred.
    let w = s * 0.68
    let k = w / 400
    let ox = (s - w) / 2
    let oy = (s - 190 * k) / 2
    // SVG y runs down; flip into AppKit coordinates.
    func r(_ x: CGFloat, _ y: CGFloat, _ rw: CGFloat, _ rh: CGFloat) -> NSRect {
        NSRect(x: ox + x * k, y: oy + (190 - y - rh) * k, width: rw * k, height: rh * k)
    }
    NSColor(red: 0.15, green: 0.19, blue: 0.17, alpha: 1).setFill()
    NSBezierPath(roundedRect: r(30, 2, 340, 164), xRadius: 12 * k, yRadius: 12 * k).fill()
    let screen = NSBezierPath(roundedRect: r(40, 12, 320, 144), xRadius: 4 * k, yRadius: 4 * k)
    NSGradient(colors: [NSColor(red: 0.067, green: 0.592, blue: 0.353, alpha: 1),
                        NSColor(red: 0.027, green: 0.322, blue: 0.2, alpha: 1)])!.draw(in: screen, angle: -90)
    NSColor(red: 0.878, green: 0.188, blue: 0.247, alpha: 1).setFill()
    NSBezierPath(ovalIn: r(178 - 44, 84 - 44, 88, 88)).fill()

    // Base
    let base = NSBezierPath()
    func pt(_ x: CGFloat, _ y: CGFloat) -> NSPoint { NSPoint(x: ox + x * k, y: oy + (190 - y) * k) }
    base.move(to: pt(2, 168)); base.line(to: pt(398, 168)); base.line(to: pt(392, 181))
    base.curve(to: pt(380, 187), controlPoint1: pt(390, 185), controlPoint2: pt(386, 187))
    base.line(to: pt(20, 187))
    base.curve(to: pt(8, 181), controlPoint1: pt(14, 187), controlPoint2: pt(10, 185))
    base.close()
    NSGradient(colors: [NSColor(red: 0.83, green: 0.85, blue: 0.84, alpha: 1),
                        NSColor(red: 0.56, green: 0.60, blue: 0.58, alpha: 1)])!.draw(in: base, angle: -90)
    NSColor(red: 0.49, green: 0.53, blue: 0.51, alpha: 1).setFill()
    NSBezierPath(roundedRect: r(168, 168, 64, 6), xRadius: 3 * k, yRadius: 3 * k).fill()
}

let iconset = out.appendingPathComponent("AppIcon.iconset")
try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)
for (pt, scale) in [(16, 1), (16, 2), (32, 1), (32, 2), (128, 1), (128, 2), (256, 1), (256, 2), (512, 1), (512, 2)] {
    let px = pt * scale
    let r = rep(pixels: px) { s in drawLaptop(in: s) }
    let suffix = scale == 2 ? "@2x" : ""
    try r.representation(using: .png, properties: [:])!
        .write(to: iconset.appendingPathComponent("icon_\(pt)x\(pt)\(suffix).png"))
}
print("Icons written to \(out.path)")
