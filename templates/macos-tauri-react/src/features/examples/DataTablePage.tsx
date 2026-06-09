import { ArrowDown, ArrowUp, ClipboardCopy, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { formatDate } from "../../shared/lib/format";
import { useNotifications } from "../../shared/notifications/useNotifications";
import {
  getStoredDefaultPaginationSize,
  PAGINATION_SIZE_OPTIONS,
  type PaginationSize,
} from "../../shared/settings/applicationSettings";
import { copyTextToClipboard } from "./clipboard";
import {
  DEFAULT_RECORD_SORT,
  exampleRecords,
  filterRecords,
  paginateRecords,
  recordsToTsv,
  sortRecords,
  type ExampleRecord,
  type RecordSort,
  type SortKey,
} from "./dataTable";

type Column = {
  key: SortKey;
  label: string;
  align?: "left" | "right";
  maxWidthClass?: string;
  render: (record: ExampleRecord) => string;
};

const columns: Column[] = [
  {
    key: "id",
    label: "ID",
    align: "right",
    maxWidthClass: "max-w-16",
    render: (record) => String(record.id),
  },
  {
    key: "name",
    label: "Name",
    maxWidthClass: "max-w-40",
    render: (record) => record.name,
  },
  {
    key: "owner",
    label: "Owner",
    maxWidthClass: "max-w-32",
    render: (record) => record.owner,
  },
  {
    key: "status",
    label: "Status",
    maxWidthClass: "max-w-28",
    render: (record) => record.status,
  },
  {
    key: "total",
    label: "Total",
    align: "right",
    maxWidthClass: "max-w-28",
    render: (record) => record.total.toLocaleString(),
  },
  {
    key: "createdAt",
    label: "Created",
    align: "right",
    maxWidthClass: "max-w-32",
    render: (record) => formatDate(record.createdAt),
  },
  {
    key: "updatedAt",
    label: "Updated",
    align: "right",
    maxWidthClass: "max-w-32",
    render: (record) => formatDate(record.updatedAt),
  },
];

export function DataTablePage() {
  const notifications = useNotifications();
  const [records, setRecords] = useState(exampleRecords);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<RecordSort>(DEFAULT_RECORD_SORT);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PaginationSize>(
    getStoredDefaultPaginationSize,
  );
  const [confirmDeletes, setConfirmDeletes] = useState(true);
  const [showRowSelection, setShowRowSelection] = useState(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [deleteCandidate, setDeleteCandidate] = useState<ExampleRecord | null>(null);

  const filteredRecords = useMemo(
    () => filterRecords(records, query),
    [query, records],
  );
  const sortedRecords = useMemo(
    () => sortRecords(filteredRecords, sort),
    [filteredRecords, sort],
  );
  const pagination = useMemo(
    () => paginateRecords(sortedRecords, page, pageSize),
    [page, pageSize, sortedRecords],
  );

  useEffect(() => {
    setPage(1);
  }, [pageSize, query]);

  useEffect(() => {
    const recordIds = new Set(records.map((record) => record.id));
    setSelectedRecordIds((current) => {
      const next = new Set([...current].filter((id) => recordIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [records]);

  const selectedOnPage = pagination.items.filter((record) =>
    selectedRecordIds.has(record.id),
  ).length;
  const isPageSelected =
    pagination.items.length > 0 && selectedOnPage === pagination.items.length;

  function updateSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  async function copyTableData() {
    try {
      await copyTextToClipboard(recordsToTsv(pagination.items));
      notifications.success("Table data copied.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Copy failed.");
    }
  }

  function toggleRecordSelection(recordId: number, checked: boolean) {
    setSelectedRecordIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(recordId);
      } else {
        next.delete(recordId);
      }
      return next;
    });
  }

  function togglePageSelection(checked: boolean) {
    setSelectedRecordIds((current) => {
      const next = new Set(current);
      pagination.items.forEach((record) => {
        if (checked) {
          next.add(record.id);
        } else {
          next.delete(record.id);
        }
      });
      return next;
    });
  }

  function requestDelete(record: ExampleRecord) {
    if (confirmDeletes) {
      setDeleteCandidate(record);
      return;
    }

    deleteRecord(record);
  }

  function deleteRecord(record: ExampleRecord) {
    setRecords((current) => current.filter((item) => item.id !== record.id));
    setSelectedRecordIds((current) => {
      if (!current.has(record.id)) {
        return current;
      }

      const next = new Set(current);
      next.delete(record.id);
      return next;
    });
    notifications.warning(`${record.name} deleted.`);
  }

  return (
    <div>
      <PageHeader
        actions={
          <Button onClick={copyTableData}>
            <ClipboardCopy size={15} />
            Copy Table Data
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Data Table"
          description={`${pagination.totalItems} records`}
          actions={<StatusBadge label={`Page ${pagination.page}`} tone="neutral" />}
        />
        <CardBody>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <label className="grid flex-1 gap-2 text-sm font-medium text-app-ink">
              Filter
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search records"
                className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition placeholder:text-app-muted focus:border-app-accent"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-app-ink">
              Page size
              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as PaginationSize)
                }
                className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition focus:border-app-accent"
              >
                {PAGINATION_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex h-10 items-center gap-2 text-sm font-medium text-app-ink">
              <input
                type="checkbox"
                checked={showRowSelection}
                onChange={(event) => setShowRowSelection(event.target.checked)}
                className="h-4 w-4 accent-app-accent"
              />
              Row Selector
            </label>
            <label className="flex h-10 items-center gap-2 text-sm font-medium text-app-ink">
              <input
                type="checkbox"
                checked={confirmDeletes}
                onChange={(event) => setConfirmDeletes(event.target.checked)}
                className="h-4 w-4 accent-app-accent"
              />
              Confirm Delete
            </label>
          </div>

          <div className="overflow-hidden rounded-md border border-app-border">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-app-subtle text-app-muted">
                  <tr>
                    {showRowSelection ? (
                      <th scope="col" className="w-10 px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          aria-label="Select all rows on this page"
                          checked={isPageSelected}
                          onChange={(event) =>
                            togglePageSelection(event.target.checked)
                          }
                          className="h-4 w-4 accent-app-accent"
                        />
                      </th>
                    ) : null}
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`px-3 py-2 font-semibold ${
                          column.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => updateSort(column.key)}
                          className={`inline-flex items-center gap-1 ${
                            column.align === "right" ? "justify-end" : ""
                          }`}
                        >
                          {column.label}
                          {sort.key === column.key ? (
                            sort.direction === "asc" ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : null}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.items.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-app-border transition hover:bg-app-subtle"
                    >
                      {showRowSelection ? (
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            aria-label={`Select ${record.name}`}
                            checked={selectedRecordIds.has(record.id)}
                            onChange={(event) =>
                              toggleRecordSelection(record.id, event.target.checked)
                            }
                            className="h-4 w-4 accent-app-accent"
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-3 py-2 ${
                            column.align === "right" ? "text-right" : "text-left"
                          }`}
                        >
                          <span
                            className={`block truncate ${column.maxWidthClass ?? ""}`}
                          >
                            {column.render(record)}
                          </span>
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() =>
                              notifications.info(`${record.name} selected.`)
                            }
                            className="h-8"
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => requestDelete(record)}
                            className="h-8"
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-app-muted">
            <span>
              Showing {pagination.items.length} of {pagination.totalItems}
              {showRowSelection && selectedRecordIds.size > 0
                ? ` - ${selectedRecordIds.size} selected`
                : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1),
                  )
                }
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {deleteCandidate ? (
        <ConfirmDeleteDialog
          record={deleteCandidate}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={() => {
            deleteRecord(deleteCandidate);
            setDeleteCandidate(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ConfirmDeleteDialog({
  record,
  onCancel,
  onConfirm,
}: {
  record: ExampleRecord;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="w-full max-w-sm rounded-lg border border-app-border bg-app-panel p-5 shadow-xl"
      >
        <h2 id="confirm-delete-title" className="text-base font-semibold text-app-ink">
          Confirm Delete
        </h2>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Delete {record.name}? This removes the row from the demo data table.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
