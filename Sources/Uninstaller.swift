// Uninstaller.swift
// "Uninstall Bijoy Bangla…" in the input menu: switch the input sources off,
// delete the app (asking for an admin password when it lives in
// /Library/Input Methods) and quit.

import Cocoa
import Carbon

enum Uninstaller {
    static func confirmAndRemove() {
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = "Uninstall Bijoy Bangla?"
        alert.informativeText = "The Bijoy Bangla keyboard will be removed from this Mac. Log out and back in afterwards to clear it from the input menu."
        alert.addButton(withTitle: "Uninstall")
        alert.addButton(withTitle: "Cancel")
        alert.alertStyle = .warning
        guard alert.runModal() == .alertFirstButtonReturn else { return }

        // Move typing back to another source before ours disappears.
        selectFallbackSource()
        InputSources.uninstall()

        let path = Bundle.main.bundlePath
        let fm = FileManager.default
        var removed = false
        if fm.isWritableFile(atPath: (path as NSString).deletingLastPathComponent) {
            removed = (try? fm.removeItem(atPath: path)) != nil
        }
        if !removed {
            let escaped = path.replacingOccurrences(of: "'", with: "'\\''")
            let shell = "rm -rf '\(escaped)'; /usr/sbin/pkgutil --forget io.spsv.inputmethod.BijoyBangla.pkg >/dev/null 2>&1; true"
            let source = "do shell script \"\(shell.replacingOccurrences(of: "\"", with: "\\\""))\" with administrator privileges"
            var error: NSDictionary?
            NSAppleScript(source: source)?.executeAndReturnError(&error)
            removed = !fm.fileExists(atPath: path)
        }

        let done = NSAlert()
        if removed {
            done.messageText = "Bijoy Bangla has been removed"
            done.informativeText = "Log out and back in to finish."
        } else {
            done.messageText = "Bijoy Bangla could not be removed"
            done.informativeText = "Delete BijoyBangla.app from /Library/Input Methods (or ~/Library/Input Methods) in Finder, then log out and back in."
        }
        done.runModal()
        if removed { exit(0) }
    }

    /// Select the first enabled keyboard layout that isn't ours (ABC, Irish, British...).
    private static func selectFallbackSource() {
        let filter = [kTISPropertyInputSourceType as String: kTISTypeKeyboardLayout as String] as CFDictionary
        guard let list = TISCreateInputSourceList(filter, false)?.takeRetainedValue() as? [TISInputSource],
              let first = list.first else { return }
        TISSelectInputSource(first)
    }
}
