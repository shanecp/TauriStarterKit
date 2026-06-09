export type ThemeMode = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";
export type ThemePalette = "blue" | "green" | "rose";

export const themeModes: ThemeMode[] = ["system", "light", "dark"];
export const themePalettes: ThemePalette[] = ["blue", "green", "rose"];

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && themeModes.includes(value as ThemeMode);
}

export function isThemePalette(value: unknown): value is ThemePalette {
  return (
    typeof value === "string" && themePalettes.includes(value as ThemePalette)
  );
}

export function resolveEffectiveTheme(
  mode: ThemeMode,
  systemPrefersDark: boolean,
): EffectiveTheme {
  if (mode === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return mode;
}
