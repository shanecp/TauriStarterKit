import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders the label and animated progress bar", () => {
    const markup = renderToStaticMarkup(<LoadingState label="Refreshing data" />);

    expect(markup).toContain("Refreshing data");
    expect(markup).toContain("activity-progress");
    expect(markup).toContain("activity-progress__bar");
    expect(markup).toContain('aria-hidden="true"');
  });
});
