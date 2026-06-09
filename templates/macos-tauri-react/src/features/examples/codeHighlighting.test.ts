import { describe, expect, it } from "vitest";

import { highlightCode } from "./codeHighlighting";

describe("code highlighting", () => {
  it("returns highlighted html for supported languages", () => {
    expect(highlightCode("const value = 1;", "typescript")).toContain(
      "hljs-keyword",
    );
  });
});
