// LayoutWindow.swift
// On-screen Bijoy layout chart (full Mac keyboard), opened from the input menu.

import Cocoa
import SwiftUI

enum Brand {
    static let green      = Color(red: 0.07, green: 0.45, blue: 0.24)
    static let greenDeep  = Color(red: 0.02, green: 0.36, blue: 0.22)
    static let greenSoft  = Color(red: 0.87, green: 0.95, blue: 0.89)
    static let greenLine  = Color(red: 0.70, green: 0.88, blue: 0.75)
    static let red        = Color(red: 0.86, green: 0.12, blue: 0.20)
    static let ink        = Color(red: 0.10, green: 0.11, blue: 0.12)
    static let muted      = Color(red: 0.42, green: 0.44, blue: 0.47)
    static let keyboardBG = Color(red: 0.90, green: 0.91, blue: 0.92)
}

final class LayoutWindow {
    static let shared = LayoutWindow()
    private var window: NSWindow?

    func show() {
        if window == nil {
            let host = NSHostingView(rootView: LayoutChart())
            let w = NSWindow(contentRect: NSRect(origin: .zero, size: host.fittingSize),
                             styleMask: [.titled, .closable, .miniaturizable],
                             backing: .buffered, defer: false)
            w.title = "Bijoy Keyboard Layout"
            w.appearance = NSAppearance(named: .aqua)
            w.backgroundColor = .white
            w.isReleasedWhenClosed = false
            w.level = .floating
            w.contentView = host
            w.setContentSize(host.fittingSize)
            w.center()
            window = w
        }
        NSApp.activate(ignoringOtherApps: true)
        window?.makeKeyAndOrderFront(nil)
    }
}

// MARK: - Keyboard model

private let unit: CGFloat = 58      // width of a normal key
private let gap: CGFloat = 7
private let keyHeight: CGFloat = 58
private let fnHeight: CGFloat = 38
private let rowWidth: CGFloat = unit * 14.5 + gap * 13

private enum Key: Hashable {
    case char(Character)
    case label(String, width: CGFloat?, trailing: Bool)   // nil width = fill the rest of the row
    case fn(symbol: String?, text: String, width: CGFloat?)
    case space
    case arrows
}

private func chars(_ s: String) -> [Key] { s.map { Key.char($0) } }

private let fnSymbols: [(String, String)] = [
    ("sun.min", "F1"), ("sun.max", "F2"), ("rectangle.3.group", "F3"), ("square.grid.3x2", "F4"),
    ("magnifyingglass", "F5"), ("mic", "F6"), ("moon", "F7"), ("backward", "F8"),
    ("playpause", "F9"), ("forward", "F10"), ("speaker.wave.1", "F11"), ("speaker.wave.3", "F12"),
]

private let fnRow: [Key] = {
    var row: [Key] = [.fn(symbol: nil, text: "esc", width: 1.5)]
    for (symbol, text) in fnSymbols { row.append(.fn(symbol: symbol, text: text, width: 1)) }
    row.append(.fn(symbol: "eject", text: "", width: nil))
    return row
}()

private let numberRow: [Key] = chars("`1234567890-=") + [.label("delete", width: nil, trailing: true)]
private let topRow: [Key] = [.label("tab", width: 1.5, trailing: false)] + chars("qwertyuiop[]\\")
private let homeRow: [Key] = [.label("caps lock", width: 1.75, trailing: false)] + chars("asdfghjkl;'")
    + [.label("return", width: nil, trailing: true)]
private let bottomRow: [Key] = [.label("shift", width: 2.25, trailing: false)] + chars("zxcvbnm,./")
    + [.label("shift", width: nil, trailing: true)]
private let modifierRow: [Key] = [
    .fn(symbol: nil, text: "control", width: 1.2), .fn(symbol: "option", text: "option", width: 1.2),
    .fn(symbol: "command", text: "command", width: 1.45), .space,
    .fn(symbol: "command", text: "command", width: 1.45), .fn(symbol: "option", text: "option", width: 1.2),
    .arrows,
]
private let rows: [[Key]] = [fnRow, numberRow, topRow, homeRow, bottomRow, modifierRow]

// MARK: - Views

private struct KeyFace<Content: View>: View {
    let width: CGFloat?
    let height: CGFloat
    @ViewBuilder let content: Content

    var body: some View {
        content
            .padding(.horizontal, 7)
            .padding(.vertical, 5)
            .frame(width: width, height: height)
            .frame(maxWidth: width == nil ? .infinity : nil)
            .background(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.white)
                    .shadow(color: .black.opacity(0.18), radius: 0.5, y: 1)
            )
    }
}

private struct CharKey: View {
    let key: Character

