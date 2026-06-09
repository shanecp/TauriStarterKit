# Toast Notification Architecture

The app uses toast notifications for short-lived action outcomes such as copy, open, save, restart, and command results. Toasts are visual feedback only. They do not keep history, replace inline errors, or replace the global activity indicator.

## Flow

```text
Feature page
  |
  | useNotifications()
  v
src/shared/notifications/useNotifications.ts
  |
  | calls shared notification API
  v
src/shared/notifications/notifications.ts
  |
  | calls React-Toastify
  v
NotificationProvider ToastContainer
```

The provider is mounted once near the app root:

```text
ThemeProvider
  -> ActivityProvider
  -> NotificationProvider
  -> AppLayout
```

## Ownership

`src/shared/notifications/` owns all React-Toastify imports, container configuration, and helper methods.

Feature pages call `useNotifications()` for transient action outcomes. They should not import `react-toastify` directly.

`src/shared/notifications/notifications.ts` exposes tone helpers for `success`, `error`, `warning`, `info`, and `neutral`. It also exposes a command-result helper that maps `CommandResult.success` to success or error toasts.

## Boundaries

Use toasts for short-lived feedback:

```text
Copied JSON
Opened file
Command completed
Command failed
```

Keep durable UI state on the page:

```text
ErrorState
result panels
loading and actionRunning flags
empty and unavailable states
```

Do not emit automatic success or error toasts from `tauriInvoke`. Routine loads and refreshes should keep using local page state plus the top activity indicator.

## Activity Vs Notifications

The activity indicator answers: "Is backend work running right now?"

Toast notifications answer: "What just happened?"

An action can use both. A Tauri call can show top activity while it runs, then the page can show a toast after the action resolves. The page still owns any durable result or error panel.

## Styling

Toast styling lives in `src/styles.css` and uses app theme tokens:

```text
.app-toast-container
.app-toast
.app-toast-progress
```

Light and dark modes inherit the existing success, error, warning, info, and neutral token colors.
