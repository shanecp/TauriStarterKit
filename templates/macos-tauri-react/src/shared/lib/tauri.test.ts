import { afterEach, describe, expect, it, vi } from "vitest";

import { pageTopLoadingIndicatorStore } from "../page-top-loading-indicator/pageTopLoadingIndicatorStore";

const invokeMock = vi.fn().mockResolvedValue("ok");
const tauriCoreModule = ["@tauri-apps", "api", "core"].join("/");

vi.doMock(tauriCoreModule, () => ({
  invoke: invokeMock,
}));

const { createTauriInvoke, tauriInvoke } = await import("./tauri");

describe("tauriInvoke", () => {
  afterEach(() => {
    pageTopLoadingIndicatorStore.clear();
    invokeMock.mockClear();
    vi.useRealTimers();
  });

  it("does not start the page-top loading indicator without an explicit label", async () => {
    await tauriInvoke("example_ping");

    expect(invokeMock).toHaveBeenCalledWith("example_ping", undefined);
    expect(pageTopLoadingIndicatorStore.getSnapshot().activeCount).toBe(0);
  });

  it("starts the page-top loading indicator when a label is supplied", async () => {
    vi.useFakeTimers();

    const promise = tauriInvoke("example_ping", undefined, {
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
      example_ping: "Processing page",
    });
    const promise = invokeCommand("example_ping");

    expect(pageTopLoadingIndicatorStore.getSnapshot().latestLabel).toBe(
      "Processing page",
    );

    await promise;
  });
});
