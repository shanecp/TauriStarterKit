#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_APP="${__INSTALL_ENV_PREFIX___SOURCE_APP:-"$ROOT_DIR/src-tauri/target/release/bundle/macos/__APP_NAME__.app"}"
INSTALL_DIR="${__INSTALL_ENV_PREFIX___INSTALL_DIR:-"$HOME/Applications"}"
TARGET_APP="$INSTALL_DIR/__APP_NAME__.app"

if [[ ! -d "$SOURCE_APP" ]]; then
  echo "Built app not found at $SOURCE_APP"
  echo "Run: npm run tauri:build"
  exit 1
fi

if [[ -e "$TARGET_APP" ]]; then
  echo "$TARGET_APP already exists."
  echo "Run: npm run upgrade:local"
  exit 1
fi

mkdir -p "$INSTALL_DIR"
/usr/bin/ditto "$SOURCE_APP" "$TARGET_APP"
echo "Installed __APP_NAME__ to $TARGET_APP"
