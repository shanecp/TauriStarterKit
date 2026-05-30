import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-app-error-border bg-app-error-bg px-4 py-3 text-sm text-app-error-ink">
      <AlertTriangle className="mt-0.5 shrink-0" size={17} />
      <div>{message}</div>
    </div>
  );
}
