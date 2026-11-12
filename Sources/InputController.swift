// InputController.swift
// One instance per text field / client. Bangla and Classic modes keep the
// keys of the current word in `keys`, show the converted text as marked
// (underlined) text, and commit it at a word boundary. Classic mode outputs
// Bijoy ANSI for SutonnyMJ / MJ fonts instead of Unicode. English mode
// passes every key straight through.

import Cocoa
import InputMethodKit
import Carbon

enum InputMode {
    case bangla, classic, english

    static let banglaID  = "io.spsv.inputmethod.BijoyBangla.Bangla"
    static let classicID = "io.spsv.inputmethod.BijoyBangla.Classic"
    static let englishID = "io.spsv.inputmethod.BijoyBangla.English"

    var modeID: String {
        switch self {
        case .bangla:  return InputMode.banglaID
        case .classic: return InputMode.classicID
        case .english: return InputMode.englishID
        }
    }

    /// Display order: English, বিজয় ইউনিকোড, বিজয় ক্লাসিক.
    static let allIDs = [englishID, banglaID, classicID]

    init?(modeID: String) {
        switch modeID {
        case InputMode.banglaID:  self = .bangla
        case InputMode.classicID: self = .classic
        case InputMode.englishID: self = .english
        default: return nil
        }
    }

    /// Mode is system-wide, shared by every controller instance.
    static var current: InputMode = .bangla

    static func fromSystem() -> InputMode? {
        guard let src = TISCopyCurrentKeyboardInputSource()?.takeRetainedValue(),
              let ptr = TISGetInputSourceProperty(src, kTISPropertyInputModeID) else { return nil }
        let id = Unmanaged<CFString>.fromOpaque(ptr).takeUnretainedValue() as String
        return InputMode(modeID: id)
    }
}

@objc(BijoyInputController)
final class BijoyInputController: IMKInputController {

    private var keys: [Character] = []

    private var textClient: IMKTextInput? { client() }

    // MARK: - Mode

    override func activateServer(_ sender: Any!) {
        super.activateServer(sender)
        if let m = InputMode.fromSystem() { InputMode.current = m }
        InScriptGuard.apply()
    }

    override func deactivateServer(_ sender: Any!) {
        commit(sender as? IMKTextInput)
        super.deactivateServer(sender)
    }

    override func setValue(_ value: Any!, forTag tag: Int, client sender: Any!) {
        if let id = value as? String, let mode = InputMode(modeID: id), mode != InputMode.current {
            commit(sender as? IMKTextInput)   // finish the word in the old mode
            InputMode.current = mode
        }
        super.setValue(value, forTag: tag, client: sender)
    }

    // MARK: - Key handling

    override func recognizedEvents(_ sender: Any!) -> Int {
        Int(NSEvent.EventTypeMask([.keyDown, .leftMouseDown, .rightMouseDown]).rawValue)
    }

    override func handle(_ event: NSEvent!, client sender: Any!) -> Bool {
        guard let event = event else { return false }
        let target = (sender as? IMKTextInput) ?? textClient

        if event.type != .keyDown {
            // Clicking elsewhere ends the word.
            commit(target)
            return false
        }

        // macOS does not always tell us when the user picks another of our
        // modes in the input menu (e.g. English, then straight to বিজয় ইউনিকোড
        // without typing), so check which mode is really selected each time.
        if let m = InputMode.fromSystem(), m != InputMode.current {
            commit(target)
            InputMode.current = m
        }

        if InputMode.current == .english { return false }

        let flags = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        if !flags.intersection([.command, .control, .option]).isEmpty {
            commit(target)
            return false
        }

        // Backspace edits the word being composed.
        if event.keyCode == UInt16(kVK_Delete) {
            if keys.isEmpty { return false }
            keys.removeLast()
            showMarked(target)
            return true
        }

        if event.keyCode == UInt16(kVK_Escape) && !keys.isEmpty {
            commit(target)
            return true
        }

        let shift = flags.contains(.shift)
        if let ch = KeyCodes.usCharacter(keyCode: event.keyCode, shift: shift),
           BijoyLayout.isMapped(ch) {
            keys.append(ch)
            showMarked(target)
            return true
        }

        // Space, Return, Tab, arrows, punctuation...: finish the word and let
        // the app handle the key normally.
        commit(target)
        return false
    }

