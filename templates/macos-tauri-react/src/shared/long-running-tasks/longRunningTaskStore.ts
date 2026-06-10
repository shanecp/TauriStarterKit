export type LongRunningTaskStatus = "processing" | "done";

export type LongRunningTaskEntry = {
  key: string;
  runId: string;
  label: string;
  status: LongRunningTaskStatus;
  ownerPath?: string;
  startedAt: number;
  updatedAt: number;
  completedAt?: number;
};

export type LongRunningTaskSnapshot = {
  entries: LongRunningTaskEntry[];
  processingCount: number;
  doneCount: number;
  getTask: (key: string) => LongRunningTaskEntry | null;
  isProcessing: (key: string) => boolean;
  isDone: (key: string) => boolean;
};

export type StartLongRunningTaskOptions = {
  key: string;
  label: string;
  ownerPath?: string;
  runId?: string;
  startedAt?: number;
};

export type CompleteLongRunningTaskOptions = {
  runId: string;
  completedAt?: number;
};

export type ClearLongRunningTaskOptions = {
  runId?: string;
};

export class LongRunningTaskStore {
  private entries = new Map<string, LongRunningTaskEntry>();
  private listeners = new Set<() => void>();
  private nextRunNumber = 1;
  private snapshot = this.createSnapshot();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  startTask = (options: StartLongRunningTaskOptions): LongRunningTaskEntry => {
    const startedAt = options.startedAt ?? Date.now();
    const entry: LongRunningTaskEntry = {
      key: options.key,
      runId: options.runId ?? this.createRunId(),
      label: options.label,
      status: "processing",
      ownerPath: options.ownerPath,
      startedAt,
      updatedAt: startedAt,
    };

    this.entries.set(options.key, entry);
    this.emit();
    return entry;
  };

  completeTask = (
    key: string,
    options: CompleteLongRunningTaskOptions,
  ): boolean => {
    const entry = this.entries.get(key);
    if (!entry || entry.runId !== options.runId) {
      return false;
    }

    const completedAt = options.completedAt ?? Date.now();
    this.entries.set(key, {
      ...entry,
      status: "done",
      completedAt,
      updatedAt: completedAt,
    });
    this.emit();
    return true;
  };

  clearTask = (
    key: string,
    options: ClearLongRunningTaskOptions = {},
  ): boolean => {
    const entry = this.entries.get(key);
    if (!entry || (options.runId && entry.runId !== options.runId)) {
      return false;
    }

    this.entries.delete(key);
    this.emit();
    return true;
  };

  clearCompletedTask = (
    key: string,
    options: ClearLongRunningTaskOptions = {},
  ): boolean => {
    const entry = this.entries.get(key);
    if (
      !entry ||
      entry.status !== "done" ||
      (options.runId && entry.runId !== options.runId)
    ) {
      return false;
    }

    this.entries.delete(key);
    this.emit();
    return true;
  };

  clearAllTasks = () => {
    if (this.entries.size === 0) {
      return;
    }

    this.entries.clear();
    this.emit();
  };

  private createRunId(): string {
    const runId = `long-running-task-${this.nextRunNumber}`;
    this.nextRunNumber += 1;
    return runId;
  }

  private emit() {
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private createSnapshot(): LongRunningTaskSnapshot {
    const entries = Array.from(this.entries.values()).sort((left, right) => {
      if (left.startedAt !== right.startedAt) {
        return left.startedAt - right.startedAt;
      }
      return left.key.localeCompare(right.key);
    });
    const byKey = new Map(entries.map((entry) => [entry.key, entry]));
    const processingCount = entries.filter(
      (entry) => entry.status === "processing",
    ).length;
    const doneCount = entries.filter((entry) => entry.status === "done").length;

    return {
      entries,
      processingCount,
      doneCount,
      getTask: (key: string) => byKey.get(key) ?? null,
      isProcessing: (key: string) => byKey.get(key)?.status === "processing",
      isDone: (key: string) => byKey.get(key)?.status === "done",
    };
  }
}

export const longRunningTaskStore = new LongRunningTaskStore();

export function startLongRunningTask(
  options: StartLongRunningTaskOptions,
): LongRunningTaskEntry {
  return longRunningTaskStore.startTask(options);
}

export function completeLongRunningTask(
  key: string,
  options: CompleteLongRunningTaskOptions,
): boolean {
  return longRunningTaskStore.completeTask(key, options);
}

export function clearLongRunningTask(
  key: string,
  options?: ClearLongRunningTaskOptions,
): boolean {
  return longRunningTaskStore.clearTask(key, options);
}

export function clearCompletedLongRunningTask(
  key: string,
  options?: ClearLongRunningTaskOptions,
): boolean {
  return longRunningTaskStore.clearCompletedTask(key, options);
}

export function clearAllLongRunningTasks() {
  longRunningTaskStore.clearAllTasks();
}

export async function trackLongRunningTask<Result>(
  options: StartLongRunningTaskOptions,
  work: (entry: LongRunningTaskEntry) => Promise<Result> | Result,
): Promise<Result> {
  const entry = longRunningTaskStore.startTask(options);

  try {
    const result = await work(entry);
    longRunningTaskStore.completeTask(entry.key, { runId: entry.runId });
    return result;
  } catch (error) {
    longRunningTaskStore.clearTask(entry.key, { runId: entry.runId });
    throw error;
  }
}
