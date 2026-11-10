// InScriptGuard.swift
// macOS keeps putting Apple's "Bangla - InScript" keyboard back in the input
// menu at every login, even after the user removes it. Bijoy users rarely want
// it, so by default we switch it off whenever the keyboard starts or is used.
// The input menu has "Keep Bangla - InScript Off" to turn this behaviour off.
import Foundation
import Carbon

enum InScriptGuard {
    private static let key = "keepInScriptOff"

    static var isOn: Bool {
        get { UserDefaults.standard.object(forKey: key) as? Bool ?? true }
        set { UserDefaults.standard.set(newValue, forKey: key) }
    }

    /// Apple's Bangla InScript layout (keyboard layout ID -22528).
    private static func isInScript(_ src: TISInputSource) -> Bool {
        if let p = TISGetInputSourceProperty(src, kTISPropertyInputSourceID) {
            let id = Unmanaged<CFString>.fromOpaque(p).takeUnretainedValue() as String
            if id == "com.apple.keylayout.Bangla" { return true }
        }
        if let p = TISGetInputSourceProperty(src, kTISPropertyLocalizedName) {
            let name = Unmanaged<CFString>.fromOpaque(p).takeUnretainedValue() as String
            return name.localizedCaseInsensitiveContains("InScript")
                && name.localizedCaseInsensitiveContains("Bangla")
        }
        return false
    }

    static func apply() {
        guard isOn else { return }
        let filter = [kTISPropertyInputSourceType as String: kTISTypeKeyboardLayout as String] as CFDictionary
        guard let list = TISCreateInputSourceList(filter, false)?.takeRetainedValue() as? [TISInputSource] else { return }
        for src in list where isInScript(src) {
            let status = TISDisableInputSource(src)
            NSLog("Bijoy Bangla: switched off Bangla - InScript (status \(status))")
        }
    }
}
