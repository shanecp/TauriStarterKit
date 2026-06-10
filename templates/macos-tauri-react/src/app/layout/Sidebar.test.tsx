import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LongRunningTaskContext } from "../../shared/long-running-tasks/longRunningTaskContext";
import { LongRunningTaskStore } from "../../shared/long-running-tasks/longRunningTaskStore";
import { Sidebar } from "./Sidebar";

const EXAMPLE_TASK_KEY = "examples.long-running-task";
const PREVIEW_TASK_KEY = "long-running-tasks.task-one";

describe("Sidebar long-running task indicators", () => {
  it("renders the long-running task preview group and three task pages", () => {
    const markup = renderSidebar(
      new LongRunningTaskStore(),
      "/long-running-tasks/task-one",
    );

    expect(markup).toContain("Long Running Tasks");
    expect(markup).toContain("Task One");
    expect(markup).toContain("Task Two");
    expect(markup).toContain("Task Three");
  });

  it("renders configured nav items without status icons while idle", () => {
    const markup = renderSidebar(new LongRunningTaskStore());

    expect(markup).toContain("Content Loading");
    expect(markup).not.toContain("Content Loading processing");
    expect(markup).not.toContain("Content Loading complete");
  });

  it("renders a processing marker for the matching task key", () => {
    const store = new LongRunningTaskStore();
    store.startTask({
      key: EXAMPLE_TASK_KEY,
      label: "Long task",
      startedAt: 100,
    });

    const markup = renderSidebar(store);

    expect(markup).toContain("Content Loading processing");
    expect(markup).toContain("animate-spin");
  });

  it("renders a processing marker for a preview task", () => {
    const store = new LongRunningTaskStore();
    store.startTask({
      key: PREVIEW_TASK_KEY,
      label: "Task One",
      startedAt: 100,
    });

    const markup = renderSidebar(store, "/long-running-tasks/task-one");

    expect(markup).toContain("Task One processing");
    expect(markup).toContain("animate-spin");
  });

  it("renders a done marker for the matching task key", () => {
    const store = new LongRunningTaskStore();
    const task = store.startTask({
      key: EXAMPLE_TASK_KEY,
      label: "Long task",
      runId: "example-run",
      startedAt: 100,
    });
    store.completeTask(task.key, { runId: task.runId, completedAt: 200 });

    const markup = renderSidebar(store);

    expect(markup).toContain("Content Loading complete");
    expect(markup).toContain("text-app-success");
  });

  it("renders a done marker for a preview task", () => {
    const store = new LongRunningTaskStore();
    const task = store.startTask({
      key: PREVIEW_TASK_KEY,
      label: "Task One",
      runId: "preview-run",
      startedAt: 100,
    });
    store.completeTask(task.key, { runId: task.runId, completedAt: 200 });

    const markup = renderSidebar(store, "/long-running-tasks/task-one");

    expect(markup).toContain("Task One complete");
    expect(markup).toContain("text-app-success");
  });

  it("ignores unrelated task keys", () => {
    const store = new LongRunningTaskStore();
    store.startTask({
      key: "examples.unrelated-task",
      label: "Unrelated task",
      startedAt: 100,
    });

    const markup = renderSidebar(store);

    expect(markup).not.toContain("Content Loading processing");
    expect(markup).not.toContain("Content Loading complete");
    expect(markup).not.toContain("Task One processing");
    expect(markup).not.toContain("Task One complete");
  });
});

function renderSidebar(
  store: LongRunningTaskStore,
  currentPath = "/examples/loading",
): string {
  return renderToStaticMarkup(
    <LongRunningTaskContext.Provider value={store}>
      <Sidebar currentPath={currentPath} onNavigate={() => undefined} />
    </LongRunningTaskContext.Provider>,
  );
}
