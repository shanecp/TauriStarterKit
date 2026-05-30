export type ThemeMode = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";

export const themeModes: ThemeMode[] = ["system", "light", "dark"];

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && themeModes.includes(value as ThemeMode);
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
