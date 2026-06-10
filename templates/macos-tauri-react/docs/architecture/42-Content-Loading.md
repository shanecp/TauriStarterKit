# Content Loading Patterns

Use content loading examples to show local request state, `PageTopLoadingIndicator`, `OnPageLoadingIndicator`, button loading, and toast outcomes without mixing responsibilities.

## Files

```text
src/features/examples/ContentLoadingPage.tsx
src/shared/hooks/useAsyncResource.ts
src/shared/components/OnPageLoadingIndicator.tsx
src/shared/components/ErrorState.tsx
src/shared/components/Button.tsx
src/shared/lib/tauri.ts
src/shared/long-running-tasks/
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

Use `OnPageLoadingIndicator` for page content that is not ready yet or for a specific section that is refreshing. Use `ErrorState` for durable errors that the user may need to read or retry.

`OnPageLoadingIndicator` includes the shared animated progress bar, but it lives inside the page-owned loader box. This keeps local loading visible without implying the whole page is blocked.

## Button Loading

Use `Button loading` only when the clicked button itself starts the work.

Good examples:

```text
Save
Refresh
Run
Install
```

Avoid putting spinners on every control. Use disabled state for duplicate-action protection, `OnPageLoadingIndicator` for section work, and `PageTopLoadingIndicator` only for full-page or blocking work.

## Page-Top Loading

Typed Tauri API wrappers call through `src/shared/lib/tauri.ts`. Pass `pageTopLoadingIndicatorLabel` only when the work should show `PageTopLoadingIndicator`.

Do not call the page-top loading store directly from feature pages. Add or override the page-top label in the API wrapper layer.

## Toasts

Use toasts for short-lived outcomes:

```text
Loading demo completed.
Saved.
Copied.
Refresh failed.
```

Toasts should not replace `OnPageLoadingIndicator`, `PageTopLoadingIndicator`, inline errors, empty states, unavailable states, or result panels.

## Long-Running Tasks

Long-running task continuity is separate from content loading. Use it only for named background workflows that should remain visible in persistent navigation while the owning page is unmounted.

Do not move page data, refresh state, table rows, form state, or normal fetch results into `src/shared/long-running-tasks`.

The template has two demos:

- `ContentLoadingPage` includes a small named-task example beside the local loading examples.
- The `Long Running Tasks` sidebar group has three standalone pages with 20-second simulated tasks for inspecting cross-page continuity.

## Refresh

Refresh buttons should keep the existing data visible while a refresh is running when possible. Show `OnPageLoadingIndicator` near the refreshing content and keep destructive actions disabled if duplicate work would be unsafe.

The template example uses `PageTopLoadingIndicator` for the initial page load, then delays manual refresh for 20 seconds so the refresh button, `OnPageLoadingIndicator`, and status badge can be inspected. Refresh intentionally does not show `PageTopLoadingIndicator`.

The example API wrapper returns a browser-preview response when the Tauri bridge is unavailable. Real app features should call their typed Tauri wrappers and only add preview fallbacks when the generated app intentionally supports browser-only demos.
