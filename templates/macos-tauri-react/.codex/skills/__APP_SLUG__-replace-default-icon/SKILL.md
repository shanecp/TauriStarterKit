---
name: __APP_SLUG__-replace-default-icon
description: "Replace __APP_NAME__'s default Tauri placeholder app icon only when explicitly invoked as $__APP_SLUG__-replace-default-icon. Use to edit src-tauri/icons/app-icon.svg by replacing the T/dot mark with the uppercase first project letter, or with another user-requested mark, then regenerate the Tauri icon assets."
---

# Replace Default Icon

## Workflow

1. Check `git status --short` first and leave unrelated modified files alone.
2. Read `src-tauri/icons/app-icon.svg` and determine the mark:
   - If the user gives a letter, symbol, text, color, or shape instruction, follow it.
   - Otherwise read `src-tauri/tauri.conf.json` `productName`; fall back to `package.json` `name`, then the repo folder name. Use the first alphanumeric character, uppercased.
3. Edit only `src-tauri/icons/app-icon.svg` for the source icon. Keep the rounded icon shape unless the user asks otherwise.
4. Replace the default T and dot with the chosen mark. For the starter placeholder style, use:
   - outer rounded rect: `#bfdbfe`
   - inner rounded rect: `#f8fbff`
   - mark: `#2563eb`
5. Prefer SVG text for simple letters because the local ImageMagick pipeline renders it reliably. Avoid stroke-only paths unless the generated PNG is verified.
6. Run `npm run icons:generate` to regenerate:
   - `src-tauri/icons/32x32.png`
   - `src-tauri/icons/128x128.png`
   - `src-tauri/icons/128x128@2x.png`
   - `src-tauri/icons/icon.png`
   - `src-tauri/icons/icon.icns`
7. Verify with `file src-tauri/icons/*` and preview `src-tauri/icons/icon.png` when image viewing is available.

If generation fails because local tools are missing, report the exact install command shown by `scripts/generate-icons.sh` and do not fake generated assets.
