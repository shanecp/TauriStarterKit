import { describe, expect, it } from "vitest";

import { createStorageKey } from "./storage";

describe("settings storage helpers", () => {
  it("creates namespaced storage keys", () => {
    expect(createStorageKey("sample-app", "themeMode")).toBe(
      "sample-app.themeMode",
    );
  });
});
