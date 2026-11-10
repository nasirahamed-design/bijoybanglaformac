// InputSources.swift
// Registering, enabling and selecting our input sources through the Text
// Input Sources API. Used by `--install` / `--uninstall` (run by the
// installer for the logged-in user) and by the input menu.

import Carbon
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

    /// Register the bundle with the system and turn on both modes so they
    /// appear in the input menu straight away.
    static func install(bundleURL: URL) {
        let status = TISRegisterInputSource(bundleURL as CFURL)
        if status != noErr { print("TISRegisterInputSource failed: \(status)") }
        for src in ours() {
            TISEnableInputSource(src)
        }
        select(modeID: InputMode.banglaID)
        print("Bijoy Bangla registered: \(ours().compactMap { string($0, kTISPropertyInputSourceID) })")
    }

    static func uninstall() {
        for src in ours() { TISDisableInputSource(src) }
    }

    static func select(modeID: String) {
        for src in ours() where string(src, kTISPropertyInputModeID) == modeID {
            TISSelectInputSource(src)
        }
    }
}
