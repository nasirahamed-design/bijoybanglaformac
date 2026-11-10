// InputSources.swift
// Registering, enabling and selecting our input sources through the Text
// Input Sources API. Used by `--install` / `--uninstall` (run by the
// installer for the logged-in user) and by the input menu.

import Carbon
import CoreServices
import Foundation

enum InputSources {
    static let bundleID = "io.spsv.inputmethod.BijoyBangla"

    static func ours(includeAllInstalled: Bool = true) -> [TISInputSource] {
        let filter = [kTISPropertyBundleID as String: bundleID] as CFDictionary
        guard let list = TISCreateInputSourceList(filter, includeAllInstalled)?.takeRetainedValue() else { return [] }
        return (list as? [TISInputSource]) ?? []
    }

    static func string(_ src: TISInputSource, _ key: CFString) -> String? {
        guard let ptr = TISGetInputSourceProperty(src, key) else { return nil }
        return Unmanaged<CFString>.fromOpaque(ptr).takeUnretainedValue() as String
    }

    /// Register the bundle, enable both modes and
    /// switch to বাংলা (বিজয়), so it works right after installing with no
    /// logout. macOS can take a moment to notice a newly installed input
    /// method, so enabling and selecting are retried for a few seconds.
    /// Returns true when বাংলা (বিজয়) ended up selected.
    @discardableResult
    static func install(bundleURL: URL, waitSeconds: Int = 15) -> Bool {
        // Make sure Launch Services knows the app before the input source
        // system looks for it (the installer only does this at the very end).
        LSRegisterURL(bundleURL as CFURL, true)
        let status = TISRegisterInputSource(bundleURL as CFURL)
        if status != noErr { print("TISRegisterInputSource failed: \(status)") }

        // No need to launch the app here: macOS starts the input method
        // itself as soon as বাংলা (বিজয়) is selected.

        var selected = false
        for attempt in 1...max(1, waitSeconds * 2) {
            for src in ours() where !isEnabled(src) {
                TISEnableInputSource(src)
            }
            selected = select(modeID: InputMode.banglaID)
            if selected {
                print("Bijoy Bangla selected (attempt \(attempt))")
                break
            }
            usleep(500_000)   // 0.5 s
        }
        if !selected {
            print("Bijoy Bangla registered; macOS needs a log out before it can be selected")
        }
        return selected
    }

    static func isEnabled(_ src: TISInputSource) -> Bool {
        guard let ptr = TISGetInputSourceProperty(src, kTISPropertyInputSourceIsEnabled) else { return false }
        return CFBooleanGetValue(Unmanaged<CFBoolean>.fromOpaque(ptr).takeUnretainedValue())
    }

    static func uninstall() {
        for src in ours() { TISDisableInputSource(src) }
    }

    @discardableResult
    static func select(modeID: String) -> Bool {
        var ok = false
        for src in ours() where string(src, kTISPropertyInputModeID) == modeID {
            if TISSelectInputSource(src) == noErr { ok = true }
        }
        return ok
    }
}
