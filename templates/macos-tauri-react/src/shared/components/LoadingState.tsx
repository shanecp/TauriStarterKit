export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-app-border bg-app-panel px-4 py-3 text-sm text-app-muted">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-app-accent" />
      <span>{label}</span>
    </div>
  );
}
