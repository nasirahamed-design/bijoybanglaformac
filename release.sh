#!/bin/bash
# Build the downloadable DMG:  build/BijoyBangla-<version>.dmg
#
#   ./release.sh --backup      personal backup copy, no Developer ID needed
#   ./release.sh               public release: Developer ID signed + notarized
#
# Public release needs (one-time setup, see the manual):
#   export DEV_ID_APP="Developer ID Application: Nasir Ahamed (TEAMID)"
#   export DEV_ID_INSTALLER="Developer ID Installer: Nasir Ahamed (TEAMID)"
#   xcrun notarytool store-credentials bijoy-notary --apple-id <apple-id> --team-id TEAMID
#
# VERSION defaults to 1.0.0:  VERSION=1.0.1 ./release.sh
set -euo pipefail
cd "$(dirname "$0")"

MODE="public"
[ "${1:-}" = "--backup" ] && MODE="backup"

VERSION="${VERSION:-1.0.0}"
NOTARY_PROFILE="${NOTARY_PROFILE:-bijoy-notary}"
PKG_ID="io.spsv.inputmethod.BijoyBangla.pkg"
PKG="build/Install Bijoy Bangla.pkg"
DMG="build/BijoyBangla-$VERSION.dmg"

if [ "$MODE" = "public" ]; then
  : "${DEV_ID_APP:?Set DEV_ID_APP (or use ./release.sh --backup)}"
  : "${DEV_ID_INSTALLER:?Set DEV_ID_INSTALLER (or use ./release.sh --backup)}"
  xcrun notarytool history --keychain-profile "$NOTARY_PROFILE" >/dev/null \
    || { echo "Notary profile '$NOTARY_PROFILE' not found - run notarytool store-credentials first"; exit 1; }
  SIGN_ID="$DEV_ID_APP" VERSION="$VERSION" ./build.sh
else
  SIGN_ID="-" VERSION="$VERSION" ./build.sh
fi

notarize() {
  echo "==> Notarizing $(basename "$1") (usually 1-5 minutes)"
  xcrun notarytool submit "$1" --keychain-profile "$NOTARY_PROFILE" --wait | tee build/notary.log
  grep -q "status: Accepted" build/notary.log || {
    id=$(awk '/  id:/{print $2; exit}' build/notary.log)
    echo "Notarization failed. Details:"; xcrun notarytool log "$id" --keychain-profile "$NOTARY_PROFILE"
    exit 1
  }
  xcrun stapler staple "$1"
}

echo "==> Building the installer package"
ROOT=build/pkgroot
rm -rf "$ROOT" build/component.pkg build/component.plist "$PKG"
mkdir -p "$ROOT/Library/Input Methods"
ditto build/BijoyBangla.app "$ROOT/Library/Input Methods/BijoyBangla.app"
chmod 755 Installer/scripts/preinstall Installer/scripts/postinstall

# Stop the installer "relocating" the app to wherever an old copy lives.
pkgbuild --analyze --root "$ROOT" build/component.plist
plutil -replace 0.BundleIsRelocatable -bool NO build/component.plist

pkgbuild --root "$ROOT" --component-plist build/component.plist \
  --identifier "$PKG_ID" --version "$VERSION" --install-location / \
  --scripts Installer/scripts build/component.pkg

sed "s/__VERSION__/$VERSION/" Installer/distribution.xml > build/distribution.xml
if [ "$MODE" = "public" ]; then
  productbuild --distribution build/distribution.xml --resources Installer/resources \
    --package-path build --sign "$DEV_ID_INSTALLER" "$PKG"
  notarize "$PKG"
else
  productbuild --distribution build/distribution.xml --resources Installer/resources \
    --package-path build "$PKG"
fi

echo "==> Building the DMG"
STAGE=build/dmg
rm -rf "$STAGE" "$DMG"
mkdir -p "$STAGE"
cp "$PKG" "$STAGE/"
cp "Distribution/Activation Guide.pdf" "$STAGE/"
hdiutil create -volname "Bijoy Bangla $VERSION" -srcfolder "$STAGE" \
  -fs HFS+ -format UDZO -imagekey zlib-level=9 -ov "$DMG"

if [ "$MODE" = "public" ]; then
  codesign --force --timestamp --sign "$DEV_ID_APP" "$DMG"
  notarize "$DMG"
  spctl --assess --type open --context context:primary-signature --verbose "$DMG"
fi

shasum -a 256 "$DMG" | tee "$DMG.sha256"
# Same file under a fixed name, so the website's "latest" download link never changes
cp "$DMG" build/BijoyBangla.dmg
echo
echo "==> Done ($MODE): $DMG"
[ "$MODE" = "backup" ] && echo "    Backup build: opens on your Macs only. Use ./release.sh for the website."
exit 0
