import { useContext, useSyncExternalStore } from "react";

import { ActivityContext } from "./activityContext";

export function useActivity() {
  const store = useContext(ActivityContext);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}
