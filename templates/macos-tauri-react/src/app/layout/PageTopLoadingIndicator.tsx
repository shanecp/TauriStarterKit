import { usePageTopLoadingIndicator } from "../../shared/page-top-loading-indicator/usePageTopLoadingIndicator";

export function PageTopLoadingIndicator() {
  const pageTopLoadingIndicator = usePageTopLoadingIndicator();
  const extraPageTopLoadingIndicatorCount = Math.max(
    0,
    pageTopLoadingIndicator.activeCount - 1,
  );
  const pageTopLoadingIndicatorLabel =
    pageTopLoadingIndicator.latestLabel ?? "Working";

  if (!pageTopLoadingIndicator.isActive) {
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
            {pageTopLoadingIndicatorLabel}
            {extraPageTopLoadingIndicatorCount > 0
              ? ` +${extraPageTopLoadingIndicatorCount}`
              : ""}
          </span>
        </div>
      </div>
      <div className="loading-indicator-progress mt-4" aria-hidden="true">
        <div className="loading-indicator-progress__bar" />
      </div>
    </header>
  );
}
