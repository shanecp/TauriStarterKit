import { useContext, useSyncExternalStore } from "react";

import { PageTopLoadingIndicatorContext } from "./pageTopLoadingIndicatorContext";

export function usePageTopLoadingIndicator() {
  const store = useContext(PageTopLoadingIndicatorContext);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}
