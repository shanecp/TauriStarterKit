import { describe, expect, it } from "vitest";

import { ActivityStore } from "./activityStore";

describe("ActivityStore", () => {
  it("keeps concurrent activities active until each activity finishes", () => {
    const store = new ActivityStore();
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
});
