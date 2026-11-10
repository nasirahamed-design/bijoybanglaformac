#!/bin/bash
# Build BijoyBangla.app (universal arm64 + x86_64).
#   ./build.sh                      ad-hoc signed, for testing on this Mac
#   SIGN_ID="Developer ID Application: Your Name (TEAMID)" ./build.sh
# Needs Xcode or the Command Line Tools (xcode-select --install).
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${VERSION:-1.0.0}"
BUILD="${BUILD:-$(date +%Y%m%d%H%M)}"
SIGN_ID="${SIGN_ID:--}"
MIN_MACOS=13.0
APP="build/BijoyBangla.app"
SDK="$(xcrun --sdk macosx --show-sdk-path)"

rm -rf build
mkdir -p build

echo "==> Engine tests"
xcrun swiftc -O Sources/BijoyEngine.swift Tests/main.swift -o build/engine-tests
build/engine-tests Tests/cases.json

echo "==> Compiling"
for arch in arm64 x86_64; do
  xcrun swiftc -O -sdk "$SDK" -target "$arch-apple-macos$MIN_MACOS" \
    -module-name BijoyBangla \
    -framework Cocoa -framework InputMethodKit -framework Carbon -framework SwiftUI \
    Sources/*.swift -o "build/BijoyBangla-$arch"
done

echo "==> Assembling $APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
lipo -create build/BijoyBangla-arm64 build/BijoyBangla-x86_64 -output "$APP/Contents/MacOS/BijoyBangla"
sed -e "s/__VERSION__/$VERSION/" -e "s/__BUILD__/$BUILD/" Resources/Info.plist > "$APP/Contents/Info.plist"
plutil -lint "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"
cp -R Resources/en.lproj "$APP/Contents/Resources/"

echo "==> Icons"
xcrun swift Scripts/make-icons.swift build/icons
cp build/icons/Bangla.tiff build/icons/English.tiff "$APP/Contents/Resources/"
iconutil -c icns build/icons/AppIcon.iconset -o "$APP/Contents/Resources/AppIcon.icns"

echo "==> Signing ($SIGN_ID)"
if [ "$SIGN_ID" = "-" ]; then
  codesign --force --sign - "$APP"
else
  codesign --force --options runtime --timestamp --sign "$SIGN_ID" "$APP"
fi
codesign --verify --strict --verbose=2 "$APP"

echo "==> Built $APP ($VERSION build $BUILD)"
