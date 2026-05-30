type StatusBadgeProps = {
  label: string;
  tone?: "success" | "error" | "warning" | "neutral" | "info";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const toneClass = {
    success: "border-app-success-border bg-app-success-bg text-app-success-ink",
    error: "border-app-error-border bg-app-error-bg text-app-error-ink",
    warning: "border-app-warning-border bg-app-warning-bg text-app-warning-ink",
    neutral: "border-app-neutral-border bg-app-neutral-bg text-app-neutral-ink",
    info: "border-app-info-border bg-app-info-bg text-app-info-ink",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}
    >
      {label}
    </span>
  );
}
