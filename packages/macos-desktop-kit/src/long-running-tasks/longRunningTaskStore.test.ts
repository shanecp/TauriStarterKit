import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LongRunningTaskStore,
  longRunningTaskStore,
  trackLongRunningTask,
} from "./longRunningTaskStore";

afterEach(() => {
  longRunningTaskStore.clearAllTasks();
});

describe("LongRunningTaskStore", () => {
  it("starts with an idle snapshot", () => {
    const store = new LongRunningTaskStore();
    const snapshot = store.getSnapshot();

    expect(snapshot.entries).toEqual([]);
    expect(snapshot.processingCount).toBe(0);
    expect(snapshot.doneCount).toBe(0);
    expect(snapshot.getTask("repositories.batch-processing")).toBeNull();
    expect(snapshot.isProcessing("repositories.batch-processing")).toBe(false);
    expect(snapshot.isDone("repositories.batch-processing")).toBe(false);
  });

  it("creates a processing entry with generated run metadata", () => {
    const store = new LongRunningTaskStore();

    const entry = store.startTask({
      key: "repositories.batch-processing",
      label: "Batch Processing",
      ownerPath: "/repositories/batch-processing",
      startedAt: 100,
    });

    expect(entry).toEqual({
      key: "repositories.batch-processing",
      runId: "long-running-task-1",
      label: "Batch Processing",
      status: "processing",
      ownerPath: "/repositories/batch-processing",
      startedAt: 100,
      updatedAt: 100,
    });
    expect(store.getSnapshot().entries).toEqual([entry]);
    expect(store.getSnapshot().processingCount).toBe(1);
    expect(store.getSnapshot().doneCount).toBe(0);
    expect(store.getSnapshot().isProcessing(entry.key)).toBe(true);
  });

  it("replaces repeated starts for the same key", () => {
    const store = new LongRunningTaskStore();

    const first = store.startTask({
      key: "repositories.batch-processing",
      label: "First Batch",
      runId: "run-1",
      startedAt: 100,
    });
    const second = store.startTask({
      key: "repositories.batch-processing",
      label: "Second Batch",
      runId: "run-2",
      startedAt: 200,
    });

    expect(first.runId).toBe("run-1");
    expect(store.getSnapshot().entries).toEqual([second]);
    expect(store.getSnapshot().getTask(second.key)?.runId).toBe("run-2");
    expect(store.getSnapshot().processingCount).toBe(1);
  });

  it("keeps concurrent keys isolated", () => {
    const store = new LongRunningTaskStore();

    const batch = store.startTask({
      key: "repositories.batch-processing",
      label: "Batch Processing",
      startedAt: 200,
    });
    const download = store.startTask({
      key: "repositories.download-data",
      label: "Download Data",
      startedAt: 100,
    });

    expect(store.getSnapshot().entries).toEqual([download, batch]);
    expect(store.getSnapshot().processingCount).toBe(2);
    expect(store.getSnapshot().getTask(batch.key)).toEqual(batch);
    expect(store.getSnapshot().getTask(download.key)).toEqual(download);
  });

  it("marks a matching run as done and leaves it visible", () => {
    const store = new LongRunningTaskStore();
    const entry = store.startTask({
      key: "repositories.batch-processing",
      label: "Batch Processing",
      runId: "run-1",
      startedAt: 100,
    });

    expect(
      store.completeTask(entry.key, {
        runId: "run-1",
        completedAt: 300,
      }),
    ).toBe(true);

    expect(store.getSnapshot().getTask(entry.key)).toEqual({
      ...entry,
      status: "done",
      completedAt: 300,
      updatedAt: 300,
    });
    expect(store.getSnapshot().processingCount).toBe(0);
    expect(store.getSnapshot().doneCount).toBe(1);
    expect(store.getSnapshot().isDone(entry.key)).toBe(true);
  });

  it("ignores stale completions from an old run", () => {
    const store = new LongRunningTaskStore();
    const first = store.startTask({
      key: "repositories.batch-processing",
      label: "First Batch",
      runId: "run-1",
      startedAt: 100,
    });
    const second = store.startTask({
      key: "repositories.batch-processing",
      label: "Second Batch",
      runId: "run-2",
      startedAt: 200,
    });

    expect(
      store.completeTask(first.key, {
        runId: "run-1",
        completedAt: 300,
      }),
    ).toBe(false);

    expect(store.getSnapshot().getTask(second.key)).toEqual(second);
    expect(store.getSnapshot().processingCount).toBe(1);
    expect(store.getSnapshot().doneCount).toBe(0);
  });

  it("clears tasks and notifies subscribers", () => {
    const store = new LongRunningTaskStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const entry = store.startTask({
      key: "repositories.batch-processing",
      label: "Batch Processing",
    });

    expect(store.clearTask(entry.key)).toBe(true);

    expect(store.getSnapshot().entries).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("clears only completed tasks when acknowledging a page visit", () => {
    const store = new LongRunningTaskStore();
    const processing = store.startTask({
      key: "repositories.batch-processing",
      label: "Batch Processing",
      runId: "run-1",
    });
    const done = store.startTask({
      key: "repositories.download-data",
      label: "Download Data",
      runId: "run-2",
    });
    store.completeTask(done.key, { runId: done.runId, completedAt: 400 });

    expect(store.clearCompletedTask(processing.key)).toBe(false);
    expect(store.clearCompletedTask(done.key)).toBe(true);

    expect(store.getSnapshot().getTask(processing.key)).toEqual(processing);
    expect(store.getSnapshot().getTask(done.key)).toBeNull();
  });

  it("clears all tasks for reset flows", () => {
    const store = new LongRunningTaskStore();
    store.startTask({
      key: "repositories.batch-processing",
      label: "Batch Processing",
    });
    store.startTask({
      key: "repositories.download-data",
      label: "Download Data",
    });

    store.clearAllTasks();

    expect(store.getSnapshot().entries).toEqual([]);
    expect(store.getSnapshot().processingCount).toBe(0);
  });
});

describe("trackLongRunningTask", () => {
  it("marks successful work as done", async () => {
    const result = await trackLongRunningTask(
      {
        key: "repositories.batch-processing",
        label: "Batch Processing",
        runId: "tracked-run",
      },
      async () => "complete",
    );

    expect(result).toBe("complete");
    expect(
      longRunningTaskStore.getSnapshot().getTask("repositories.batch-processing"),
    ).toMatchObject({
      key: "repositories.batch-processing",
      runId: "tracked-run",
      status: "done",
    });
  });

  it("clears failed work so it is not stuck processing", async () => {
    await expect(
      trackLongRunningTask(
        {
          key: "repositories.batch-processing",
          label: "Batch Processing",
          runId: "tracked-failure",
        },
        async () => {
          throw new Error("Task failed");
        },
      ),
    ).rejects.toThrow("Task failed");

    expect(
      longRunningTaskStore.getSnapshot().getTask("repositories.batch-processing"),
    ).toBeNull();
  });
});
