import { APP_META } from "../appMeta";

export type SettingValidator<T> = (value: unknown) => value is T;

export function createStorageKey(namespace: string, key: string): string {
  return `${namespace}.${key}`;
}

export function readSetting<T>(
  key: string,
  validator: SettingValidator<T>,
  fallback: T,
): T {
  try {
    const stored = window.localStorage.getItem(createStorageKey(APP_META.slug, key));
    if (stored === null) {
      return fallback;
    }

    const parsed = JSON.parse(stored) as unknown;
    return validator(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeSetting<T>(key: string, value: T): T {
  try {
    window.localStorage.setItem(
      createStorageKey(APP_META.slug, key),
      JSON.stringify(value),
    );
  } catch {
    // Local settings are non-critical; keep the in-memory value if storage fails.
  }

  return value;
}

export function removeSetting(key: string): void {
  try {
    window.localStorage.removeItem(createStorageKey(APP_META.slug, key));
  } catch {
    // Ignore storage failures for optional local preferences.
  }
}
