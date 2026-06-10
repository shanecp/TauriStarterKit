# Main Interface Architecture

The template uses a fixed desktop shell for macOS utility apps. The shell is owned by `src/app/layout/AppLayout.tsx` and keeps global navigation, breadcrumbs, page-top loading feedback, and page content separate.

## Shell

Flow:

```text
src/app/App.tsx
  -> ThemeProvider
  -> PageTopLoadingIndicatorProvider
  -> LongRunningTaskProvider
  -> NotificationProvider
  -> AppLayout
```

`AppLayout` owns client-side navigation state. It reads the current route from `src/app/routes.tsx`, renders `Sidebar`, then renders breadcrumbs and the feature page in `main`.

Keep feature pages focused on their own workflow. Do not put sidebar state, route matching, theme setup, notification mounting, page-top loading state, or long-running task store setup in feature pages.

## Title Separator

The root app shell has a subtle top border. This creates a visible boundary below the macOS title bar so sidebar and content backgrounds do not blend into the window chrome.

Use theme tokens for this separator:

```text
border-app-border
```

Do not hard-code separator colors in layout components. Update `src/styles.css` theme tokens instead.

## Sidebar

Sidebar navigation is configured in `src/app/routes.tsx` through `sidebarItems`.

Add a page:

```text
1. Add the page component under src/features/<feature>/.
2. Add a route to routes.
3. Add a sidebar item or child item when the page should be user-visible.
4. Add breadcrumbs for the route.
```

Nested routes should keep their parent sidebar item active. Use child paths under the parent route, such as:

```text
/examples/forms
/examples/forms/new
/examples/forms/edit
```

`Sidebar` treats child routes as active when the current path starts with the child path.

Sidebar items can opt in to long-running task continuity with `longRunningTaskKey`. The sidebar only observes matching task state and renders a processing or done marker; pages and action areas own starting, completing, and acknowledging those tasks.

The template includes a `Long Running Tasks` preview group with three child pages. Each page starts a separate simulated task so the sidebar markers can be inspected while navigating between pages.

## Sidebar Size

Sidebar width is configured in `src/app/layout/sidebarConfig.ts`.

Default:

```text
resizeMode: "fixed"
defaultWidth: 288
minWidth: 224
maxWidth: 420
```

Use `resizeMode: "resizable"` only when the generated app has dense navigation labels or user-controlled workspaces that benefit from width control.

## Window Size

The Tauri config sets minimum window dimensions:

```text
minWidth: 960
minHeight: 680
```

Startup sizing is applied in `src-tauri/src/system/window_sizing.rs`. The default target is 80% of the primary screen, clamped to the minimum size.

Change window sizing in Rust when the app needs a different startup rule. Change `tauri.conf.json` when the app needs different minimum bounds.

## Breadcrumbs

Breadcrumbs are route-owned. Add them in `src/app/routes.tsx`; do not render custom breadcrumbs inside feature pages.

Use breadcrumbs to expose workflow state that changes the page identity:

```text
Dashboard > Examples > Forms > Edit Form
```

Use local component state for small panels that do not change page identity.
