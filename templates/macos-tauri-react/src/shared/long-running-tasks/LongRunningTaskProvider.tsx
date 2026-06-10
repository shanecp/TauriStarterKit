import { useMemo, type ReactNode } from "react";

import { LongRunningTaskContext } from "./longRunningTaskContext";
import { longRunningTaskStore } from "./longRunningTaskStore";

export function LongRunningTaskProvider({
  children,
}: {
  children: ReactNode;
}) {
  const store = useMemo(() => longRunningTaskStore, []);

  return (
    <LongRunningTaskContext.Provider value={store}>
      {children}
    </LongRunningTaskContext.Provider>
  );
}
