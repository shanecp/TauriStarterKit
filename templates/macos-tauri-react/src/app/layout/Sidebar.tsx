import { ChevronRight } from "lucide-react";

import { APP_META } from "../../shared/appMeta";
import { BUILD_LABEL } from "../../shared/buildInfo";
import { sidebarItems } from "../routes";

type SidebarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
};

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-app-border bg-app-panel">
      <div className="border-b border-app-border px-5 py-5">
        <div className="text-lg font-semibold tracking-normal">{APP_META.name}</div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === currentPath;
            const hasActiveChild = item.children?.some(
              (child) => child.path === currentPath,
            );

            return (
              <div key={item.label}>
                {item.path ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path as string)}
                    className={navClass(isActive)}
                  >
                    {Icon ? <Icon size={17} /> : null}
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <div
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      hasActiveChild ? "text-app-ink" : "text-app-muted"
                    }`}
                  >
                    {Icon ? <Icon size={17} /> : null}
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      size={15}
                      className={hasActiveChild ? "rotate-90" : "rotate-90 opacity-50"}
                    />
                  </div>
                )}

                {item.children ? (
                  <div className="ml-5 mt-1 space-y-1 border-l border-app-border pl-3">
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        type="button"
                        onClick={() => onNavigate(child.path)}
                        className={childClass(child.path === currentPath)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-auto px-2 pt-6 text-center text-xs text-app-muted">
          {BUILD_LABEL}
        </div>
      </nav>
    </aside>
  );
}

function navClass(active: boolean): string {
  return `flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
    active
      ? "bg-app-accent-soft text-app-accent"
      : "text-app-muted hover:bg-app-subtle hover:text-app-ink"
  }`;
}

function childClass(active: boolean): string {
  return `block w-full rounded-md px-3 py-2 text-left text-sm transition ${
    active
      ? "bg-app-accent-soft text-app-accent"
      : "text-app-muted hover:bg-app-subtle hover:text-app-ink"
  }`;
}
