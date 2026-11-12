// Uninstaller.swift
// "Uninstall Bijoy Bangla…" in the input menu: switch the input sources off,
// delete the app (asking for an admin password when it lives in
// /Library/Input Methods) and quit.

import Cocoa
import Carbon

enum Uninstaller {
    static func confirmAndRemove() {
        let answer = BrandAlert.run(
            title: "Uninstall Bijoy Bangla?",
            message: "The Bijoy Bangla keyboard will be removed from this Mac. Log out and back in afterwards to clear it from the input menu.",
            buttons: ["Cancel", "Uninstall"], defaultIndex: 1)
        guard answer == 1 else { return }

        // Delete the app FIRST. Only once it is really gone do we switch the
        // input sources off, so cancelling the password prompt changes nothing.
        // The password request runs in the background so typing never freezes.
        let path = Bundle.main.bundlePath
        let waiting = WaitingPanel.show("Waiting for your Mac password…")
        DispatchQueue.global(qos: .userInitiated).async {
            let result = deleteApp(at: path)
            DispatchQueue.main.async {
                waiting.close()
                finish(result)
            }
        }
    }

    private static func finish(_ result: DeleteResult) {
        switch result {
        case .cancelled:
            return
        case .failed:
            BrandAlert.run(
                title: "Bijoy Bangla could not be removed",
                message: "Delete BijoyBangla.app from /Library/Input Methods in Finder, then log out and back in.",
                buttons: ["OK"])
        case .removed:
            // Move typing back to another source before ours disappears.
            selectFallbackSource()
            InputSources.uninstall()
            BrandAlert.run(
                title: "Bijoy Bangla has been removed",
                message: "It will disappear from the input menu after you log out and back in.",
                buttons: ["OK"])
            exit(0)
        }
    }

    private enum DeleteResult { case removed, cancelled, failed }

    /// Runs off the main thread.
    private static func deleteApp(at path: String) -> DeleteResult {
        let fm = FileManager.default
        let parent = (path as NSString).deletingLastPathComponent
        if fm.isWritableFile(atPath: parent) {
            return (try? fm.removeItem(atPath: path)) != nil ? .removed : .failed
        }
        // /Library/Input Methods needs an administrator password. osascript runs
        // as its own process, so the prompt never blocks this keyboard.
        let escaped = path.replacingOccurrences(of: "'", with: "'\\''")
        let shell = "rm -rf '\(escaped)'; /usr/sbin/pkgutil --forget io.spsv.inputmethod.BijoyBangla.pkg >/dev/null 2>&1; true"
        let script = "do shell script \"\(shell.replacingOccurrences(of: "\"", with: "\\\""))\" with administrator privileges with prompt \"Bijoy Bangla needs your password to uninstall.\""
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
        task.arguments = ["-e", script]
        let errPipe = Pipe()
        task.standardError = errPipe
        task.standardOutput = Pipe()
        do { try task.run() } catch { return .failed }
        task.waitUntilExit()
        let err = String(data: errPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        if err.contains("(-128)") { return .cancelled }   // the person clicked Cancel
        return fm.fileExists(atPath: path) ? .failed : .removed
    }

    /// Select the first enabled keyboard layout that isn't ours (ABC, Irish, British...).
    private static func selectFallbackSource() {
        let filter = [kTISPropertyInputSourceType as String: kTISTypeKeyboardLayout as String] as CFDictionary
        guard let list = TISCreateInputSourceList(filter, false)?.takeRetainedValue() as? [TISInputSource],
              let first = list.first else { return }
        TISSelectInputSource(first)
    }
}

/// Small floating "please wait" window shown while macOS prepares the
/// password prompt.
final class WaitingPanel {
    private let panel: NSPanel

    private init(_ text: String) {
        panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: 300, height: 64),
                        styleMask: [.titled, .utilityWindow, .hudWindow],
                        backing: .buffered, defer: false)
        panel.title = "Uninstall Bijoy Bangla"
        panel.level = .floating
        panel.isReleasedWhenClosed = false
        let spinner = NSProgressIndicator(frame: NSRect(x: 18, y: 22, width: 20, height: 20))
        spinner.style = .spinning
        spinner.controlSize = .small
        spinner.startAnimation(nil)
        let label = NSTextField(labelWithString: text)
        label.frame = NSRect(x: 46, y: 22, width: 240, height: 20)
        panel.contentView?.addSubview(spinner)
        panel.contentView?.addSubview(label)
        panel.center()
    }

    static func show(_ text: String) -> WaitingPanel {
        let w = WaitingPanel(text)
        NSApp.activate(ignoringOtherApps: true)
        w.panel.orderFrontRegardless()
        return w
    }

    func close() { panel.orderOut(nil) }
}
