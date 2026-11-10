// Engine test runner. build.sh compiles this together with
// Sources/BijoyEngine.swift and runs it before building the app.
import Foundation

struct Case: Decodable { let keys: String; let expected: String }

let path = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "Tests/cases.json"
let data = try Data(contentsOf: URL(fileURLWithPath: path))
let cases = try JSONDecoder().decode([Case].self, from: data)

func hex(_ s: String) -> String {
    s.unicodeScalars.map { String(format: "%04X", $0.value) }.joined(separator: " ")
}

var failed = 0
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
exit(failed == 0 ? 0 : 1)
