import { useMemo, type ReactNode } from "react";

import { ActivityContext } from "./activityContext";
import { activityStore } from "./activityStore";

export function ActivityProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => activityStore, []);

  return (
    <ActivityContext.Provider value={store}>{children}</ActivityContext.Provider>
  );
}
