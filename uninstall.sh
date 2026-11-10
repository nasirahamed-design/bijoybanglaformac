#!/bin/bash
# Remove Bijoy Bangla from this Mac.
set -uo pipefail
for dir in "$HOME/Library/Input Methods" "/Library/Input Methods"; do
  app="$dir/BijoyBangla.app"
  if [ -d "$app" ]; then
    "$app/Contents/MacOS/BijoyBangla" --uninstall 2>/dev/null
    pkill -x BijoyBangla 2>/dev/null
    if [ -w "$dir" ]; then rm -rf "$app"; else sudo rm -rf "$app"; fi
    echo "Removed $app"
  fi
done
sudo pkgutil --forget io.spsv.inputmethod.BijoyBangla.pkg 2>/dev/null || true
echo "Done. Log out and back in to clear it from the input menu."
