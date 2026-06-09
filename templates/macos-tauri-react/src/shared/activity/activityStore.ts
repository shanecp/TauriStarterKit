export type Activity = {
  id: string;
  command: string;
  label: string;
  startedAt: number;
};

export type ActivitySnapshot = {
  activities: Activity[];
  activeCount: number;
  isActive: boolean;
  latestActivity: Activity | null;
  latestLabel: string | null;
  isCommandActive: (command: string) => boolean;
};

type ActivityStart = {
  command: string;
  label: string;
  startedAt?: number;
};

export const DEFAULT_ACTIVITY_MINIMUM_VISIBLE_MS = 350;

let nextActivityId = 1;

export class ActivityStore {
  private activities = new Map<string, Activity>();
  private finishTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private listeners = new Set<() => void>();
  private snapshot = this.createSnapshot();

  constructor(
    private readonly minimumVisibleMs = DEFAULT_ACTIVITY_MINIMUM_VISIBLE_MS,
  ) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  start(activity: ActivityStart): string {
    const id = `activity-${nextActivityId}`;
    nextActivityId += 1;
    this.activities.set(id, {
      id,
      command: activity.command,
      label: activity.label,
      startedAt: activity.startedAt ?? Date.now(),
    });
    this.emit();
    return id;
  }

  finish(id: string, finishedAt = Date.now()) {
    const activity = this.activities.get(id);
    if (!activity || this.finishTimers.has(id)) {
      return;
    }

    const visibleMs = Math.max(0, finishedAt - activity.startedAt);
    const remainingMs = Math.max(0, this.minimumVisibleMs - visibleMs);

    if (remainingMs > 0) {
      const timer = setTimeout(() => {
        this.finishTimers.delete(id);
        this.deleteActivity(id);
      }, remainingMs);
      this.finishTimers.set(id, timer);
      return;
    }

    this.deleteActivity(id);
  }

  clear() {
    this.finishTimers.forEach((timer) => clearTimeout(timer));
    this.finishTimers.clear();

    if (this.activities.size === 0) {
      return;
    }
    this.activities.clear();
    this.emit();
  }

  private deleteActivity(id: string) {
    if (!this.activities.delete(id)) {
      return;
    }
    this.emit();
  }

  private emit() {
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private createSnapshot(): ActivitySnapshot {
    const activities = Array.from(this.activities.values()).sort(
      (left, right) => left.startedAt - right.startedAt,
    );
    const latestActivity =
      activities.length > 0 ? activities[activities.length - 1] : null;

    return {
      activities,
      activeCount: activities.length,
      isActive: activities.length > 0,
      latestActivity,
      latestLabel: latestActivity?.label ?? null,
      isCommandActive: (command: string) =>
        activities.some((activity) => activity.command === command),
    };
  }
}

export const activityStore = new ActivityStore();

export function startGlobalActivity(command: string, label: string): string {
  return activityStore.start({ command, label });
}

export function finishGlobalActivity(id: string) {
  activityStore.finish(id);
}
