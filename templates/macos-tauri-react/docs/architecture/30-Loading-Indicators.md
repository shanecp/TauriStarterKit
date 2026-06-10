# Loading Indicator Architecture

The app has three loading and task-continuity patterns with different responsibilities. `PageTopLoadingIndicator` appears in the app shell for transient full-page or blocking command feedback. `OnPageLoadingIndicator` appears inside page content for specific sections, cards, and refreshes. The long-running task registry stores small in-memory metadata for named background workflows that should remain visible across route changes.

## Flow

```text
Feature page
  |
  | calls feature API wrapper
  v
src/features/<feature>/<feature>.api.ts
  |
  | calls tauriInvoke(command, args, { pageTopLoadingIndicatorLabel })
  v
src/shared/lib/tauri.ts
  |
  | startPageTopLoadingIndicator(command, label)
  | call the Tauri invoke bridge
  v
Tauri invoke runs
```

The page-top indicator state is a side channel observed by the app shell:

```text
src/shared/page-top-loading-indicator/pageTopLoadingIndicatorStore.ts
  |
  | notifies PageTopLoadingIndicatorProvider consumers
  v
src/app/layout/PageTopLoadingIndicator.tsx
  |
  | renders status chip and loading-indicator-progress bar
  v
PageTopLoadingIndicator appears with the latest label while active
```

`PageTopLoadingIndicator` is opt-in. A Tauri call without `pageTopLoadingIndicatorLabel` or `pageTopLoadingIndicatorLabels` does not show it. When a labeled Tauri call resolves or rejects, `tauriInvoke` finishes that indicator entry in a `finally` block.

## Long-Running Task Continuity

Use the long-running task registry only for unique workflows where the work is not the same thing as the current page's content loading state.

Flow:

```text
Feature page or action area
  |
  | startLongRunningTask({ key, label, ownerPath })
  v
src/shared/long-running-tasks/longRunningTaskStore.ts
  |
  | stores { key, runId, label, status, timestamps }
  | notifies LongRunningTaskProvider consumers
  v
Persistent shell navigation
  |
  | renders a task marker for configured nav items
  v
User can navigate away and return without caching the page
```

Completion uses the matching `runId` returned by `startLongRunningTask`. This prevents an older async completion from marking a newer run as done for the same key.

Use deterministic task keys for unique workflows:

```text
examples.long-running-task
repositories.batch-processing
repo:<repoId>:batch-processing
```

The registry is in-memory only. It does not use localStorage, IndexedDB, files, SQLite, polling, a Rust task manager, or a backend queue.

The template includes a `Long Running Tasks` sidebar group with three preview routes. Each route starts a separate 20-second simulated task so generated-app users can inspect cross-page `processing` and `done` markers.

## Ownership

`src/shared/lib/tauri.ts` owns the typed option names for page-top labels. Feature API wrappers choose when a command represents full-page or blocking work by passing `pageTopLoadingIndicatorLabel`.

`src/shared/page-top-loading-indicator/pageTopLoadingIndicatorStore.ts` owns concurrent page-top indicator tracking. Each entry gets a unique ID. Overlapping labeled calls keep the indicator visible until each labeled call has finished.

`src/shared/page-top-loading-indicator/PageTopLoadingIndicatorProvider.tsx` provides the store near the app root. `src/shared/page-top-loading-indicator/usePageTopLoadingIndicator.ts` reads a stable snapshot with `useSyncExternalStore`.

`src/app/layout/PageTopLoadingIndicator.tsx` is the only app-shell renderer for page-top indicator state. It renders only while active, and shows the latest label plus a count when more than one entry is active.

`src/shared/long-running-tasks/longRunningTaskStore.ts` owns cross-page task continuity for named workflows. It stores only status metadata, not page content or task results.

`src/shared/long-running-tasks/LongRunningTaskProvider.tsx` provides the in-memory task store near the app root. `src/shared/long-running-tasks/useLongRunningTasks.ts` exposes aggregate state, single-task state, action helpers, and page-visit acknowledgement helpers.

Sidebar items opt in with `longRunningTaskKey`. The sidebar observes task state and renders `processing` or `done` markers, but it does not start, finish, or clear tasks.

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

Use `PageTopLoadingIndicator` for full-page or blocking work, such as large processing tasks where the page should communicate broad app-level waiting.

Use `OnPageLoadingIndicator` for loading or refreshing specific sections of content. It is page-owned and should remain close to the content being loaded.

Use the long-running task registry for named workflows that can continue while the owning page is unmounted. Do not put fetched page data, result payloads, table rows, form state, or normal refresh state in the registry.

When an owning page should acknowledge completed background work, call `useClearCompletedLongRunningTaskOnVisit(taskKey)`. It clears an existing `done` marker when the page is opened and leaves `processing` tasks alone. The page should still reload fresh content through its normal local loading flow.

Toast notifications are separate transient outcome feedback. Loading indicators answer whether work is running. Toasts answer what just happened after an action completes or fails. See `docs/architecture/31-Toast-Notifications.md`.

Do not call `startPageTopLoadingIndicator` or `finishPageTopLoadingIndicator` from feature pages. Route backend calls through feature API wrappers and `tauriInvoke`.

Do not call the Tauri core invoke API directly outside `src/shared/lib/tauri.ts`, because direct calls bypass command typing and activity feedback.

## Button Loading

Shared `Button` supports `loading` and `loadingLabel` for obvious initiating actions. Use this selectively when the clicked button itself needs feedback. Use `PageTopLoadingIndicator` only when the broader page is blocked or processing.

## Content Loading

Shared `OnPageLoadingIndicator` uses the same progress animation inside a content-owned loader box. Use it for page-owned loading and refreshing state, especially when existing content stays visible while work continues.

## Styling

Both indicators use:

```text
.loading-indicator-progress
.loading-indicator-progress__bar
@keyframes loading-indicator-progress
```

The styles live in `src/styles.css` and use app theme tokens, so light and dark modes inherit the existing app palette.
