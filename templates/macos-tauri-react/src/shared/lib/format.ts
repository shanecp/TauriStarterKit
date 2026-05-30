export function formatTimestamp(epochMs: number | string | null | undefined): string {
  if (epochMs === null || epochMs === undefined) {
    return "Not loaded";
  }

  const numeric = typeof epochMs === "string" ? Number(epochMs) : epochMs;
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "Not loaded";
  }

  const date = new Date(numeric);
  return `${formatDate(date)} ${new Intl.DateTimeFormat(undefined, {
    timeStyle: "medium",
  }).format(date)}`;
}

export function formatDate(value: Date | number | string | null | undefined): string {
  const parts = dateParts(value);
  if (!parts) {
    return "Not loaded";
  }

  const [day, month, year] = parts;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function formatDuration(durationMs: number | null | undefined): string {
  if (durationMs === null || durationMs === undefined) {
    return "n/a";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function compactError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unexpected error";
}

function dateParts(value: Date | number | string | null | undefined): [number, number, number] | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDate) {
      const year = Number(isoDate[1]);
      const month = Number(isoDate[2]);
      const day = Number(isoDate[3]);
      return validDateParts(day, month, year) ? [day, month, year] : null;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return [date.getDate(), date.getMonth() + 1, date.getFullYear()];
}

function validDateParts(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
