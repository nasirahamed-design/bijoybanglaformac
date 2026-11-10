// Engine test runner. build.sh compiles this with Sources/BijoyEngine.swift
// and Sources/ClassicConverter.swift and runs it before building the app.
//   engine-tests <cases.json> [<classic-cases.json> <bijoy-classic.js>]
import Foundation

struct Case: Decodable { let keys: String; let expected: String }

func hex(_ s: String) -> String {
    s.unicodeScalars.map { String(format: "%04X", $0.value) }.joined(separator: " ")
}

func load(_ path: String) throws -> [Case] {
    try JSONDecoder().decode([Case].self, from: Data(contentsOf: URL(fileURLWithPath: path)))
}

let args = CommandLine.arguments
var failed = 0

// Unicode engine
let cases = try load(args.count > 1 ? args[1] : "Tests/cases.json")
for c in cases {
    let got = BijoyEngine.render(Array(c.keys))
    // Compare scalar by scalar - Swift String == uses canonical equivalence,
    // which would hide a wrong (but equivalent) encoding.
    if Array(got.unicodeScalars) != Array(c.expected.unicodeScalars) {
        failed += 1
        print("FAIL \(c.keys): got \(got) [\(hex(got))] expected \(c.expected) [\(hex(c.expected))]")
    }
}
print("\(cases.count - failed)/\(cases.count) engine tests passed")

// Bijoy Classic (SutonnyMJ) output
if args.count > 3 {
    guard let converter = ClassicConverter(scriptURL: URL(fileURLWithPath: args[3])) else {
        print("FAIL could not load \(args[3])"); exit(1)
    }
    let classic = try load(args[2])
    var classicFailed = 0
    for c in classic {
        let got = converter.convert(BijoyEngine.render(Array(c.keys)))
        if Array(got.unicodeScalars) != Array(c.expected.unicodeScalars) {
            classicFailed += 1
            print("FAIL classic \(c.keys): got \(got) [\(hex(got))] expected \(c.expected)")
        }
    }
    print("\(classic.count - classicFailed)/\(classic.count) Bijoy Classic tests passed")
    failed += classicFailed
}
exit(failed == 0 ? 0 : 1)
