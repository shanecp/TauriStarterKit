import { ChevronRight, Home } from "lucide-react";

import type { BreadcrumbItem } from "../routes";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
};

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span
            key={`${item.label}-${item.path ?? index}`}
            className="flex min-w-0 items-center gap-2"
          >
            {index > 0 ? (
              <ChevronRight size={14} className="shrink-0 text-app-muted" />
            ) : null}
            {item.path && !isLast ? (
              <button
                type="button"
                onClick={() => onNavigate(item.path as string)}
                className="inline-flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-app-muted transition hover:bg-app-subtle hover:text-app-ink"
              >
                {index === 0 ? <Home size={14} className="shrink-0" /> : null}
                <span className="truncate">{item.label}</span>
              </button>
            ) : (
              <span className="inline-flex min-w-0 items-center gap-1 px-2 py-1 text-sm font-semibold text-app-ink">
                {index === 0 ? <Home size={14} className="shrink-0" /> : null}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
