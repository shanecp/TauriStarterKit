import type { ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
};

export function PageHeader({ actions }: PageHeaderProps) {
  if (!actions) {
    return null;
  }

  return (
    <div className="mb-5 flex items-start justify-end gap-4">
      <div className="shrink-0">{actions}</div>
    </div>
  );
}

