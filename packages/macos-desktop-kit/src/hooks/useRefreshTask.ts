import { useCallback, useRef, useState } from "react";

import { compactError } from "../format";

export function useRefreshTask(task: () => Promise<void>) {
  const requestId = useRef(0);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setIsLoading(true);
    setError(null);

    try {
      await task();
      if (requestId.current !== currentRequest) {
        return;
      }

      setHasSucceeded(true);
      setLastUpdatedAt(Date.now());
    } catch (caught) {
      if (requestId.current === currentRequest) {
        setError(compactError(caught));
      }
    } finally {
      if (requestId.current === currentRequest) {
        setIsLoading(false);
      }
    }
  }, [task]);

  return {
    error,
    isInitialLoading: isLoading && !hasSucceeded,
    isRefreshing: isLoading && hasSucceeded,
    isLoading,
    lastUpdatedAt,
    refresh,
  };
}
