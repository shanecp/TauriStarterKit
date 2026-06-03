import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function Button({
  variant = "secondary",
  className = "",
  loading = false,
  loadingLabel = "Working",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary:
      "bg-app-accent text-white hover:bg-app-accent-hover disabled:opacity-50",
    secondary:
      "border border-app-border bg-app-panel text-app-ink hover:bg-app-subtle disabled:text-app-muted",
    ghost:
      "text-app-muted hover:bg-app-subtle hover:text-app-ink disabled:text-app-muted",
  }[variant];

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={15} className="shrink-0 animate-spin" aria-hidden="true" />
      ) : null}
      {children}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
    </button>
  );
}
