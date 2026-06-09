# Form Patterns

Use the forms example for create and edit workflows with grouped controls, helper text, and route-owned breadcrumbs.

## Files

```text
src/features/examples/FormsPage.tsx
src/app/routes.tsx
```

Keep form state in the feature page. Keep route labels and breadcrumbs in `src/app/routes.tsx`.

## Browse Vs Edit

Browse pages should show records and a clear create action.

Create and edit forms should be opened from buttons, not embedded permanently in the browse page.

Use route-backed workflow pages when the page identity changes:

```text
/examples/forms
/examples/forms/new
/examples/forms/edit
```

This keeps breadcrumbs correct:

```text
Dashboard > Examples > Forms > Edit Form
```

## Grouping

Group related controls under small section headings:

```text
Details
Scheduling
Attachment
```

Keep headings compact. Do not use hero-scale headings inside forms.

## Helper Text

Use helper icons for optional explanations. The icon button should have an accessible label and reveal visible helper text when clicked.

Recommended pattern:

```text
button aria-controls="field-helper"
button aria-expanded={open}
visible helper paragraph when open
```

Do not rely only on `title` attributes. Tooltips are not enough for important form guidance.

## Inputs

Use placeholders where they help data entry. Use helper text for rules, formatting, or explanations that are not obvious from the label.

Use controlled inputs for template examples so validation and reset behavior are clear.

## Validation

Show inline or toast feedback for simple demo validation. For production apps, prefer field-level errors near the affected input when the user needs to fix specific values.
