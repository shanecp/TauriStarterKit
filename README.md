# TauriStarterKit

Private macOS-only Tauri + React starter kit extracted from Prism.

## Use The Template

Generate a new app from the self-contained template:

```sh
npm run create-app -- \
  --app-name "Sample Utility" \
  --app-slug sample-utility \
  --package-name sample-utility \
  --bundle-id com.shaneperera.sampleutility \
  --dest /Users/shane/www/my_projects_code/SampleUtility \
  --install
```

Then run the app:

```sh
cd /Users/shane/www/my_projects_code/SampleUtility
npm run tauri:dev
```

Generated apps include project Codex skills under `.codex/skills`:

- `$<app-slug>-build-and-release` runs checks, bumps, builds, installs, and opens a local release.
- `$<app-slug>-change-ui-theme` explicitly previews and applies light/dark UI palettes.
- `$<app-slug>-replace-default-icon` explicitly replaces the placeholder Tauri icon mark and regenerates icon assets.

## Reuse The Package

`packages/macos-desktop-kit` exports stable frontend utilities for apps that want dependency-style reuse: shared components, activity/loading helpers, toast notification helpers, theme helpers, settings storage, preferred-editor file-opening helpers, refresh hooks, formatting helpers, and typed Tauri invoke helpers.

Generated apps do not depend on this package by default. The template stays self-contained so a generated app can evolve independently.

## Activity Indicators

Template doc: [Activity Indicator Architecture](templates/macos-tauri-react/docs/architecture/30-Activity-Indicators.md).

Use `ActivityProvider` near the app root, render `useActivity()` in the app shell, and route backend calls through `tauriInvoke` or `createTauriInvoke`. The invoke helpers start and finish activity entries with unique IDs, so overlapping commands keep the global indicator visible until all work finishes.

Use command label maps for app-specific copy:

```ts
const invokeCommand = createTauriInvoke<AppCommand>({
  example_ping: "Checking backend",
});
```

Use `Button loading loadingLabel="..."` only on obvious initiating actions. Keep page-level disabled/busy state responsible for blocking unsafe duplicate actions.

## Toast Notifications

Template doc: [Toast Notification Architecture](templates/macos-tauri-react/docs/architecture/31-Toast-Notifications.md).

Use `NotificationProvider` once near the app root and call `useNotifications()` from feature pages for short-lived action outcomes. The shared notification API owns React-Toastify imports, tone mapping, container defaults, and command-result helpers.

Activity indicators show that backend work is running. Toast notifications show what just happened after an explicit action completes or fails.

## Validate

```sh
npm install
npm run typecheck
npm run lint
npm run build
npm test
npm run validate-template
npm audit --audit-level=critical
```

The generated app should also pass:

```sh
npm run typecheck
npm run lint
npm run build
npm test
cd src-tauri
cargo test
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cd ..
npm audit --audit-level=critical
npm run tauri:build
npm run release:local -- --dry-run
```
