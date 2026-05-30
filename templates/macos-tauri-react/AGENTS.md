# AGENTS.md

## Principles

- Build __APP_NAME__ as a macOS-only desktop utility. Do not add Windows, Linux, Electron, Next.js, or backend-server support.
- Keep development and production app identities separate: `__APP_DEV_NAME__` uses `__DEV_BUNDLE_ID__`; `__APP_NAME__` uses `__BUNDLE_ID__`.
- Keep code modular by feature. Do not collapse UI pages, API wrappers, and backend commands into a single file.
- Frontend code must call typed Tauri API wrappers. Do not scatter direct `invoke` calls through page components.
- Never expose arbitrary command execution to the frontend.
- All local machine actions must be whitelisted Tauri commands backed by explicit executable paths and safe argument arrays.
- Do not interpolate user input into shell strings.
- Gracefully handle missing local tools.
- Prefer clear loading, success, error, empty, and unavailable states over silent failures.
- Display calendar dates in AU format `dd/mm/yyyy`; use the shared frontend formatter for UI dates.
