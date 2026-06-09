import { HelpCircle, Pencil, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { formatDate } from "../../shared/lib/format";
import { useNotifications } from "../../shared/notifications/useNotifications";

type DemoFormRecord = {
  id: number;
  title: string;
  category: string;
  owners: string[];
  dueDate: string;
  attachmentName: string;
};

type DemoFormDraft = Omit<DemoFormRecord, "id"> & {
  id?: number;
};

type FormsPageView = "list" | "create" | "edit";

const ownerOptions = ["Avery", "Morgan", "Taylor", "Jordan"];

const initialRecords: DemoFormRecord[] = [
  {
    id: 1,
    title: "Quarterly report",
    category: "Document",
    owners: ["Avery", "Morgan"],
    dueDate: "2026-07-15",
    attachmentName: "brief.pdf",
  },
  {
    id: 2,
    title: "Data import",
    category: "Workflow",
    owners: ["Taylor"],
    dueDate: "2026-07-22",
    attachmentName: "",
  },
];

function createEmptyDraft(): DemoFormDraft {
  return {
    title: "",
    category: "Document",
    owners: [],
    dueDate: "",
    attachmentName: "",
  };
}

export function FormsPage({
  view = "list",
  onNavigate,
}: {
  view?: FormsPageView;
  onNavigate: (path: string) => void;
}) {
  const notifications = useNotifications();
  const [records, setRecords] = useState(initialRecords);
  const [draft, setDraft] = useState<DemoFormDraft | null>(null);
  const isEditing = view !== "list";

  useEffect(() => {
    if (view === "list") {
      setDraft(null);
      return;
    }

    if (view === "create") {
      setDraft((current) => (current && !current.id ? current : createEmptyDraft()));
      return;
    }

    setDraft((current) => (current?.id ? current : records[0] ? { ...records[0] } : null));
  }, [records, view]);

  function startCreate() {
    setDraft(createEmptyDraft());
    onNavigate("/examples/forms/new");
  }

  function startEdit(record: DemoFormRecord) {
    setDraft({ ...record });
    onNavigate("/examples/forms/edit");
  }

  function closeEditor() {
    setDraft(null);
    onNavigate("/examples/forms");
  }

  function saveDraft() {
    if (!draft?.title.trim()) {
      notifications.error("Title is required.");
      return;
    }

    if (draft.id) {
      setRecords((current) =>
        current.map((record) =>
          record.id === draft.id ? { ...draft, id: draft.id } : record,
        ),
      );
      notifications.success("Form updated.");
    } else {
      const nextId = Math.max(0, ...records.map((record) => record.id)) + 1;
      setRecords((current) => [...current, { ...draft, id: nextId }]);
      notifications.success("Form created.");
    }

    closeEditor();
  }

  return (
    <div>
      <PageHeader
        actions={
          !isEditing ? (
            <Button onClick={startCreate}>
              <Plus size={15} />
              New
            </Button>
          ) : null
        }
      />

      {isEditing && draft ? (
        <FormEditor
          draft={draft}
          onChange={setDraft}
          onCancel={closeEditor}
          onSave={saveDraft}
        />
      ) : (
        <Card>
          <CardHeader
            title="Form Records"
            description={`${records.length} records`}
            actions={<StatusBadge label="Browse" tone="neutral" />}
          />
          <CardBody>
            <div className="grid gap-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="grid gap-3 rounded-md border border-app-border bg-app-subtle px-4 py-3 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-app-ink">
                      {record.title}
                    </div>
                    <div className="mt-1 text-sm text-app-muted">
                      {record.category} - {record.owners.join(", ") || "Unassigned"} -{" "}
                      {formatDate(record.dueDate)}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => startEdit(record)}>
                    <Pencil size={15} />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function FormEditor({
  draft,
  onChange,
  onCancel,
  onSave,
}: {
  draft: DemoFormDraft;
  onChange: (draft: DemoFormDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [showScheduleHelp, setShowScheduleHelp] = useState(false);

  function updateField<Key extends keyof DemoFormDraft>(
    key: Key,
    value: DemoFormDraft[Key],
  ) {
    onChange({ ...draft, [key]: value });
  }

  function updateOwners(selectedOptions: HTMLCollectionOf<HTMLOptionElement>) {
    updateField(
      "owners",
      Array.from(selectedOptions)
        .filter((option) => option.selected)
        .map((option) => option.value),
    );
  }

  return (
    <Card>
      <CardHeader
        title={draft.id ? "Edit Form" : "Create Form"}
        description="Grouped form controls."
        actions={<StatusBadge label={draft.id ? "Edit" : "Create"} tone="info" />}
      />
      <CardBody>
        <div className="grid gap-5">
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold text-app-ink">Details</h2>
            <label className="grid gap-2 text-sm font-medium text-app-ink">
              Title
              <input
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Enter title"
                className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition placeholder:text-app-muted focus:border-app-accent"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-app-ink">
              Category
              <select
                value={draft.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition focus:border-app-accent"
              >
                <option>Document</option>
                <option>Workflow</option>
                <option>Review</option>
              </select>
            </label>
          </section>

          <section className="grid gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-app-ink">Scheduling</h2>
              <button
                type="button"
                aria-label="Show scheduling helper text"
                aria-expanded={showScheduleHelp}
                aria-controls="scheduling-helper-text"
                title="Show scheduling helper text"
                onClick={() => setShowScheduleHelp((current) => !current)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-app-muted transition hover:bg-app-subtle hover:text-app-ink"
              >
                <HelpCircle size={15} />
              </button>
            </div>
            {showScheduleHelp ? (
              <p
                id="scheduling-helper-text"
                className="rounded-md border border-app-border bg-app-subtle px-3 py-2 text-sm leading-6 text-app-muted"
              >
                Choose one or more owners, then set a due date. Read-only dates are
                displayed in AU format.
              </p>
            ) : null}
            <label className="grid gap-2 text-sm font-medium text-app-ink">
              Owners
              <select
                multiple
                value={draft.owners}
                onChange={(event) => updateOwners(event.target.selectedOptions)}
                className="min-h-28 rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm font-normal text-app-ink outline-none transition focus:border-app-accent"
              >
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-app-ink">
              Due date
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
                className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition focus:border-app-accent"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-app-ink">
              File upload
              <input
                type="file"
                onChange={(event) =>
                  updateField("attachmentName", event.target.files?.[0]?.name ?? "")
                }
                className="rounded-md border border-app-border bg-app-panel px-3 py-2 text-sm font-normal text-app-ink outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-app-accent-soft file:px-3 file:py-1 file:text-app-accent focus:border-app-accent"
              />
            </label>
          </section>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              <X size={15} />
              Cancel
            </Button>
            <Button onClick={onSave}>
              <Save size={15} />
              Save
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
