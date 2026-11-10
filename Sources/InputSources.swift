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

    /// Register the bundle, enable both modes and switch to বিজয় ইউনিকোড,
    /// so it works right after installing with no logout.
    ///
    /// On a fresh install macOS asks "Allow 'Bijoy Bangla' to enable ...?".
    /// Each enable request opens that prompt again, so we ask exactly once
    /// per mode and then only watch for the person's answer.
    /// Returns true when বিজয় ইউনিকোড ended up selected.
    @discardableResult
    static func install(bundleURL: URL, waitSeconds: Int = 15) -> Bool {
        // Make sure Launch Services knows the app before the input source
        // system looks for it (the installer only does this at the very end).
        LSRegisterURL(bundleURL as CFURL, true)
        let status = TISRegisterInputSource(bundleURL as CFURL)
        if status != noErr { print("TISRegisterInputSource failed: \(status)") }

        // 1. Wait (up to 10 s) for macOS to list our modes.
        guard waitUntil(seconds: 10, { source(modeID: InputMode.banglaID) != nil }) else {
            print("Bijoy Bangla registered; macOS needs a log out before it can be selected")
            return false
        }

        // 2. Enable বিজয় ইউনিকোড once, then wait for the person to click Allow.
        if !enabled(modeID: InputMode.banglaID) {
            if let src = source(modeID: InputMode.banglaID) { TISEnableInputSource(src) }
            print("Asked macOS to enable বিজয় ইউনিকোড; waiting for Allow")
            guard waitUntil(seconds: waitSeconds, { enabled(modeID: InputMode.banglaID) }) else {
                print("বিজয় ইউনিকোড was not enabled (Allow not clicked, or a log out is needed)")
                return false
            }
        }

        // 3. Classic and English modes: one request each, short wait.
        for modeID in [InputMode.classicID, InputMode.englishID] where !enabled(modeID: modeID) {
            if let src = source(modeID: modeID) { TISEnableInputSource(src) }
            _ = waitUntil(seconds: 5, { enabled(modeID: modeID) })
        }

        // 4. Select বিজয় ইউনিকোড. Selecting never shows a prompt, so retrying is fine.
        for attempt in 1...20 {
            if select(modeID: InputMode.banglaID) {
                print("Bijoy Bangla selected (attempt \(attempt))")
                refreshInputMenu()
                return true
            }
            usleep(500_000)
        }
        print("Bijoy Bangla enabled but could not be selected; macOS needs a log out")
        return false
    }

    /// Used by the installer: register the app and switch both modes on
    /// once, with no waiting and no selecting. After the person logs out
    /// and back in, বিজয় ইউনিকোড is in the input menu ready to choose.
    static func register(bundleURL: URL) {
        LSRegisterURL(bundleURL as CFURL, true)
        let status = TISRegisterInputSource(bundleURL as CFURL)
        if status != noErr { print("TISRegisterInputSource failed: \(status)") }
        for modeID in InputMode.allIDs {
            if let src = source(modeID: modeID), !isEnabled(src) {
                TISEnableInputSource(src)
            }
        }
        print("Bijoy Bangla registered and enabled; log out and back in to use it")
    }

    /// Switch on any of our modes that has never been switched on before -
    /// for example বিজয় ক্লাসিক after updating from a version without it.
    /// Each mode is handled once only, so a mode the person removes in
    /// System Settings stays removed.
    static func enableNewModesOnce() {
        let defaults = UserDefaults.standard
        for modeID in InputMode.allIDs {
            let key = "enabledOnce.\(modeID)"
            guard !defaults.bool(forKey: key), let src = source(modeID: modeID) else { continue }
            if !isEnabled(src) { TISEnableInputSource(src) }
            defaults.set(true, forKey: key)
        }
    }

    /// Switch a mode on if needed, then select it. Returns true if selected.
    @discardableResult
    static func enableAndSelect(modeID: String) -> Bool {
        if let src = source(modeID: modeID), !isEnabled(src) {
            TISEnableInputSource(src)
        }
        return select(modeID: modeID)
    }

    /// Fresh lookup each time: a source's properties can be cached.
    static func source(modeID: String) -> TISInputSource? {
        ours().first { string($0, kTISPropertyInputModeID) == modeID }
    }

    static func enabled(modeID: String) -> Bool {
        guard let src = source(modeID: modeID) else { return false }
        return isEnabled(src)
    }

    /// Polls `condition` every 0.5 s for up to `seconds`.
    static func waitUntil(seconds: Int, _ condition: () -> Bool) -> Bool {
        for _ in 0..<max(1, seconds * 2) {
            if condition() { return true }
            usleep(500_000)
        }
        return condition()
    }

    /// The input menu in the menu bar doesn't always redraw when the input
    /// source is switched from a background process. Restarting the small
    /// macOS helper that draws it (it relaunches by itself at once) makes
    /// the বা icon appear straight away.
    static func refreshInputMenu() {
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/killall")
        task.arguments = ["TextInputMenuAgent"]
        task.standardError = FileHandle.nullDevice
        try? task.run()
        task.waitUntilExit()
        print("Input menu refreshed")
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
