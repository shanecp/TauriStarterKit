import { afterEach, describe, expect, it, vi } from "vitest";

import { ActivityStore } from "./activityStore";

describe("ActivityStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps concurrent activities active until each activity finishes", () => {
    const store = new ActivityStore(0);
    const firstId = store.start({
      command: "first_command",
      label: "First command",
      startedAt: 100,
    });
    const secondId = store.start({
      command: "second_command",
      label: "Second command",
      startedAt: 200,
    });

    expect(store.getSnapshot().activeCount).toBe(2);
    expect(store.getSnapshot().latestLabel).toBe("Second command");
    expect(store.getSnapshot().isCommandActive("first_command")).toBe(true);

    store.finish(secondId);

    expect(store.getSnapshot().activeCount).toBe(1);
    expect(store.getSnapshot().latestLabel).toBe("First command");
    expect(store.getSnapshot().isCommandActive("first_command")).toBe(true);

    store.finish(firstId);

    expect(store.getSnapshot().activeCount).toBe(0);
    expect(store.getSnapshot().latestLabel).toBeNull();
  });

  it("keeps very fast activity visible for the configured minimum duration", () => {
    vi.useFakeTimers();

    const store = new ActivityStore(300);
    const id = store.start({
      command: "fast_command",
      label: "Fast command",
      startedAt: 1000,
    });

    store.finish(id, 1100);

    expect(store.getSnapshot().activeCount).toBe(1);

    vi.advanceTimersByTime(199);
    expect(store.getSnapshot().activeCount).toBe(1);

    vi.advanceTimersByTime(1);
    expect(store.getSnapshot().activeCount).toBe(0);
  });
});
