#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_APP="${__INSTALL_ENV_PREFIX___SOURCE_APP:-"$ROOT_DIR/src-tauri/target/release/bundle/macos/__APP_NAME__.app"}"
INSTALL_DIR="${__INSTALL_ENV_PREFIX___INSTALL_DIR:-"$HOME/Applications"}"
TARGET_APP="$INSTALL_DIR/__APP_NAME__.app"
TMP_APP="$INSTALL_DIR/__APP_NAME__.app.tmp.$$"
APP_BUNDLE_ID="__BUNDLE_ID__"

cleanup() {
  rm -rf "$TMP_APP"
}
trap cleanup EXIT

if [[ ! -d "$SOURCE_APP" ]]; then
  echo "Built app not found at $SOURCE_APP"
  echo "Run: npm run tauri:build"
  exit 1
fi

app_is_running() {
  [[ "$(/usr/bin/osascript -e "application id \"$APP_BUNDLE_ID\" is running" 2>/dev/null)" == "true" ]]
}

quit_running_app() {
  if ! app_is_running; then
    return
  fi

  echo "Quitting running __APP_NAME__ before replacement..."
  if ! /usr/bin/osascript -e "tell application id \"$APP_BUNDLE_ID\" to quit" >/dev/null; then
    echo "Unable to ask __APP_NAME__ to quit. Close it and rerun: npm run upgrade:local"
    exit 1
  fi

  for _ in {1..10}; do
    if ! app_is_running; then
      echo "__APP_NAME__ closed."
      return
    fi
    sleep 0.5
  done

  echo "__APP_NAME__ is still running. Close it and rerun: npm run upgrade:local"
  exit 1
}

mkdir -p "$INSTALL_DIR"
/usr/bin/ditto "$SOURCE_APP" "$TMP_APP"
quit_running_app
rm -rf "$TARGET_APP"
mv "$TMP_APP" "$TARGET_APP"
echo "Upgraded __APP_NAME__ at $TARGET_APP"

if ! /usr/bin/open "$TARGET_APP"; then
  echo "Upgraded __APP_NAME__ but could not open it automatically."
  exit 1
fi

echo "Opened __APP_NAME__."
