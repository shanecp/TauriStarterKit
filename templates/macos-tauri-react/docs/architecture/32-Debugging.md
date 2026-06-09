# Debugging Options

Use `npm run tauri:dev` as the default debugging loop. It starts the Vite dev server, opens the Tauri webview, and keeps the app running with the development app name and bundle identifier.

## Default Dev Loop

```sh
npm run tauri:dev
```

Flow:

```text
npm run tauri:dev
  -> src-tauri/tauri.dev.conf.json
  -> src-tauri/tauri.conf.json build.beforeDevCommand
  -> npm run dev
  -> Vite serves http://127.0.0.1:1420
  -> Tauri loads that URL in the app webview
```

Frontend edits use Vite hot module replacement when the changed module supports it. Rust edits under `src-tauri` rebuild and restart the Tauri app; they do not preserve app state like frontend hot module replacement.

If generated Rust files or build artifacts cause noisy restarts, add a `.taurignore` file under `src-tauri`. If a feature depends on extra local paths, add them to `build.additionalWatchFolders` in `src-tauri/tauri.conf.json`.

## Webview Inspector

Use the WebKit inspector for frontend debugging:

```text
Cmd + Option + I
```

Right-clicking in the webview and choosing inspect also opens it when the context menu is available. Use it for DOM inspection, CSS, console output, network requests, and frontend source maps.

Browser preview is only useful before Tauri APIs are involved. Once a page calls typed Tauri API wrappers, debug it in the Tauri webview so command calls, permissions, and app context are real.

## Rust Console

Backend logs, Rust compiler output, panics, and `println!` output appear in the terminal running `npm run tauri:dev`.

Use backtraces when a backend panic or startup failure needs stack detail:

```sh
RUST_BACKTRACE=1 npm run tauri:dev
```

Keep temporary debug code behind debug-only checks:

```text
cfg!(debug_assertions)
#[cfg(debug_assertions)]
tauri::is_dev()
```

## Debug Build

Use a debug bundle when you need to inspect behavior outside the live dev loop without making a release build:

```sh
npm run tauri:build -- --debug
```

The app bundle is written under `src-tauri/target/debug/bundle`. Run it from a terminal when you need stdout, panic output, or startup errors that disappear when launched from Finder.

## Rust Breakpoints

Use LLDB through an editor when Rust control flow matters more than UI iteration.

Flow:

```text
npm run dev
  -> starts Vite on http://127.0.0.1:1420
editor debugger
  -> builds and launches the src-tauri debug binary
  -> attaches Rust breakpoints
```

This is slower than `npm run tauri:dev`, but it is the right tool for command handlers, managed state, async tasks, process handling, filesystem code, and macOS API code.

## Logging Plugin

Add the Tauri log plugin only when app logs need to survive beyond the terminal session or when Rust logs should appear in the webview console.

Useful targets:

- `Stdout` for terminal logs.
- `Webview` for Rust logs in the inspector console.
- `LogDir` for persistent logs under the app log directory.

If frontend code uses the plugin bindings, add the matching capability permission. Keep log messages frontend-safe and avoid secrets, raw tokens, or private filesystem details unless the app explicitly needs them for a trusted diagnostic workflow.

## CrabNebula DevTools

CrabNebula DevTools is optional instrumentation for deeper Tauri debugging. It can inspect logs, Tauri command calls, payloads, responses, events, and spans in real time.

Use it when normal terminal logs and the WebKit inspector are not enough. Initialize it only in debug builds with `#[cfg(debug_assertions)]`; do not make it part of the production app path.

## In-App Diagnostics

For app-specific diagnostics, add a dedicated feature page or panel with explicit, frontend-safe commands.

Good diagnostics:

- Show app version, environment, bundle identifier, and relevant local tool availability.
- Export structured JSON snapshots for a single feature.
- Include copy buttons for safe debug fields that a user can paste into a bug report.
- Keep raw privileged system files read-only.

Avoid diagnostics that expose arbitrary command execution, arbitrary path opening, secrets, tokens, or broad filesystem reads. Route every diagnostic through a typed frontend API wrapper and a whitelisted Rust command.

## References

- Tauri develop guide: https://v2.tauri.app/develop/
- Tauri debug guide: https://v2.tauri.app/develop/debug/
- Tauri VS Code debugging: https://v2.tauri.app/develop/debug/vscode/
- Tauri logging plugin: https://v2.tauri.app/plugin/logging/
- CrabNebula DevTools: https://v2.tauri.app/develop/debug/crabnebula-devtools/
