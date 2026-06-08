# Activity Indicator Architecture

The app shows global progress for backend work through a non-blocking activity indicator in the top bar. It is visual feedback only. It does not block the page, keep a history, or replace feature-owned loading and error state.

## Flow

```text
Feature page
  |
  | calls feature API wrapper
  v
src/features/<feature>/<feature>.api.ts
  |
  | calls tauriInvoke(command, args)
  v
src/shared/lib/tauri.ts
  |
  | startGlobalActivity(command, label)
  | call the Tauri invoke bridge
  v
Tauri invoke runs
```

The activity state is a side channel observed by the app shell:

```text
src/shared/activity/activityStore.ts
  |
  | notifies ActivityProvider consumers
  v
src/app/layout/TopBar.tsx
  |
  | renders status chip and activity-progress bar
  v
TopBar shows latest label while any activity is active
```

When the Tauri call resolves or rejects, `tauriInvoke` finishes the specific activity ID in a `finally` block. The top bar returns to idle when all activity IDs have finished.

## Ownership

`src/shared/lib/tauri.ts` owns the mapping from app commands to user-visible activity labels. This keeps labels consistent and avoids scattering top-bar feedback through feature pages.

`src/shared/activity/activityStore.ts` owns concurrent activity tracking. Each activity gets a unique ID. Overlapping backend calls keep the indicator visible until each call has finished.

`src/shared/activity/ActivityProvider.tsx` provides the store near the app root. `src/shared/activity/useActivity.ts` reads a stable snapshot with `useSyncExternalStore`.

`src/app/layout/TopBar.tsx` is the only app-shell renderer for the global activity state. It shows the latest label and a count when more than one activity is active.

## Boundaries

Feature pages should continue to own local request state:

```text
loading
actionRunning
error
empty
unavailable
result data
```

Use local state for page content, button disabled states, duplicate-action protection, and inline errors.

Use global activity for passive shell feedback that a Tauri call is in progress.

Toast notifications are separate transient outcome feedback. Activity answers whether backend work is running. Toasts answer what just happened after an action completes or fails. See `docs/architecture/31-Toast-Notifications.md`.

Do not call `startGlobalActivity` or `finishGlobalActivity` from feature pages. Route backend calls through feature API wrappers and `tauriInvoke`.

Do not call the Tauri core invoke API directly outside `src/shared/lib/tauri.ts`, because direct calls bypass command typing and activity feedback.

## Button Loading

Shared `Button` supports `loading` and `loadingLabel` for obvious initiating actions. Use this selectively when the clicked button itself needs feedback. The top-bar indicator remains the default app-wide feedback for backend work.

## Styling

The top-bar progress bar uses:

```text
.activity-progress
.activity-progress__bar
@keyframes activity-progress
```

The styles live in `src/styles.css` and use app theme tokens, so light and dark modes inherit the existing app palette.
