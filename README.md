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

## Reuse The Package

`packages/macos-desktop-kit` exports stable frontend utilities for apps that want dependency-style reuse: shared components, theme helpers, settings storage, refresh hooks, formatting helpers, and typed Tauri invoke helpers.

Generated apps do not depend on this package by default. The template stays self-contained so a generated app can evolve independently.

## Validate

```sh
npm install
npm run build
npm test
npm run validate-template
```

The generated app should also pass:

```sh
npm run build
npm test
cd src-tauri && cargo test && cargo fmt --check
cd ..
npm run tauri:build
npm run release:local -- --dry-run
```
