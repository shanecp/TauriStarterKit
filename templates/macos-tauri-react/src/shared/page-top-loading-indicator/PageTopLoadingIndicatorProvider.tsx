import { useMemo, type ReactNode } from "react";

import { PageTopLoadingIndicatorContext } from "./pageTopLoadingIndicatorContext";
import { pageTopLoadingIndicatorStore } from "./pageTopLoadingIndicatorStore";

export function PageTopLoadingIndicatorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const store = useMemo(() => pageTopLoadingIndicatorStore, []);

  return (
    <PageTopLoadingIndicatorContext.Provider value={store}>
      {children}
    </PageTopLoadingIndicatorContext.Provider>
  );
}
