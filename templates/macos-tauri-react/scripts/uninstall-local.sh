#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${__INSTALL_ENV_PREFIX___INSTALL_DIR:-"$HOME/Applications"}"
TARGET_APP="$INSTALL_DIR/__APP_NAME__.app"

if [[ ! -e "$TARGET_APP" ]]; then
  echo "__APP_NAME__ is not installed at $TARGET_APP"
  exit 0
fi

rm -rf "$TARGET_APP"
echo "Removed $TARGET_APP"
