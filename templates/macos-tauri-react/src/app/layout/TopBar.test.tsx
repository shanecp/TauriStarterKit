import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ActivityContext } from "../../shared/activity/activityContext";
import { ActivityStore } from "../../shared/activity/activityStore";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  it("does not reserve header space when activity is idle", () => {
    const store = new ActivityStore(0);

    const markup = renderToStaticMarkup(
      <ActivityContext.Provider value={store}>
        <TopBar />
      </ActivityContext.Provider>,
    );

    expect(markup).toBe("");
  });

  it("renders the activity indicator while work is active", () => {
    const store = new ActivityStore(0);
    store.start({
      command: "example_ping",
      label: "Loading example command",
      startedAt: 100,
    });

    const markup = renderToStaticMarkup(
      <ActivityContext.Provider value={store}>
        <TopBar />
      </ActivityContext.Provider>,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Loading example command");
    expect(markup).toContain("activity-progress");
    expect(markup).toContain("activity-progress__bar");
  });
});
