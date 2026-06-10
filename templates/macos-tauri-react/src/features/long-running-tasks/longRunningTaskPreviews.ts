export type LongRunningTaskPreview = {
  label: string;
  path: string;
  taskKey: string;
};

export const LONG_RUNNING_TASK_SIMULATION_MS = 20_000;

export const longRunningTaskPreviews: LongRunningTaskPreview[] = [
  {
    label: "Task One",
    path: "/long-running-tasks/task-one",
    taskKey: "long-running-tasks.task-one",
  },
  {
    label: "Task Two",
    path: "/long-running-tasks/task-two",
    taskKey: "long-running-tasks.task-two",
  },
  {
    label: "Task Three",
    path: "/long-running-tasks/task-three",
    taskKey: "long-running-tasks.task-three",
  },
];
