// main.swift
import Cocoa
import InputMethodKit

let args = CommandLine.arguments
if args.contains("--install") {
    InputSources.install(bundleURL: Bundle.main.bundleURL)
    exit(0)
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

// Keep the server alive for the life of the process.
withExtendedLifetime(server) {
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    app.run()
}
