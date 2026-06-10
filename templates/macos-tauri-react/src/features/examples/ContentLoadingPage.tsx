import { Bell, RefreshCw, Timer } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { ErrorState } from "../../shared/components/ErrorState";
import { OnPageLoadingIndicator } from "../../shared/components/OnPageLoadingIndicator";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { useAsyncResource } from "../../shared/hooks/useAsyncResource";
import { formatTimestamp } from "../../shared/lib/format";
import {
  useClearCompletedLongRunningTaskOnVisit,
  useLongRunningTask,
  useLongRunningTaskActions,
} from "../../shared/long-running-tasks";
import { useNotifications } from "../../shared/notifications/useNotifications";
import { examplePing } from "../example/example.api";

const REFRESH_DEMO_DELAY_MS = 20_000;
const LONG_RUNNING_TASK_KEY = "examples.long-running-task";
const LONG_RUNNING_TASK_DELAY_MS = 8_000;

export function ContentLoadingPage() {
  const notifications = useNotifications();
  const longRunningTask = useLongRunningTask(LONG_RUNNING_TASK_KEY);
  const { startLongRunningTask, completeLongRunningTask } =
    useLongRunningTaskActions();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const hasLoadedExample = useRef(false);
  useClearCompletedLongRunningTaskOnVisit(LONG_RUNNING_TASK_KEY);
  const load = useCallback(async () => {
    if (hasLoadedExample.current) {
      await delay(REFRESH_DEMO_DELAY_MS);
      const response = await examplePing();
      hasLoadedExample.current = true;
      return response;
    }

    const response = await examplePing({
      pageTopLoadingIndicatorLabel: "Loading example command",
    });
    hasLoadedExample.current = true;
    return response;
  }, []);
  const { data, error, isInitialLoading, isRefreshing, lastUpdatedAt, refresh } =
    useAsyncResource({ load });

  function runLoadingDemo() {
    setIsDemoLoading(true);
    window.setTimeout(() => {
      setIsDemoLoading(false);
      notifications.success("Loading demo completed.");
    }, 900);
  }

  function runLongRunningTaskDemo() {
    if (longRunningTask?.status === "processing") {
      return;
    }

    const task = startLongRunningTask({
      key: LONG_RUNNING_TASK_KEY,
      label: "Long task",
      ownerPath: "/examples/loading",
    });

    window.setTimeout(() => {
      completeLongRunningTask(task.key, { runId: task.runId });
      notifications.success("Long task completed.");
    }, LONG_RUNNING_TASK_DELAY_MS);
  }

  const longRunningTaskStatusLabel =
    longRunningTask?.status === "processing"
      ? "Processing"
      : longRunningTask?.status === "done"
        ? "Done"
        : "Idle";
  const longRunningTaskStatusTone =
    longRunningTask?.status === "processing"
      ? "info"
      : longRunningTask?.status === "done"
        ? "success"
        : "neutral";

  return (
    <div>
      <PageHeader
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              onClick={runLoadingDemo}
              disabled={isDemoLoading}
              loading={isDemoLoading}
              loadingLabel="Running loading demo"
            >
              <Timer size={15} />
              Loading Demo
            </Button>
            <Button
              onClick={runLongRunningTaskDemo}
              disabled={longRunningTask?.status === "processing"}
              loading={longRunningTask?.status === "processing"}
              loadingLabel="Running long task"
            >
              <Timer size={15} />
              Long Task
            </Button>
            <Button onClick={() => notifications.info("Toast message demo.")}>
              <Bell size={15} />
              Toast Demo
            </Button>
            <Button
              onClick={refresh}
              disabled={isInitialLoading || isRefreshing}
              loading={isRefreshing}
              loadingLabel="Refreshing example command"
            >
              <RefreshCw size={15} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid gap-5">
        {isDemoLoading ? (
          <OnPageLoadingIndicator label="Running loading demo" />
        ) : null}
        {isRefreshing ? (
          <OnPageLoadingIndicator label="Refreshing example command for 20 seconds" />
        ) : null}
        {error ? <ErrorState message={error} /> : null}
        <Card>
          <CardHeader
            title="Long Task"
            description="Named background workflow state."
            actions={
              <StatusBadge
                label={longRunningTaskStatusLabel}
                tone={longRunningTaskStatusTone}
              />
            }
          />
          <CardBody>
            <dl className="grid gap-3 text-sm">
              <Detail
                label="Task key"
                value={longRunningTask?.key ?? LONG_RUNNING_TASK_KEY}
              />
              <Detail
                label="Last changed"
                value={formatTimestamp(longRunningTask?.updatedAt)}
              />
            </dl>
          </CardBody>
        </Card>
        {data ? (
          <Card>
            <CardHeader
              title="Example Ping"
              description="Typed API wrapper with loading, refresh, and error states."
              actions={
                <StatusBadge
                  label={isRefreshing ? "Refreshing" : "Available"}
                  tone={isRefreshing ? "info" : "success"}
                />
              }
            />
            <CardBody>
              <dl className="grid gap-3 text-sm">
                <Detail label="Message" value={data.message} />
                <Detail
                  label="Command timestamp"
                  value={formatTimestamp(data.received_at_epoch_ms)}
                />
                <Detail label="Last refreshed" value={formatTimestamp(lastUpdatedAt)} />
              </dl>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-app-border bg-app-subtle px-3 py-2 md:grid-cols-[180px_1fr]">
      <dt className="text-app-muted">{label}</dt>
      <dd className="font-medium text-app-ink">{value}</dd>
    </div>
  );
}
