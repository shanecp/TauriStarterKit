export type PageTopLoadingIndicatorEntry = {
  id: string;
  command: string;
  label: string;
  startedAt: number;
};

export type PageTopLoadingIndicatorSnapshot = {
  entries: PageTopLoadingIndicatorEntry[];
  activeCount: number;
  isActive: boolean;
  latestEntry: PageTopLoadingIndicatorEntry | null;
  latestLabel: string | null;
  isCommandActive: (command: string) => boolean;
};

type PageTopLoadingIndicatorStart = {
  command: string;
  label: string;
  startedAt?: number;
};

export const DEFAULT_PAGE_TOP_LOADING_INDICATOR_MINIMUM_VISIBLE_MS = 350;

let nextPageTopLoadingIndicatorId = 1;

export class PageTopLoadingIndicatorStore {
  private entries = new Map<string, PageTopLoadingIndicatorEntry>();
  private finishTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private listeners = new Set<() => void>();
  private snapshot = this.createSnapshot();

  constructor(
    private readonly minimumVisibleMs =
      DEFAULT_PAGE_TOP_LOADING_INDICATOR_MINIMUM_VISIBLE_MS,
  ) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  start(entry: PageTopLoadingIndicatorStart): string {
    const id = `page-top-loading-indicator-${nextPageTopLoadingIndicatorId}`;
    nextPageTopLoadingIndicatorId += 1;
    this.entries.set(id, {
      id,
      command: entry.command,
      label: entry.label,
      startedAt: entry.startedAt ?? Date.now(),
    });
    this.emit();
    return id;
  }

  finish(id: string, finishedAt = Date.now()) {
    const entry = this.entries.get(id);
    if (!entry || this.finishTimers.has(id)) {
      return;
    }

    const visibleMs = Math.max(0, finishedAt - entry.startedAt);
    const remainingMs = Math.max(0, this.minimumVisibleMs - visibleMs);

    if (remainingMs > 0) {
      const timer = setTimeout(() => {
        this.finishTimers.delete(id);
        this.deleteEntry(id);
      }, remainingMs);
      this.finishTimers.set(id, timer);
      return;
    }

    this.deleteEntry(id);
  }

  clear() {
    this.finishTimers.forEach((timer) => clearTimeout(timer));
    this.finishTimers.clear();

    if (this.entries.size === 0) {
      return;
    }
    this.entries.clear();
    this.emit();
  }

  private deleteEntry(id: string) {
    if (!this.entries.delete(id)) {
      return;
    }
    this.emit();
  }

  private emit() {
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private createSnapshot(): PageTopLoadingIndicatorSnapshot {
    const entries = Array.from(this.entries.values()).sort(
      (left, right) => left.startedAt - right.startedAt,
    );
    const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

    return {
      entries,
      activeCount: entries.length,
      isActive: entries.length > 0,
      latestEntry,
      latestLabel: latestEntry?.label ?? null,
      isCommandActive: (command: string) =>
        entries.some((entry) => entry.command === command),
    };
  }
}

export const pageTopLoadingIndicatorStore = new PageTopLoadingIndicatorStore();

export function startPageTopLoadingIndicator(
  command: string,
  label: string,
): string {
  return pageTopLoadingIndicatorStore.start({ command, label });
}

export function finishPageTopLoadingIndicator(id: string) {
  pageTopLoadingIndicatorStore.finish(id);
}
