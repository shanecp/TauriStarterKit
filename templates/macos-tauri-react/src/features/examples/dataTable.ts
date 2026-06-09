export type ExampleRecordStatus = "Ready" | "Running" | "Queued" | "Blocked";

export type ExampleRecord = {
  id: number;
  name: string;
  owner: string;
  status: ExampleRecordStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type SortDirection = "asc" | "desc";
export type SortKey = keyof Pick<
  ExampleRecord,
  "createdAt" | "id" | "name" | "owner" | "status" | "total" | "updatedAt"
>;

export type RecordSort = {
  key: SortKey;
  direction: SortDirection;
};

export type PaginationResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
};

export const DEFAULT_RECORD_SORT: RecordSort = {
  key: "createdAt",
  direction: "desc",
};

const owners = ["Avery", "Morgan", "Taylor", "Jordan", "Casey", "Riley"];
const statuses: ExampleRecordStatus[] = ["Ready", "Running", "Queued", "Blocked"];

export const exampleRecords: ExampleRecord[] = Array.from({ length: 137 }, (_, index) => {
  const id = index + 1;
  const createdAt = dateOffsetIso(id);
  const updatedAt = dateOffsetIso(id + (index % 9));

  return {
    id,
    name: `Record ${String(id).padStart(3, "0")}`,
    owner: owners[index % owners.length],
    status: statuses[index % statuses.length],
    total: 1250 + id * 37,
    createdAt,
    updatedAt,
  };
});

export function filterRecords(
  records: ExampleRecord[],
  query: string,
): ExampleRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) =>
    [record.name, record.owner, record.status, String(record.id)].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}

export function sortRecords(
  records: ExampleRecord[],
  sort: RecordSort = DEFAULT_RECORD_SORT,
): ExampleRecord[] {
  return [...records].sort((left, right) => {
    const leftValue = left[sort.key];
    const rightValue = right[sort.key];
    const direction = sort.direction === "asc" ? 1 : -1;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

export function paginateRecords<T>(
  records: T[],
  page: number,
  pageSize: number,
): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * pageSize;

  return {
    items: records.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalPages,
    totalItems: records.length,
  };
}

export function recordsToTsv(records: ExampleRecord[]): string {
  const headers = ["ID", "Name", "Owner", "Status", "Total", "Created", "Updated"];
  const rows = records.map((record) => [
    record.id,
    record.name,
    record.owner,
    record.status,
    record.total,
    record.createdAt,
    record.updatedAt,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => sanitizeTsvValue(String(value))).join("\t"))
    .join("\n");
}

function sanitizeTsvValue(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ");
}

function dateOffsetIso(dayOffset: number): string {
  const date = new Date(Date.UTC(2026, 0, 1 + dayOffset, 9, 30));
  return date.toISOString();
}
