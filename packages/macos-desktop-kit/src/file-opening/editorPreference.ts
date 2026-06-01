import { readSetting, removeSetting, writeSetting } from "../settings/storage";

export const EDITOR_APP_SETTING_KEY = "preferredEditorAppName";
export const DEFAULT_EDITOR_APP_NAME = "Visual Studio Code";

export const EDITOR_APP_OPTIONS = [
  { label: "VS Code", appName: "Visual Studio Code" },
  { label: "Cursor", appName: "Cursor" },
  { label: "Zed", appName: "Zed" },
  { label: "Sublime Text", appName: "Sublime Text" },
  { label: "Nova", appName: "Nova" },
  { label: "BBEdit", appName: "BBEdit" },
  { label: "Xcode", appName: "Xcode" },
  { label: "TextEdit", appName: "TextEdit" },
] as const;

export function normalizeEditorAppName(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return EDITOR_APP_OPTIONS.some((option) => option.appName === trimmed)
    ? trimmed
    : DEFAULT_EDITOR_APP_NAME;
}

export function getStoredEditorAppName(storageNamespace = "app"): string {
  return normalizeEditorAppName(
    readSetting(
      storageNamespace,
      EDITOR_APP_SETTING_KEY,
      (value): value is string => typeof value === "string",
      DEFAULT_EDITOR_APP_NAME,
    ),
  );
}

export function saveEditorAppName(
  value: string,
  storageNamespace = "app",
): string {
  const normalized = normalizeEditorAppName(value);
  return writeSetting(storageNamespace, EDITOR_APP_SETTING_KEY, normalized);
}

export function resetEditorAppName(storageNamespace = "app"): string {
  removeSetting(storageNamespace, EDITOR_APP_SETTING_KEY);
  return DEFAULT_EDITOR_APP_NAME;
}
