# AGENTS.md

## Principles

- Build __APP_NAME__ as a macOS-only desktop utility. Do not add Windows, Linux, Electron, Next.js, or backend-server support.
- Keep development and production app identities separate: `__APP_DEV_NAME__` uses `__DEV_BUNDLE_ID__`; `__APP_NAME__` uses `__BUNDLE_ID__`.
- Keep code modular by feature. Do not collapse UI pages, API wrappers, and backend commands into a single file.
- Frontend code must call typed Tauri API wrappers. Do not scatter direct `invoke` calls through page components.
- Never expose arbitrary command execution to the frontend.
- All local machine actions must be whitelisted Tauri commands backed by explicit executable paths and safe argument arrays.
- Do not interpolate user input into shell strings.
- User-visible file opening must go through `src/shared/file-opening` and `src-tauri/src/system/file_opening`. Do not expose arbitrary frontend path opening.
- Gracefully handle missing local tools.
- Prefer clear loading, success, error, empty, and unavailable states over silent failures.
- Display calendar dates in AU format `dd/mm/yyyy`; use the shared frontend formatter for UI dates.

## Rust Organization

- Keep Tauri command handlers in `src-tauri/src/commands/` thin; validate inputs, call internal logic, and return frontend-safe results.
- Put OS, filesystem, process, shell-command, and macOS API logic under `src-tauri/src/system/`, grouped by feature.
- Keep serializable frontend/backend DTOs in `src-tauri/src/models/`; do not bury workflow logic in DTO files.
- For large backend features, split `system/<feature>/` by responsibility, such as config, parsing, discovery, planning, execution, and verification.
- Keep `src-tauri/src/lib.rs` focused on app setup, managed state, plugins, and command registration.

## TypeScript Organization

- Keep feature pages as orchestration. Move substantial cards, panels, tables, forms, and display helpers into `src/features/<feature>/components/`.

## Validation

- After adding features or making major changes, run:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run build`
  - `cd src-tauri && cargo test`
  - `cd src-tauri && cargo fmt --check`
  - `cd src-tauri && cargo clippy --all-targets --all-features -- -D warnings`
