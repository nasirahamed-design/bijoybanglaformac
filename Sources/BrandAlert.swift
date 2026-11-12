// BrandAlert.swift
// A dialog that looks like a macOS alert but shows the full Bijoy Bangla logo
// (laptop with "BIJOY BANGLA" and "FOR MAC") at a readable size. NSAlert can
// only show a small square icon, which shrinks the wide logo too much.

import AppKit
import SwiftUI

enum BrandAlert {
    /// Shows the dialog and waits. Returns the index of the clicked button
    /// (0 = first). Escape picks the button titled "Cancel", Return the default.
    @discardableResult
    static func run(title: String, message: String, buttons: [String], defaultIndex: Int = 0) -> Int {
        var chosen = buttons.firstIndex(of: "Cancel") ?? defaultIndex
        let panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 300, height: 300),
                            styleMask: [.titled, .fullSizeContentView],
                            backing: .buffered, defer: false)
        panel.titlebarAppearsTransparent = true
        panel.titleVisibility = .hidden
        panel.isMovableByWindowBackground = true
        panel.isReleasedWhenClosed = false
        panel.level = .modalPanel

        let view = BrandAlertView(title: title, message: message, buttons: buttons,
                                  defaultIndex: defaultIndex) { index in
            chosen = index
            NSApp.stopModal()
        }
        let host = NSHostingView(rootView: view)
        let size = host.fittingSize
        host.frame = NSRect(origin: .zero, size: size)
        panel.contentView = host
        panel.setContentSize(size)
        panel.center()

        NSApp.activate(ignoringOtherApps: true)
        panel.makeKeyAndOrderFront(nil)
        NSApp.runModal(for: panel)
        panel.orderOut(nil)
        return chosen
    }

    /// The logo bundled in Resources, in the dark version when the Mac is in Dark Mode.
    static var logo: NSImage? {
        let dark = NSApp.effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        guard let url = Bundle.main.url(forResource: dark ? "logo-dark" : "logo", withExtension: "png")
        else { return nil }
        return NSImage(contentsOf: url)
    }
}

private struct BrandAlertView: View {
    let title: String
    let message: String
    let buttons: [String]
    let defaultIndex: Int
    let onChoose: (Int) -> Void

    var body: some View {
        VStack(spacing: 12) {
            if let logo = BrandAlert.logo {
                Image(nsImage: logo)
                    .resizable()
                    .interpolation(.high)
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 200)
                    .padding(.bottom, 4)
            }
            Text(title)
                .font(.system(size: 14, weight: .bold))
                .multilineTextAlignment(.center)
            Text(message)
                .font(.system(size: 12))
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 10) {
                ForEach(Array(buttons.enumerated()), id: \.offset) { item in
                    Button(action: { onChoose(item.offset) }) {
                        Text(item.element).frame(maxWidth: .infinity)
                    }
                    .controlSize(.large)
                    .keyboardShortcut(shortcut(for: item.offset, title: item.element))
                }
            }
            .padding(.top, 6)
        }
        .padding(EdgeInsets(top: 26, leading: 22, bottom: 18, trailing: 22))
        .frame(width: 300)
    }

    private func shortcut(for index: Int, title: String) -> KeyboardShortcut? {
        if index == defaultIndex { return .defaultAction }
        if title == "Cancel" { return .cancelAction }
        return nil
    }
}
