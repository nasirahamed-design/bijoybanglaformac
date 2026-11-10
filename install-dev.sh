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
if "$DEST/BijoyBangla.app/Contents/MacOS/BijoyBangla" --install; then
  echo; echo "Installed and switched to বিজয় ইউনিকোড. Start typing."
else
  echo; echo "Installed. Log out and back in once, then pick বিজয় ইউনিকোড from the input menu."
fi
