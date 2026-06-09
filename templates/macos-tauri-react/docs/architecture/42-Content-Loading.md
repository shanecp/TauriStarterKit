# Content Loading Patterns

Use content loading examples to show local request state, global activity feedback, button loading, and toast outcomes without mixing responsibilities.

## Files

```text
src/features/examples/ContentLoadingPage.tsx
src/shared/hooks/useAsyncResource.ts
src/shared/components/LoadingState.tsx
src/shared/components/ErrorState.tsx
src/shared/components/Button.tsx
src/shared/lib/tauri.ts
```

## Local State

Feature pages own durable request state:

```text
isInitialLoading
isRefreshing
error
data
lastUpdatedAt
```

Use `LoadingState` for page content that is not ready yet. Use `ErrorState` for durable errors that the user may need to read or retry.

`LoadingState` includes the same animated `activity-progress` bar used by the app shell, but it lives inside the page-owned loader box. This keeps local loading visible even when the global top indicator is not present.

## Button Loading

Use `Button loading` only when the clicked button itself starts the work.

Good examples:

```text
Save
Refresh
Run
Install
```

Avoid putting spinners on every control. Use disabled state for duplicate-action protection and global activity feedback for backend work.

## Global Activity

Typed Tauri API wrappers call through `src/shared/lib/tauri.ts`, which starts and finishes global activity labels.

Do not call the global activity store directly from feature pages. Add or override the command label in the API wrapper layer.

## Toasts

Use toasts for short-lived outcomes:

```text
Loading demo completed.
Saved.
Copied.
Refresh failed.
```

Toasts should not replace inline loading, error, empty, unavailable, or result panels.

## Refresh

Refresh buttons should keep the existing data visible while a refresh is running when possible. Show a local refreshing state and keep destructive actions disabled if duplicate work would be unsafe.

The template example keeps the first load fast, then delays manual refresh for 20 seconds so the refresh button, page loading state, status badge, and global activity feedback can be inspected.

The example API wrapper returns a browser-preview response when the Tauri bridge is unavailable. Real app features should call their typed Tauri wrappers and only add preview fallbacks when the generated app intentionally supports browser-only demos.
