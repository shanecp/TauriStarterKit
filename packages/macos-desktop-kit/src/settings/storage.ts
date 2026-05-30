export type SettingValidator<T> = (value: unknown) => value is T;

export function createStorageKey(namespace: string, key: string): string {
  return `${namespace}.${key}`;
}

export function readSetting<T>(
  namespace: string,
  key: string,
  validator: SettingValidator<T>,
  fallback: T,
): T {
  try {
    const stored = window.localStorage.getItem(createStorageKey(namespace, key));
    if (stored === null) {
      return fallback;
    }

    const parsed = JSON.parse(stored) as unknown;
    return validator(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeSetting<T>(namespace: string, key: string, value: T): T {
  try {
    window.localStorage.setItem(createStorageKey(namespace, key), JSON.stringify(value));
  } catch {
    // Local settings are non-critical; keep the in-memory value if storage fails.
  }

  return value;
}

export function removeSetting(namespace: string, key: string): void {
  try {
    window.localStorage.removeItem(createStorageKey(namespace, key));
  } catch {
    // Ignore storage failures for optional local preferences.
  }
}
