# __APP_NAME__

__APP_NAME__ is a macOS-only Tauri + React desktop utility generated from TauriStarterKit.

## Development

```sh
npm install
npm run tauri:dev
```

Development identity:

- App name: `__APP_DEV_NAME__`
- Bundle identifier: `__DEV_BUNDLE_ID__`

Production identity:

- App name: `__APP_NAME__`
- Bundle identifier: `__BUNDLE_ID__`

## Scripts

```sh
npm run build
npm test
npm run tauri:build
npm run release:local -- --dry-run
```

Local install scripts use `~/Applications` by default. Override paths with:

- `__INSTALL_ENV_PREFIX___SOURCE_APP`
- `__INSTALL_ENV_PREFIX___INSTALL_DIR`

## Icons

The placeholder icon source is `src-tauri/icons/app-icon.svg`. Replace it for the app, then run:

```sh
npm run icons:generate
```

## Architecture

- Add UI features under `src/features/<feature-name>`.
- Add typed frontend API wrappers in feature-owned `*.api.ts` files.
- Add whitelisted Rust commands under `src-tauri/src/commands`.
- Register commands explicitly in `src-tauri/src/lib.rs`.
- Keep frontend pages calling typed API wrappers, not the Tauri core invoke API directly.
- Do not expose arbitrary command execution.
- Open user-visible files through `src/shared/file-opening` and backend-resolved paths passed to `src-tauri/src/system/file_opening`.
