// main.swift
import Cocoa
import InputMethodKit

let args = CommandLine.arguments
if args.contains("--register") {
    InputSources.register(bundleURL: Bundle.main.bundleURL)
    exit(0)
}
if args.contains("--install") {
    // --after-install: started by the installer's helper job in the user's
    // session; give the installer a moment to finish, then keep trying longer.
    let afterInstall = args.contains("--after-install")
    if afterInstall { sleep(1) }
    let ok = InputSources.install(bundleURL: Bundle.main.bundleURL, waitSeconds: afterInstall ? 90 : 60)
    if afterInstall {
        try? FileManager.default.removeItem(atPath: "/tmp/io.spsv.inputmethod.BijoyBangla.activate.plist")
    }
    // Exit code 0 = selected and ready, 2 = needs a log out first.
    exit(ok ? 0 : 2)
}
if args.contains("--uninstall") {
    InputSources.uninstall()
    exit(0)
}

guard let connectionName = Bundle.main.infoDictionary?["InputMethodConnectionName"] as? String,
      let server = IMKServer(name: connectionName, bundleIdentifier: Bundle.main.bundleIdentifier) else {
    NSLog("Bijoy Bangla: could not start the input method server")
    exit(1)
}

// After an update that adds a mode (such as বিজয় ক্লাসিক), switch it on once.
InputSources.enableNewModesOnce()

// macOS re-adds Apple's "Bangla - InScript" at login; switch it off again
// (now, and once more after login has settled) unless the user wants it.
InScriptGuard.apply()
DispatchQueue.main.asyncAfter(deadline: .now() + 15) { InScriptGuard.apply() }

// Keep the server alive for the life of the process.
withExtendedLifetime(server) {
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    app.run()
}