    override func commitComposition(_ sender: Any!) {
        commit((sender as? IMKTextInput) ?? textClient)
    }

    // MARK: - Composition

    private var noRange: NSRange { NSRange(location: NSNotFound, length: NSNotFound) }

    /// The current word as it should be typed in this mode.
    private func output() -> String {
        let unicode = BijoyEngine.render(keys)
        if InputMode.current == .classic, let converter = ClassicConverter.shared {
            return converter.convert(unicode)
        }
        return unicode
    }

    private func showMarked(_ client: IMKTextInput?) {
        guard let client = client else { return }
        let text = output()
        let len = (text as NSString).length
        let attributed = NSAttributedString(string: text, attributes: [
            .underlineStyle: NSUnderlineStyle.single.rawValue,
        ])
        client.setMarkedText(attributed,
                             selectionRange: NSRange(location: len, length: 0),
                             replacementRange: noRange)
    }

    private func commit(_ client: IMKTextInput?) {
        guard !keys.isEmpty else { return }
        let text = output()
        keys.removeAll()
        client?.insertText(text, replacementRange: noRange)
    }

    // MARK: - Input menu (shown under the input source icon in the top bar)

    override func menu() -> NSMenu! {
        // Tick whatever macOS really has selected.
        if let m = InputMode.fromSystem() { InputMode.current = m }
        let menu = NSMenu()

        let english = NSMenuItem(title: "English", action: #selector(selectEnglish(_:)), keyEquivalent: "")
        english.target = self
        english.state = InputMode.current == .english ? .on : .off
        menu.addItem(english)

        let bangla = NSMenuItem(title: "বিজয় ইউনিকোড", action: #selector(selectBangla(_:)), keyEquivalent: "")
        bangla.target = self
        bangla.state = InputMode.current == .bangla ? .on : .off
        menu.addItem(bangla)

        let classic = NSMenuItem(title: "বিজয় ক্লাসিক", action: #selector(selectClassic(_:)), keyEquivalent: "")
        classic.target = self
        classic.state = InputMode.current == .classic ? .on : .off
        menu.addItem(classic)

        menu.addItem(.separator())

        let layout = NSMenuItem(title: "Show Bijoy Keyboard Layout…", action: #selector(showLayout(_:)), keyEquivalent: "")
        layout.target = self
        menu.addItem(layout)

        let about = NSMenuItem(title: "About Bijoy Bangla", action: #selector(showAbout(_:)), keyEquivalent: "")
        about.target = self
        menu.addItem(about)

        let inscript = NSMenuItem(title: "Keep Bangla - InScript Off", action: #selector(toggleInScript(_:)), keyEquivalent: "")
        inscript.target = self
        inscript.state = InScriptGuard.isOn ? .on : .off
        menu.addItem(inscript)

        menu.addItem(.separator())

        let uninstall = NSMenuItem(title: "Uninstall Bijoy Bangla…", action: #selector(uninstallApp(_:)), keyEquivalent: "")
        uninstall.target = self
        menu.addItem(uninstall)

        return menu
    }

    private func switchMode(_ mode: InputMode) {
        commit(textClient)
        // Only change mode if macOS actually switched; otherwise the tick and
        // the typing would disagree with the menu bar.
        if InputSources.enableAndSelect(modeID: mode.modeID) {
            InputMode.current = mode
        }
    }

    @objc func selectBangla(_ sender: Any?) { switchMode(.bangla) }
    @objc func selectClassic(_ sender: Any?) { switchMode(.classic) }
    @objc func selectEnglish(_ sender: Any?) { switchMode(.english) }

    @objc func toggleInScript(_ sender: Any?) {
        InScriptGuard.isOn.toggle()
        InScriptGuard.apply()
    }

    @objc func showLayout(_ sender: Any?) {
        LayoutWindow.shared.show()
    }

    @objc func showAbout(_ sender: Any?) {
        AboutWindow.shared.show()
    }

    @objc func uninstallApp(_ sender: Any?) {
        Uninstaller.confirmAndRemove()
    }
}
