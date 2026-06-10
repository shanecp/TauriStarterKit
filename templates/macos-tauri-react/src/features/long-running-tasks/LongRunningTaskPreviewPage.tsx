import { Play } from "lucide-react";

import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { formatTimestamp } from "../../shared/lib/format";
import {
  useClearCompletedLongRunningTaskOnVisit,
  useLongRunningTask,
  useLongRunningTaskActions,
} from "../../shared/long-running-tasks";
import { useNotifications } from "../../shared/notifications/useNotifications";
import {
  LONG_RUNNING_TASK_SIMULATION_MS,
  type LongRunningTaskPreview,
} from "./longRunningTaskPreviews";

type LongRunningTaskPreviewPageProps = {
  preview: LongRunningTaskPreview;
};

export function LongRunningTaskPreviewPage({
  preview,
}: LongRunningTaskPreviewPageProps) {
  const notifications = useNotifications();
  const task = useLongRunningTask(preview.taskKey);
  const { startLongRunningTask, completeLongRunningTask } =
    useLongRunningTaskActions();
  const isProcessing = task?.status === "processing";
  const statusLabel =
    task?.status === "processing"
      ? "Processing"
      : task?.status === "done"
        ? "Done"
        : "Idle";
  const statusTone =
    task?.status === "processing"
      ? "info"
      : task?.status === "done"
        ? "success"
        : "neutral";

  useClearCompletedLongRunningTaskOnVisit(preview.taskKey);

  function startTask() {
    if (isProcessing) {
      return;
    }

    const startedTask = startLongRunningTask({
      key: preview.taskKey,
      label: preview.label,
      ownerPath: preview.path,
    });

    window.setTimeout(() => {
      completeLongRunningTask(startedTask.key, { runId: startedTask.runId });
      notifications.success(`${preview.label} completed.`);
    }, LONG_RUNNING_TASK_SIMULATION_MS);
  }

  return (
    <div>
      <PageHeader
        actions={
          <Button
            onClick={startTask}
            disabled={isProcessing}
            loading={isProcessing}
            loadingLabel={`Running ${preview.label}`}
          >
            <Play size={15} />
            Start
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={preview.label}
          actions={<StatusBadge label={statusLabel} tone={statusTone} />}
        />
        <CardBody>
          <dl className="grid gap-3 text-sm">
            <Detail label="Task key" value={preview.taskKey} />
            <Detail label="Started" value={formatTimestamp(task?.startedAt)} />
            <Detail label="Last changed" value={formatTimestamp(task?.updatedAt)} />
            <Detail label="Completed" value={formatTimestamp(task?.completedAt)} />
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-app-border bg-app-subtle px-3 py-2 md:grid-cols-[180px_1fr]">
      <dt className="text-app-muted">{label}</dt>
      <dd className="font-medium text-app-ink">{value}</dd>
    </div>
  );
}
