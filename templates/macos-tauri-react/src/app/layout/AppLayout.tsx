import { useEffect, useMemo, useState } from "react";

import { getRoute } from "../routes";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

function normalizePath(path: string): string {
  if (!path || path === "/index.html") {
    return "/";
  }

  return path;
}

export function AppLayout() {
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const onPopState = () => setCurrentPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const route = useMemo(() => getRoute(currentPath), [currentPath]);

  function navigate(path: string) {
    if (path === currentPath) {
      return;
    }

    window.history.pushState({}, "", path);
    setCurrentPath(path);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg text-app-ink">
      <Sidebar currentPath={route.path} onNavigate={navigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={route.title} subtitle={route.subtitle} />
        <main className="min-h-0 flex-1 overflow-auto px-8 py-6">
          <div className="min-w-0 w-full">{route.render(navigate)}</div>
        </main>
      </div>
    </div>
  );
}
