# Data Table Patterns

Use the data table example as the baseline for sortable, filterable, paginated records. Keep data helpers separate from page rendering.

## Files

```text
src/features/examples/DataTablePage.tsx
src/features/examples/dataTable.ts
src/features/examples/dataTable.test.ts
src/shared/settings/applicationSettings.ts
```

`dataTable.ts` owns filtering, sorting, pagination, and export helpers. `DataTablePage.tsx` owns page state and UI composition.

## Required Behavior

Large data sets should be paginated by default. The generated template default is read from application settings.

Use these page size options:

```text
10, 50, 100, 250, 500
```

Sort by latest record first unless the feature has a stronger domain default.

Number, date, and time columns should be right aligned. Text columns should be left aligned. Long values should use max-width and truncation to keep rows scannable.

Rows should have a hover state:

```text
hover:bg-app-subtle
```

## Row Selection

Row selection is optional. If enabled, use a leading checkbox column and a page-level checkbox in the table header.

Selection should track record IDs, not row indexes, so sorting and pagination do not corrupt selected state.

When records are deleted or refreshed, remove missing IDs from the selected set.

## Delete Confirmation

Delete confirmation should be visible in-app UI. Avoid relying on native confirm dialogs for core workflows.

Flow:

```text
Delete button
  -> set delete candidate
  -> render Confirm Delete dialog
  -> confirm removes row
  -> cancel closes dialog
```

Keep confirmation optional when the app has a clear setting or toggle for faster demo workflows.

## Copy Table Data

Use `Copy Table Data` for table export actions. The action should copy the current page in spreadsheet-friendly TSV format.

Do not copy hidden columns unless the button label and user expectation explicitly say so.

## Tests

Keep helper tests in `dataTable.test.ts` for:

```text
default sort
filtering
pagination boundaries
TSV export
```
