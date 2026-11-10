#!/bin/bash
# Install the build into your own ~/Library/Input Methods for testing.
set -euo pipefail
cd "$(dirname "$0")"

[ -d build/BijoyBangla.app ] || ./build.sh

DEST="$HOME/Library/Input Methods"
mkdir -p "$DEST"
pkill -x BijoyBangla 2>/dev/null || true
rm -rf "$DEST/BijoyBangla.app"
cp -R build/BijoyBangla.app "$DEST/"
"$DEST/BijoyBangla.app/Contents/MacOS/BijoyBangla" --install

echo
echo "Installed. Pick 'বাংলা (বিজয়)' from the input menu in the top bar."
echo "If it doesn't show up, log out and back in once."
