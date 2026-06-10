import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OnPageLoadingIndicator } from "./OnPageLoadingIndicator";

describe("OnPageLoadingIndicator", () => {
  it("renders the label and animated progress bar", () => {
    const markup = renderToStaticMarkup(
      <OnPageLoadingIndicator label="Refreshing data" />,
    );

    expect(markup).toContain("Refreshing data");
    expect(markup).toContain("loading-indicator-progress");
    expect(markup).toContain("loading-indicator-progress__bar");
    expect(markup).toContain('aria-hidden="true"');
  });
});
