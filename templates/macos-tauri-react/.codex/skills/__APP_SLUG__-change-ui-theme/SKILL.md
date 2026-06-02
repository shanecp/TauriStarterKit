---
name: __APP_SLUG__-change-ui-theme
description: "Project-specific __APP_NAME__ UI theme workflow. Use only when the user explicitly invokes Change UI Theme or $__APP_SLUG__-change-ui-theme to choose, preview, revise, and apply primary/offset color palettes for the app."
---

# Change UI Theme

## Overview

Change __APP_NAME__'s UI palette in this project only. Work through a live preview before treating the palette as accepted.

## Workflow

1. If the user supplied colors, use them. Accept hex values, common color names, and phrases such as "green main with blue accents".
2. If no colors were supplied, ask one concise question for a primary color and optional offset/accent direction before editing files.
3. Track rejected colors or palettes from the conversation and avoid reusing them on retries.
4. Inspect `src/styles.css` and current theme consumers before editing.
5. Choose a complete palette for both light and dark appearances:
   - Use a primary color for main actions, selected navigation, links, focus, and active states.
   - Use an offset color for supporting highlights and secondary visual interest.
   - Preserve semantic success, error, warning, info, and neutral tones unless the user asks to change them.
   - Keep contrast readable in both appearances. Prefer dark text on pale soft colors in light mode, and lighter saturated colors on dark surfaces in dark mode.
   - Avoid one-note palettes unless explicitly requested; primary and offset should normally be different hue families.
6. Apply the theme through semantic tokens in `src/styles.css`. Prefer adding or using:
   - `--color-app-primary`, `--color-app-primary-hover`, `--color-app-primary-soft`, `--color-app-primary-ink`
   - `--color-app-offset`, `--color-app-offset-hover`, `--color-app-offset-soft`, `--color-app-offset-ink`
   - Apply a slight change to `--color-app-bg` using a very light or very dark tone of the primary or offset color that suits the appearance.
   - Add sidebar heading and main heading tokens when useful, such as `--color-app-sidebar-heading-bg`, `--color-app-sidebar-heading-ink`, and `--color-app-heading`.
   - Keep `--color-app-accent*` as compatibility aliases if existing components still use them.
7. Update component classes only where the token meaning is clear. Always include primary buttons, active navigation, the sidebar top heading color/background, and the main body top heading color. Keep the change scoped.
8. Run `npm run build`. Run focused tests if TypeScript or theme logic changed.
9. Start or reuse `npm run dev` and preview `http://127.0.0.1:1420/`.
10. Use the Browser plugin when available. Preview the main screen in both appearances by setting local storage and reloading:

```js
localStorage.setItem("__APP_SLUG__.themeMode", JSON.stringify("light"));
localStorage.setItem("__APP_SLUG__.themeMode", JSON.stringify("dark"));
```

11. Show or summarize the preview result to the user and ask whether to keep it or redo it. If they ask to redo it, revise the palette while excluding rejected colors.

Do not run release scripts for theme previews.
