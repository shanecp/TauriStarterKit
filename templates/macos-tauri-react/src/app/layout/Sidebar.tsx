import { CheckCircle2, ChevronRight, LoaderCircle } from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { APP_META } from "../../shared/appMeta";
import { BUILD_LABEL } from "../../shared/buildInfo";
import { useLongRunningTask } from "../../shared/long-running-tasks";
import { sidebarItems } from "../routes";
import { clampSidebarWidth, sidebarConfig } from "./sidebarConfig";

type SidebarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
};

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [sidebarWidth, setSidebarWidth] = useState(sidebarConfig.defaultWidth);
  const isResizable = sidebarConfig.resizeMode === "resizable";

  const activeGroupLabels = useMemo(
    () =>
      sidebarItems
        .filter((item) =>
          item.children?.some((child) => isPathActive(currentPath, child.path)),
        )
        .map((item) => item.label),
    [currentPath],
  );

  useEffect(() => {
    setCollapsedGroups((current) => {
      let changed = false;
      const next = new Set(current);

      activeGroupLabels.forEach((label) => {
        if (next.delete(label)) {
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [activeGroupLabels]);

  function toggleGroup(label: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  function startResize(event: ReactMouseEvent<HTMLDivElement>) {
    if (!isResizable) {
      return;
    }

    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    function onMouseMove(moveEvent: MouseEvent) {
      const nextWidth = startWidth + moveEvent.clientX - startX;
      setSidebarWidth(clampSidebarWidth(nextWidth));
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  return (
    <aside
      className="relative flex h-screen shrink-0 flex-col border-r border-app-border bg-app-panel"
      style={{ width: `${clampSidebarWidth(sidebarWidth)}px` }}
    >
      <div className="border-b border-app-border px-5 py-5">
        <div className="text-lg font-semibold tracking-normal">{APP_META.name}</div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path ? isPathActive(currentPath, item.path) : false;
            const hasActiveChild = item.children?.some(
              (child) => isPathActive(currentPath, child.path),
            );
            const isExpanded = item.children
              ? !collapsedGroups.has(item.label)
              : false;
            const groupId = `sidebar-group-${item.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <div key={item.label}>
                {item.path ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path as string)}
                    className={navClass(isActive)}
                  >
                    {Icon ? <Icon size={17} /> : null}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.longRunningTaskKey ? (
                      <LongRunningTaskNavStatus
                        taskKey={item.longRunningTaskKey}
                        label={item.label}
                      />
                    ) : null}
                  </button>
                ) : item.children ? (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={groupId}
                    onClick={() => toggleGroup(item.label)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                      hasActiveChild
                        ? "text-app-ink"
                        : "text-app-muted hover:bg-app-subtle hover:text-app-ink"
                    }`}
                  >
                    {Icon ? <Icon size={17} /> : null}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.longRunningTaskKey ? (
                      <LongRunningTaskNavStatus
                        taskKey={item.longRunningTaskKey}
                        label={item.label}
                      />
                    ) : null}
                    <ChevronRight
                      size={15}
                      className={`transition ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-app-muted">
                    {Icon ? <Icon size={17} /> : null}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.longRunningTaskKey ? (
                      <LongRunningTaskNavStatus
                        taskKey={item.longRunningTaskKey}
                        label={item.label}
                      />
                    ) : null}
                  </div>
                )}

                {item.children && isExpanded ? (
                  <div
                    id={groupId}
                    className="ml-5 mt-1 space-y-1 border-l border-app-border pl-3"
                  >
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        type="button"
                        onClick={() => onNavigate(child.path)}
                        className={childClass(isPathActive(currentPath, child.path))}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {child.label}
                        </span>
                        {child.longRunningTaskKey ? (
                          <LongRunningTaskNavStatus
                            taskKey={child.longRunningTaskKey}
                            label={child.label}
                          />
                        ) : null}
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
      {isResizable ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onMouseDown={startResize}
          className="absolute right-[-3px] top-0 h-full w-1.5 cursor-col-resize bg-transparent transition hover:bg-app-accent"
        />
      ) : null}
    </aside>
  );
}

function isPathActive(currentPath: string, targetPath: string): boolean {
  return (
    currentPath === targetPath ||
    (targetPath !== "/" && currentPath.startsWith(`${targetPath}/`))
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
  return `flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
    active
      ? "bg-app-accent-soft text-app-accent"
      : "text-app-muted hover:bg-app-subtle hover:text-app-ink"
  }`;
}

function LongRunningTaskNavStatus({
  taskKey,
  label,
}: {
  taskKey: string;
  label: string;
}) {
  const task = useLongRunningTask(taskKey);

  if (!task) {
    return <span className="h-4 w-4 shrink-0" aria-hidden="true" />;
  }

  if (task.status === "processing") {
    return (
      <LoaderCircle
        size={14}
        aria-label={`${label} processing`}
        className="h-4 w-4 shrink-0 animate-spin text-app-accent"
        role="img"
      />
    );
  }

  return (
    <CheckCircle2
      size={14}
      aria-label={`${label} complete`}
      className="h-4 w-4 shrink-0 text-app-success"
      role="img"
    />
  );
}
