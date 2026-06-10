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
npm run typecheck
npm run lint
npm run build
npm test
npm run tauri:build
npm run release:local -- --dry-run
```

Local install scripts use `~/Applications` by default. Override paths with:

- `__INSTALL_ENV_PREFIX___SOURCE_APP`
- `__INSTALL_ENV_PREFIX___INSTALL_DIR`

## Codex Skills

Project skills live in `.codex/skills`:

- `$__APP_SLUG__-build-and-release` runs checks, bumps, builds, installs, and opens a local release.
- `$__APP_SLUG__-change-ui-theme` explicitly previews and applies light/dark UI palettes.
- `$__APP_SLUG__-replace-default-icon` explicitly replaces the placeholder Tauri icon mark and regenerates icon assets.

## Icons

The placeholder icon source is `src-tauri/icons/app-icon.svg`. Use `$__APP_SLUG__-replace-default-icon`, or replace it manually for the app, then run:

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
- Use `src/shared/notifications` for transient action feedback. Do not import `react-toastify` from feature pages.

Architecture docs:

- [Main Interface Architecture](docs/architecture/10-Main-Interface.md)
- [Theme Customisation](docs/architecture/20-ThemeCustomisation.md)
- [Loading Indicator Architecture](docs/architecture/30-Loading-Indicators.md)
- [Toast Notification Architecture](docs/architecture/31-Toast-Notifications.md)
- [Debugging Options](docs/architecture/32-Debugging.md)
- [Data Table Patterns](docs/architecture/40-Data-Tables.md)
- [Form Patterns](docs/architecture/41-Forms.md)
- [Content Loading Patterns](docs/architecture/42-Content-Loading.md)
- [Syntax Highlighting](docs/architecture/43-Syntax-Highlighting.md)

## Debugging

Architecture doc: [Debugging Options](docs/architecture/32-Debugging.md).

Use `npm run tauri:dev` for the default loop. Frontend edits hot reload through Vite, while Rust edits rebuild and restart the Tauri app. Use the WebKit inspector, terminal Rust logs, debug builds, LLDB, the Tauri log plugin, or CrabNebula DevTools depending on the issue.

## Loading Indicators

Architecture doc: [Loading Indicator Architecture](docs/architecture/30-Loading-Indicators.md).

The template includes page-top loading tracking in `src/shared/page-top-loading-indicator`. Commands invoked through `src/shared/lib/tauri.ts` show `PageTopLoadingIndicator` only when they pass `pageTopLoadingIndicatorLabel` or a matching `pageTopLoadingIndicatorLabels` map.

Use `PageTopLoadingIndicator` for full-page or blocking work. Use `OnPageLoadingIndicator` for loading or refreshing specific content sections. Use the shared `Button` `loading` prop only on buttons that clearly start work, and keep local disabled state for preventing unsafe duplicate actions.

## Toast Notifications

Architecture doc: [Toast Notification Architecture](docs/architecture/31-Toast-Notifications.md).

The template includes transient notification support in `src/shared/notifications`. Mounting happens in `src/app/App.tsx`; feature pages call `useNotifications()` for explicit action outcomes such as copy, open, save, and command completion.

Toasts do not keep history and should not replace `ErrorState`, result panels, `OnPageLoadingIndicator`, or `PageTopLoadingIndicator`. See `docs/architecture/31-Toast-Notifications.md`.