    var body: some View {
        let shifted = KeyCodes.shiftedCharacter(key)
        let low = BijoyLayout.label(for: key)
        let high = BijoyLayout.label(for: shifted)
        let usTop = key.isLetter ? String(key).uppercased() : String(key)

        KeyFace(width: unit, height: keyHeight) {
            VStack(spacing: 0) {
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    if !high.isEmpty {
                        Text("⇧").font(.system(size: 10)).foregroundColor(Brand.muted)
                        Text(high).font(.system(size: 14)).foregroundColor(Brand.ink)
                    } else if !key.isLetter && shifted != key {
                        Text(String(shifted)).font(.system(size: 14)).foregroundColor(Brand.ink)
                    }
                    Spacer(minLength: 0)
                    if !low.isEmpty || key.isLetter || key.isNumber {
                        Text(usTop).font(.system(size: 12)).foregroundColor(Brand.muted)
                    }
                }
                Spacer(minLength: 0)
                if low.isEmpty {
                    Text(key.isNumber || key.isLetter ? "" : String(key))
                        .font(.system(size: 15)).foregroundColor(Brand.muted)
                } else {
                    Text(low).font(.system(size: 22, weight: .bold)).foregroundColor(Brand.ink)
                }
            }
        }
    }
}

private struct KeyView: View {
    let key: Key

    var body: some View {
        switch key {
        case .char(let c):
            CharKey(key: c)
        case .label(let text, let width, let trailing):
            KeyFace(width: width.map { $0 * unit }, height: keyHeight) {
                VStack {
                    Spacer()
                    HStack {
                        if trailing { Spacer() }
                        Text(text).font(.system(size: 13)).foregroundColor(Brand.ink)
                        if !trailing { Spacer() }
                    }
                }
            }
        case .fn(let symbol, let text, let width):
            KeyFace(width: width.map { $0 * unit }, height: fnHeight) {
                VStack(spacing: 2) {
                    if let symbol { Image(systemName: symbol).font(.system(size: 12)) }
                    if !text.isEmpty { Text(text).font(.system(size: symbol == nil ? 13 : 9)) }
                }
                .foregroundColor(Brand.ink)
                .frame(maxWidth: .infinity)
            }
        case .space:
            KeyFace(width: nil, height: keyHeight) { Color.clear }
        case .arrows:
            HStack(alignment: .bottom, spacing: 4) {
                arrow("arrowtriangle.left.fill")
                VStack(spacing: 3) {
                    arrow("arrowtriangle.up.fill")
                    arrow("arrowtriangle.down.fill")
                }
                arrow("arrowtriangle.right.fill")
            }
        }
    }

    private func arrow(_ name: String) -> some View {
        KeyFace(width: unit * 0.95, height: (keyHeight - 3) / 2) {
            Image(systemName: name).font(.system(size: 9)).foregroundColor(Brand.ink)
        }
    }
}

private struct Pill: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(Brand.green)
            .padding(.horizontal, 14).padding(.vertical, 6)
            .background(Capsule().fill(Brand.greenSoft))
    }
}

private struct LayoutChart: View {
    private struct Tip: Identifiable {
        let id = UUID()
        let label: Text
        let detail: String
    }

    private let tips: [Tip] = [
        Tip(label: Text("আ ই ঈ উ ঊ ঋ এ ঐ ঔ"), detail: "g then the kar:  gf, gd, gD, gs, gS, ga, gc, gC, gX"),
        Tip(label: Text("অ  ও"), detail: "Shift-F,  x"),
        Tip(label: Text("◌ি ◌ে ◌ৈ ") + Text("before the letter").foregroundColor(Brand.red),
            detail: "type the kar first:  d j = কি,   c j = কে"),
        Tip(label: Text("◌ো ◌ৌ"), detail: "c j f = কো,   c j X = কৌ"),
        Tip(label: Text("যুক্তাক্ষর"), detail: "g joins letters:  j g N = ক্ষ,   n g k = স্ত"),
        Tip(label: Text("রেফ, র-ফলা, য-ফলা"), detail: "m A = র্ম,   r z = প্র,   j Z = ক্য"),
        Tip(label: Text("Visible hasanta"), detail: "g g = ক্‌"),
        Tip(label: Text("বিজয় ক্লাসিক"), detail: "For SutonnyMJ and other MJ fonts: choose it in the input menu"),
        Tip(label: Text("Switch language"), detail: "Control-Space, or the input menu in the top bar"),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                Pill(text: "⇧ Shift output")
                Pill(text: "Unshifted output")
            }
            .padding(.leading, 24)

            VStack(spacing: gap) {
                ForEach(rows.indices, id: \.self) { r in
                    HStack(spacing: gap) {
                        ForEach(rows[r].indices, id: \.self) { i in KeyView(key: rows[r][i]) }
                    }
                    .frame(width: rowWidth)
                }
            }
            .padding(14)
            .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Brand.keyboardBG))

            Rectangle().fill(Brand.green).frame(height: 1.5)

            VStack(spacing: 0) {
                ForEach(tips) { tip in
                    HStack(spacing: 0) {
                        tip.label
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(Brand.green)
                            .lineLimit(1)
                            .padding(.horizontal, 12)
                            .frame(width: 300, height: 28, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 6).fill(Brand.greenSoft))
                        Text(tip.detail)
                            .font(.system(size: 14))
                            .foregroundColor(Brand.ink)
                            .padding(.leading, 40)
                        Spacer(minLength: 0)
                    }
                    .padding(.vertical, 3)
                    .overlay(alignment: .bottom) {
                        Rectangle().fill(Color.black.opacity(0.07)).frame(height: 1).padding(.leading, 300)
                    }
                }
            }
        }
        .padding(22)
        .frame(width: rowWidth + 28 + 44)
        .background(Color.white)
        .environment(\.colorScheme, .light)
    }
}
