import { useActivity } from "../../shared/activity/useActivity";

export function TopBar() {
  const activity = useActivity();
  const extraActivityCount = Math.max(0, activity.activeCount - 1);
  const activityLabel = activity.latestLabel ?? "Working";

  if (!activity.isActive) {
    return null;
  }

  return (
    <header className="border-b border-app-border bg-app-panel px-8 py-5">
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-4">
        <div
          role="status"
          aria-live="polite"
          className="inline-flex max-w-full items-center gap-2 rounded-md border border-app-border bg-app-subtle px-3 py-2 text-sm font-medium text-app-ink"
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-app-accent" />
          <span className="truncate">
            {activityLabel}
            {extraActivityCount > 0 ? ` +${extraActivityCount}` : ""}
          </span>
        </div>
      </div>
      <div className="activity-progress mt-4" aria-hidden="true">
        <div className="activity-progress__bar" />
      </div>
    </header>
  );
}
