# Theme Customisation

The template theme system is token-based. Feature components should use `text-app-*`, `bg-app-*`, and `border-app-*` classes instead of hard-coded colors.

## Ownership

Theme state lives in:

```text
src/shared/theme/ThemeProvider.tsx
src/shared/theme/theme.ts
src/styles.css
```

`ThemeProvider` writes these attributes on the document root:

```text
data-theme="light | dark"
data-theme-mode="system | light | dark"
data-theme-palette="blue | green | rose"
```

`src/styles.css` maps those attributes to CSS tokens.

## Modes And Palettes

Theme mode controls light or dark appearance. Palette controls the color family.

When adding a palette:

```text
1. Add the palette name to ThemePalette and themePalettes in src/shared/theme/theme.ts.
2. Add a user-facing label in SettingsPage.
3. Add full token overrides in src/styles.css.
4. Test both light and dark modes.
```

Palette overrides must include the full interface tokens, not only accent colors:

```text
--color-app-bg
--color-app-panel
--color-app-border
--color-app-muted
--color-app-ink
--color-app-accent
--color-app-accent-hover
--color-app-accent-soft
--color-app-subtle
--color-app-code
--color-app-code-text
```

Also override feedback tokens when the palette changes their visual context:

```text
--color-app-success-*
--color-app-error-*
--color-app-warning-*
--color-app-info-*
--color-app-neutral-*
```

## Component Rules

Use theme tokens for all app surfaces:

```text
bg-app-bg
bg-app-panel
bg-app-subtle
border-app-border
text-app-ink
text-app-muted
text-app-accent
```

Use `bg-app-code` and `text-app-code-text` for code blocks.

Do not introduce page-specific color constants unless the app has a real domain state that needs a separate token. Prefer extending the token set in `src/styles.css`.

## Toasts

Toast styles in `src/styles.css` use app feedback tokens. Keep toast colors derived from the same token set so palette changes apply consistently.

## Validation

After changing theme tokens:

```text
npm run typecheck
npm run lint
npm test
npm run build
```

Preview at least:

```text
Light + Blue
Light + Green
Light + Rose
Dark + Blue
Dark + Green
Dark + Rose
```
