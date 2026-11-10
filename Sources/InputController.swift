// InputController.swift
// One instance per text field / client. Bangla mode keeps the keys of the
// current word in `keys`, shows the converted text as marked (underlined)
// text, and commits it at a word boundary. English mode passes every key
// straight through.

import Cocoa
import InputMethodKit
import Carbon

enum InputMode {
    case bangla, english

    static let banglaID  = "io.spsv.inputmethod.BijoyBangla.Bangla"
    static let englishID = "io.spsv.inputmethod.BijoyBangla.English"

    var modeID: String { self == .bangla ? InputMode.banglaID : InputMode.englishID }

    /// Mode is system-wide, shared by every controller instance.
    static var current: InputMode = .bangla

    static func fromSystem() -> InputMode? {
        guard let src = TISCopyCurrentKeyboardInputSource()?.takeRetainedValue(),
              let ptr = TISGetInputSourceProperty(src, kTISPropertyInputModeID) else { return nil }
        let id = Unmanaged<CFString>.fromOpaque(ptr).takeUnretainedValue() as String
        if id == banglaID { return .bangla }
        if id == englishID { return .english }
        return nil
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
    }

    override func deactivateServer(_ sender: Any!) {
        commit(sender as? IMKTextInput)
        super.deactivateServer(sender)
    }

    override func setValue(_ value: Any!, forTag tag: Int, client sender: Any!) {
        if let id = value as? String {
            if id == InputMode.banglaID { InputMode.current = .bangla }
            else if id == InputMode.englishID {
                commit(sender as? IMKTextInput)
                InputMode.current = .english
            }
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

    private func showMarked(_ client: IMKTextInput?) {
        guard let client = client else { return }
        let text = BijoyEngine.render(keys)
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
        let text = BijoyEngine.render(keys)
        keys.removeAll()
        client?.insertText(text, replacementRange: noRange)
    }

    // MARK: - Input menu (shown under the input source icon in the top bar)

    override func menu() -> NSMenu! {
        let menu = NSMenu()

        let bangla = NSMenuItem(title: "বাংলা (বিজয়)", action: #selector(selectBangla(_:)), keyEquivalent: "")
        bangla.target = self
        bangla.state = InputMode.current == .bangla ? .on : .off
        menu.addItem(bangla)

        let english = NSMenuItem(title: "English", action: #selector(selectEnglish(_:)), keyEquivalent: "")
        english.target = self
        english.state = InputMode.current == .english ? .on : .off
        menu.addItem(english)

        menu.addItem(.separator())

        let layout = NSMenuItem(title: "Show Bijoy Keyboard Layout…", action: #selector(showLayout(_:)), keyEquivalent: "")
        layout.target = self
        menu.addItem(layout)

        let about = NSMenuItem(title: "About Bijoy Bangla", action: #selector(showAbout(_:)), keyEquivalent: "")
        about.target = self
        menu.addItem(about)

        menu.addItem(.separator())

        let uninstall = NSMenuItem(title: "Uninstall Bijoy Bangla…", action: #selector(uninstallApp(_:)), keyEquivalent: "")
        uninstall.target = self
        menu.addItem(uninstall)

        return menu
    }

    private func switchMode(_ mode: InputMode) {
        if mode == .english { commit(textClient) }
        InputMode.current = mode
        InputSources.select(modeID: mode.modeID)
    }

    @objc func selectBangla(_ sender: Any?) { switchMode(.bangla) }
    @objc func selectEnglish(_ sender: Any?) { switchMode(.english) }

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
