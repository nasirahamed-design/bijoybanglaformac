// ClassicConverter.swift
// Unicode Bangla -> Bijoy (ANSI) for SutonnyMJ and other MJ fonts, used by
// the বিজয় ক্লাসিক mode. The table lives in Resources/bijoy-classic.js
// (MIT-licensed converter) and runs in macOS's built-in JavaScriptCore.

import Foundation
import JavaScriptCore

final class ClassicConverter {
    /// Loaded once from the app bundle; nil if the script is missing.
    static let shared: ClassicConverter? = {
        guard let url = Bundle.main.url(forResource: "bijoy-classic", withExtension: "js") else { return nil }
        return ClassicConverter(scriptURL: url)
    }()

    private let context: JSContext
    private let toClassic: JSValue

    init?(scriptURL: URL) {
        guard let source = try? String(contentsOf: scriptURL, encoding: .utf8),
              let context = JSContext() else { return nil }
        context.exceptionHandler = { _, exception in
            NSLog("Bijoy Classic script error: \(exception?.toString() ?? "unknown")")
        }
        context.evaluateScript(source)
        guard let fn = context.objectForKeyedSubscript("BijoyClassic")?.objectForKeyedSubscript("toClassic"),
              !fn.isUndefined else { return nil }
        self.context = context
        self.toClassic = fn
    }

    func convert(_ unicode: String) -> String {
        guard !unicode.isEmpty else { return "" }
        return toClassic.call(withArguments: [unicode])?.toString() ?? unicode
    }
}
