# AGENTS.md

## Principles

- Build macOS-only Tauri desktop utilities. Do not add Windows, Linux, Electron, Next.js, or backend-server support.
- Keep development and production app identities separate with distinct app names and bundle identifiers.
- Keep frontend pages, shared UI, typed Tauri API wrappers, and Rust commands modular by feature.
- Frontend code must call typed Tauri API wrappers. Do not scatter direct `invoke` calls through page components.
- Never expose arbitrary command execution to the frontend.
- All local machine actions must be whitelisted Tauri commands backed by explicit executable paths and safe argument arrays.
- Do not interpolate user input into shell strings.
- User-visible file opening must go through `src/shared/file-opening` and `src-tauri/src/system/file_opening`. Do not expose arbitrary frontend path opening.
- Treat privileged system files as read-only unless a generated app explicitly adds a safe, whitelisted workflow.
- Gracefully handle missing local tools.
- Prefer clear loading, success, error, empty, and unavailable states over silent failures.
- Display calendar dates in AU format `dd/mm/yyyy`; use the shared frontend formatter for UI dates.

## Validation

- After package, template, or generator changes, run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run validate-template`.
- After template app changes, also run the generated-app checks listed in `templates/macos-tauri-react/AGENTS.md`.
