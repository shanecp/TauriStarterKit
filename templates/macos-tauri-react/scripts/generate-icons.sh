#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ICON_DIR="$ROOT_DIR/src-tauri/icons"
SOURCE_SVG="$ICON_DIR/app-icon.svg"
ICONSET_DIR="$ICON_DIR/icon.iconset"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick is required to generate app icons."
  echo "Install it with: brew install imagemagick"
  exit 1
fi

if ! command -v iconutil >/dev/null 2>&1; then
  echo "iconutil is required to generate app icons."
  echo "Install Xcode Command Line Tools with: xcode-select --install"
  exit 1
fi

if [[ ! -f "$SOURCE_SVG" ]]; then
  echo "Source SVG not found: $SOURCE_SVG"
  exit 1
fi

rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

render_png() {
  local size="$1"
  local output="$2"
  magick -background none "$SOURCE_SVG" -resize "${size}x${size}" -strip "PNG32:$output"
}

render_png 32 "$ICON_DIR/32x32.png"
render_png 128 "$ICON_DIR/128x128.png"
render_png 256 "$ICON_DIR/128x128@2x.png"
render_png 512 "$ICON_DIR/icon.png"

render_png 16 "$ICONSET_DIR/icon_16x16.png"
render_png 32 "$ICONSET_DIR/icon_16x16@2x.png"
render_png 32 "$ICONSET_DIR/icon_32x32.png"
render_png 64 "$ICONSET_DIR/icon_32x32@2x.png"
render_png 128 "$ICONSET_DIR/icon_128x128.png"
render_png 256 "$ICONSET_DIR/icon_128x128@2x.png"
render_png 256 "$ICONSET_DIR/icon_256x256.png"
render_png 512 "$ICONSET_DIR/icon_256x256@2x.png"
render_png 512 "$ICONSET_DIR/icon_512x512.png"
render_png 1024 "$ICONSET_DIR/icon_512x512@2x.png"

iconutil -c icns "$ICONSET_DIR" -o "$ICON_DIR/icon.icns"
rm -rf "$ICONSET_DIR"

echo "Generated app icons from $SOURCE_SVG"
