import { invoke } from "@tauri-apps/api/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { pageTopLoadingIndicatorStore } from "./pageTopLoadingIndicatorStore";
import { createTauriInvoke, tauriInvoke } from "./tauri";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue("ok"),
}));

describe("tauriInvoke", () => {
  afterEach(() => {
    pageTopLoadingIndicatorStore.clear();
    vi.mocked(invoke).mockClear();
    vi.useRealTimers();
  });

  it("does not start the page-top loading indicator without an explicit label", async () => {
    await tauriInvoke("example_command");

    expect(invoke).toHaveBeenCalledWith("example_command", undefined);
    expect(pageTopLoadingIndicatorStore.getSnapshot().activeCount).toBe(0);
  });

  it("starts the page-top loading indicator when a label is supplied", async () => {
    vi.useFakeTimers();

    const promise = tauriInvoke("example_command", undefined, {
      pageTopLoadingIndicatorLabel: "Loading example command",
    });

    expect(pageTopLoadingIndicatorStore.getSnapshot().latestLabel).toBe(
      "Loading example command",
    );

    await promise;

    vi.advanceTimersByTime(350);
    expect(pageTopLoadingIndicatorStore.getSnapshot().activeCount).toBe(0);
  });

  it("uses command label maps from createTauriInvoke", async () => {
    const invokeCommand = createTauriInvoke({
      example_command: "Processing page",
    });
    const promise = invokeCommand("example_command");

    expect(pageTopLoadingIndicatorStore.getSnapshot().latestLabel).toBe(
      "Processing page",
    );

    await promise;
  });
});
