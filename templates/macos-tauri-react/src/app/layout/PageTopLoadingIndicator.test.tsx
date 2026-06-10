import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PageTopLoadingIndicatorContext } from "../../shared/page-top-loading-indicator/pageTopLoadingIndicatorContext";
import { PageTopLoadingIndicatorStore } from "../../shared/page-top-loading-indicator/pageTopLoadingIndicatorStore";
import { PageTopLoadingIndicator } from "./PageTopLoadingIndicator";

describe("PageTopLoadingIndicator", () => {
  it("does not reserve header space when activity is idle", () => {
    const store = new PageTopLoadingIndicatorStore(0);

    const markup = renderToStaticMarkup(
      <PageTopLoadingIndicatorContext.Provider value={store}>
        <PageTopLoadingIndicator />
      </PageTopLoadingIndicatorContext.Provider>,
    );

    expect(markup).toBe("");
  });

  it("renders the page-top loading indicator while work is active", () => {
    const store = new PageTopLoadingIndicatorStore(0);
    store.start({
      command: "example_ping",
      label: "Loading example command",
      startedAt: 100,
    });

    const markup = renderToStaticMarkup(
      <PageTopLoadingIndicatorContext.Provider value={store}>
        <PageTopLoadingIndicator />
      </PageTopLoadingIndicatorContext.Provider>,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Loading example command");
    expect(markup).toContain("loading-indicator-progress");
    expect(markup).toContain("loading-indicator-progress__bar");
  });
});
