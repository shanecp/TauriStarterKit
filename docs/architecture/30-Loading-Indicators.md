# Loading Indicator Architecture

This repository has two documentation surfaces for loading and long-running task behavior:

- `packages/macos-desktop-kit` exports reusable frontend utilities for package consumers.
- `templates/macos-tauri-react` carries a self-contained copy for generated apps.

Keep both surfaces behaviorally aligned when changing shared loading or task-continuity infrastructure.

## Patterns

Use three separate patterns:

- `PageTopLoadingIndicator` for transient full-page or blocking command feedback.
- `OnPageLoadingIndicator` for page-owned content loading, refreshes, and section state.
- `LongRunningTaskStore` for small in-memory metadata about named background workflows that should remain visible across route changes.

Do not store page content, result payloads, form state, table rows, or normal refresh state in the long-running task registry.

## Long-Running Task Registry

Flow:

```text
Feature page or action area
  |
  | startLongRunningTask({ key, label, ownerPath })
  v
LongRunningTaskStore
  |
  | stores { key, runId, label, status, timestamps }
  | notifies useSyncExternalStore subscribers
  v
Persistent shell navigation
  |
  | renders a spinner or done marker for configured task keys
  v
User can navigate away and return without caching the page
```

The registry is frontend in-memory only. It must not use localStorage, IndexedDB, files, SQLite, polling, a Rust task manager, or a backend queue.

Use deterministic keys for unique workflows:

```text
repositories.batch-processing
repositories.download-data
repo:<repoId>:batch-processing
```

Each started task receives a `runId`. Completion and cleanup helpers compare the current `runId`, so stale async completions cannot mark a newer run for the same key as done.

## Package Surface

The package implementation lives under:

```text
packages/macos-desktop-kit/src/long-running-tasks/
```

Exported pieces:

- `LongRunningTaskProvider`
- `LongRunningTaskStore`
- `useLongRunningTasks()`
- `useLongRunningTask(taskKey)`
- `useLongRunningTaskActions()`
- `useClearCompletedLongRunningTaskOnVisit(taskKey)`
- module-level helpers such as `startLongRunningTask`, `completeLongRunningTask`, `clearLongRunningTask`, and `trackLongRunningTask`

The package entry point exports the module through `packages/macos-desktop-kit/src/index.ts`.

## Template Surface

The template copy lives under:

```text
templates/macos-tauri-react/src/shared/long-running-tasks/
```

`src/app/App.tsx` mounts `LongRunningTaskProvider` near the app root so route changes do not reset the registry.

`src/app/routes.tsx` lets sidebar items opt in with `longRunningTaskKey`. `Sidebar` observes matching task state and renders:

- spinner marker for `processing`
- done marker for `done`
- no marker for idle or missing task state

The sidebar must only observe task state. Feature pages or action areas start, complete, and clear tasks.

## Page Visit Acknowledgement

Use `useClearCompletedLongRunningTaskOnVisit(taskKey)` when opening the owning page should acknowledge completed work. The hook clears an existing `done` marker for that task key and leaves `processing` entries intact.

Normal page loading still belongs to the page. Opening the owning page should fetch fresh content through its local loading flow rather than reusing data from the task registry.

## Preview

The generated template includes a `Long Running Tasks` sidebar group with three preview routes. Each route starts a separate 20-second simulated task so generated-app users can inspect cross-page `processing` and `done` sidebar markers.
