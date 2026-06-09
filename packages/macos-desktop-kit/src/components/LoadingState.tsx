export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-md border border-app-border bg-app-panel px-4 py-3 text-sm text-app-muted">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-app-accent" />
        <span>{label}</span>
      </div>
      <div className="activity-progress mt-3" aria-hidden="true">
        <div className="activity-progress__bar" />
      </div>
    </div>
  );
}
