import { useCallback, useEffect, useRef, useState } from "react";

import { compactError } from "../format";

type UseAsyncResourceOptions<T> = {
  load: () => Promise<T>;
  initialValue?: T;
  autoLoad?: boolean;
};

export function useAsyncResource<T>({
  load,
  initialValue,
  autoLoad = true,
}: UseAsyncResourceOptions<T>) {
  const requestId = useRef(0);
  const [hasLoaded, setHasLoaded] = useState(initialValue !== undefined);
  const [data, setData] = useState<T | undefined>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setIsLoading(true);
    setError(null);

    try {
      const nextData = await load();
      if (requestId.current !== currentRequest) {
        return;
      }

      setHasLoaded(true);
      setData(nextData);
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
  }, [load]);

  useEffect(() => {
    if (autoLoad) {
      void refresh();
    }
  }, [autoLoad, refresh]);

  return {
    data,
    setData,
    error,
    isInitialLoading: isLoading && !hasLoaded,
    isRefreshing: isLoading && hasLoaded,
    isLoading,
    lastUpdatedAt,
    refresh,
  };
}
