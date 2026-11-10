// AboutWindow.swift
// Branded About window, opened from the input menu.

import Cocoa
import SwiftUI

final class AboutWindow {
    static let shared = AboutWindow()
    private var window: NSWindow?

    func show() {
        if window == nil {
            let host = NSHostingView(rootView: AboutView())
            let w = NSWindow(contentRect: NSRect(origin: .zero, size: host.fittingSize),
                             styleMask: [.titled, .closable, .fullSizeContentView],
                             backing: .buffered, defer: false)
            w.titlebarAppearsTransparent = true
            w.titleVisibility = .hidden
            w.isMovableByWindowBackground = true
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

/// Green header that sweeps down on the left and right.
private struct HeaderWave: Shape {
    var drop: CGFloat = 0
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: 0, y: 0))
        p.addLine(to: CGPoint(x: r.maxX, y: 0))
        p.addLine(to: CGPoint(x: r.maxX, y: r.maxY * 0.62 + drop))
        p.addCurve(to: CGPoint(x: 0, y: r.maxY * 0.98 + drop),
                   control1: CGPoint(x: r.maxX * 0.62, y: r.maxY * 0.02 + drop),
                   control2: CGPoint(x: r.maxX * 0.30, y: r.maxY * 0.30 + drop))
        p.closeSubpath()
        return p
    }
}

private struct KeyCapLabel: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(Brand.ink)
            .padding(.horizontal, 14).padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.white)
                    .shadow(color: .black.opacity(0.25), radius: 0.5, y: 1.5)
            )
            .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous).stroke(Color.black.opacity(0.12)))
    }
}

private struct AboutView: View {
    private let info = Bundle.main.infoDictionary ?? [:]
    private var version: String {
        let short = info["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = info["CFBundleVersion"] as? String ?? ""
        return build.isEmpty ? "Version \(short)" : "Version \(short) (\(build))"
    }
    private var copyright: String { info["NSHumanReadableCopyright"] as? String ?? "" }

    var body: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .top) {
                // Red edge peeking out under the green on the right
                HeaderWave(drop: 7)
                    .fill(LinearGradient(colors: [Brand.red.opacity(0), Brand.red],
                                         startPoint: UnitPoint(x: 0.45, y: 0.5), endPoint: .trailing))
                HeaderWave()
                    .fill(LinearGradient(colors: [Brand.greenDeep, Color(red: 0.05, green: 0.55, blue: 0.33), Brand.greenDeep],
                                         startPoint: .leading, endPoint: .trailing))
            }
            .frame(height: 120)
            .overlay(alignment: .bottom) {
                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .interpolation(.high)
                    .frame(width: 120, height: 120)
                    .shadow(color: Brand.greenDeep.opacity(0.35), radius: 10, y: 6)
                    .offset(y: 62)
            }
            .padding(.bottom, 70)

            Text("Bijoy Bangla")
                .font(.system(size: 34, weight: .bold))
                .foregroundColor(Brand.ink)

            Text(version)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(Brand.greenDeep)
                .padding(.horizontal, 18).padding(.vertical, 6)
                .background(Capsule().fill(Brand.greenSoft))
                .padding(.top, 8)

            HStack(alignment: .top, spacing: 14) {
                RoundedRectangle(cornerRadius: 2).fill(Brand.green).frame(width: 4, height: 26)
                VStack(alignment: .leading, spacing: 6) {
                    Text("Type in Bangla")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(Brand.greenDeep)
                    Text("Type Unicode Bangla with the Bijoy keyboard layout.")
                        .font(.system(size: 14))
                        .foregroundColor(Brand.ink.opacity(0.8))
                }
                Spacer(minLength: 0)
            }
            .padding(.top, 26)
            .padding(.horizontal, 28)

            HStack(spacing: 14) {
                Image(systemName: "keyboard")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(Brand.greenDeep)
                    .frame(width: 52, height: 52)
                    .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Brand.greenSoft))
                Rectangle().fill(Brand.greenLine).frame(width: 1, height: 48)
                VStack(alignment: .leading, spacing: 3) {
                    Text("Switch input language")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(Brand.ink)
                    Text("You can also switch from the input menu in the menu bar.")
                        .font(.system(size: 12))
                        .foregroundColor(Brand.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 4)
                HStack(spacing: 8) {
                    KeyCapLabel(text: "Control")
                    Text("+").font(.system(size: 16, weight: .semibold)).foregroundColor(Brand.ink)
                    KeyCapLabel(text: "Space")
                }
            }
            .padding(14)
            .background(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(red: 0.96, green: 0.99, blue: 0.97)))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Brand.greenLine))
            .padding(.top, 20)
            .padding(.horizontal, 20)

            Text(copyright)
                .font(.system(size: 14))
                .foregroundColor(Brand.ink.opacity(0.75))
                .padding(.top, 22)
                .padding(.bottom, 24)
        }
        .frame(width: 560)
        .background(Color(red: 0.97, green: 0.97, blue: 0.98))
        .environment(\.colorScheme, .light)
    }
}
