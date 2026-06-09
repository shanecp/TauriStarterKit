# Syntax Highlighting

The content example demonstrates optional syntax highlighting for code snippets. Use it for read-only code or configuration previews where highlighting improves scanning.

## Files

```text
src/features/examples/ContentPage.tsx
src/features/examples/codeHighlighting.ts
src/features/examples/codeHighlighting.test.ts
src/styles.css
```

`codeHighlighting.ts` owns the highlighting helper. The page component owns layout and content.

## Usage

Keep code examples read-only unless the feature is explicitly an editor.

Use a stable language name when one is known:

```text
json
typescript
rust
toml
shell
```

When the language is unknown, render plain escaped text instead of guessing.

## Styling

Code blocks should use:

```text
bg-app-code
text-app-code-text
```

Highlight token colors live in `src/styles.css` under `.hljs-*` selectors. Keep these readable in light and dark modes.

## Safety

Highlighted HTML must be sanitized or produced by a trusted highlighter path. Do not inject user-provided HTML directly into the page.

## Tests

Keep tests around escaping and expected highlight output in `codeHighlighting.test.ts`.
