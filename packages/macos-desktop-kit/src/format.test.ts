import { describe, expect, it } from "vitest";

import { compactError, formatDate, formatDuration, pluralize } from "./format";

describe("format helpers", () => {
  it("formats display dates in AU numeric order", () => {
    expect(formatDate("2026-05-22")).toBe("22/05/2026");
    expect(formatDate(new Date(2026, 0, 5))).toBe("05/01/2026");
    expect(formatDate("2026-02-30")).toBe("Not loaded");
  });

  it("formats durations under and over a second", () => {
    expect(formatDuration(250)).toBe("250 ms");
    expect(formatDuration(1250)).toBe("1.3 s");
  });

  it("pluralizes words", () => {
    expect(pluralize(1, "container")).toBe("1 container");
    expect(pluralize(2, "container")).toBe("2 containers");
  });

  it("compacts unknown errors", () => {
    expect(compactError(new Error("failed"))).toBe("failed");
    expect(compactError("blocked")).toBe("blocked");
    expect(compactError({})).toBe("Unexpected error");
  });
});
