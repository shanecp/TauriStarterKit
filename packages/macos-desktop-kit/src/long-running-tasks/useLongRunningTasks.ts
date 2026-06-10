import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { LongRunningTaskContext } from "./longRunningTaskContext";

export function useLongRunningTasks() {
  const store = useContext(LongRunningTaskContext);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}

export function useLongRunningTask(taskKey: string) {
  return useLongRunningTasks().getTask(taskKey);
}

export function useLongRunningTaskActions() {
  const store = useContext(LongRunningTaskContext);

  return useMemo(
    () => ({
      startLongRunningTask: store.startTask,
      completeLongRunningTask: store.completeTask,
      clearLongRunningTask: store.clearTask,
      clearCompletedLongRunningTask: store.clearCompletedTask,
      clearAllLongRunningTasks: store.clearAllTasks,
    }),
    [store],
  );
}

export function useClearCompletedLongRunningTaskOnVisit(taskKey: string) {
  const task = useLongRunningTask(taskKey);
  const { clearCompletedLongRunningTask } = useLongRunningTaskActions();
  const checkedTaskKey = useRef<string | null>(null);

  useEffect(() => {
    if (checkedTaskKey.current === taskKey) {
      return;
    }

    checkedTaskKey.current = taskKey;

    if (task?.status === "done") {
      clearCompletedLongRunningTask(taskKey);
    }
  }, [clearCompletedLongRunningTask, task?.status, taskKey]);
}
