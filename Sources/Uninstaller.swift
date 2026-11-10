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

        // Delete the app FIRST. Only once it is really gone do we switch the
        // input sources off, so cancelling the password prompt changes nothing.
        let path = Bundle.main.bundlePath
        switch deleteApp(at: path) {
        case .cancelled:
            return
        case .failed:
            let failed = NSAlert()
            failed.messageText = "Bijoy Bangla could not be removed"
            failed.informativeText = "Delete BijoyBangla.app from /Library/Input Methods in Finder, then log out and back in."
            failed.runModal()
            return
        case .removed:
            break
        }

        // Move typing back to another source before ours disappears.
        selectFallbackSource()
        InputSources.uninstall()

        let done = NSAlert()
        done.messageText = "Bijoy Bangla has been removed"
        done.informativeText = "It will disappear from the input menu after you log out and back in."
        done.runModal()
        exit(0)
    }

    private enum DeleteResult { case removed, cancelled, failed }

    private static func deleteApp(at path: String) -> DeleteResult {
        let fm = FileManager.default
        let parent = (path as NSString).deletingLastPathComponent
        if fm.isWritableFile(atPath: parent) {
            return (try? fm.removeItem(atPath: path)) != nil ? .removed : .failed
        }
        // /Library/Input Methods needs an administrator password.
        let escaped = path.replacingOccurrences(of: "'", with: "'\\''")
        let shell = "rm -rf '\(escaped)'; /usr/sbin/pkgutil --forget io.spsv.inputmethod.BijoyBangla.pkg >/dev/null 2>&1; true"
        let source = "do shell script \"\(shell.replacingOccurrences(of: "\"", with: "\\\""))\" with administrator privileges"
        var error: NSDictionary?
        NSAppleScript(source: source)?.executeAndReturnError(&error)
        if let code = error?[NSAppleScript.errorNumber] as? Int, code == -128 {
            return .cancelled          // the person clicked Cancel
        }
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
