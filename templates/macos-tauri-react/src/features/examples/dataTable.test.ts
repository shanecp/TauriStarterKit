import { describe, expect, it } from "vitest";

import {
  DEFAULT_RECORD_SORT,
  filterRecords,
  paginateRecords,
  recordsToTsv,
  sortRecords,
  type ExampleRecord,
} from "./dataTable";

const records: ExampleRecord[] = [
  {
    id: 1,
    name: "Alpha",
    owner: "Avery",
    status: "Ready",
    total: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Beta",
    owner: "Morgan",
    status: "Blocked",
    total: 10,
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
  },
];

describe("data table helpers", () => {
  it("sorts by latest record first by default", () => {
    expect(sortRecords(records, DEFAULT_RECORD_SORT).map((record) => record.id)).toEqual([
      2,
      1,
    ]);
  });

  it("filters records by visible fields", () => {
    expect(filterRecords(records, "blocked")).toHaveLength(1);
    expect(filterRecords(records, "avery")[0]?.id).toBe(1);
  });

  it("paginates with clamped page boundaries", () => {
    const page = paginateRecords(records, 3, 1);

    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.items[0]?.id).toBe(2);
  });

  it("exports the current page as spreadsheet-friendly TSV", () => {
    expect(recordsToTsv([records[0]])).toBe(
      [
        "ID\tName\tOwner\tStatus\tTotal\tCreated\tUpdated",
        "1\tAlpha\tAvery\tReady\t20\t2026-01-01T00:00:00.000Z\t2026-01-02T00:00:00.000Z",
      ].join("\n"),
    );
  });
});
