import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_EDITOR_APP_NAME,
  EDITOR_APP_SETTING_KEY,
  getStoredEditorAppName,
  normalizeEditorAppName,
  resetEditorAppName,
  saveEditorAppName,
} from "./editorPreference";
import { openWithPreferredEditor } from "./openWithPreferredEditor";

function stubLocalStorage(value: string | null, namespace = "sample-app") {
  const getItem = vi.fn((key: string) =>
    key === `${namespace}.${EDITOR_APP_SETTING_KEY}` ? value : null,
  );
  const removeItem = vi.fn();
  const setItem = vi.fn();

  vi.stubGlobal("window", {
    localStorage: {
      getItem,
      removeItem,
      setItem,
    },
  });

  return { getItem, removeItem, setItem };
}

describe("editor preference helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts supported editor app names", () => {
    expect(normalizeEditorAppName("Nova")).toBe("Nova");
    expect(normalizeEditorAppName("  Visual Studio Code  ")).toBe(
      "Visual Studio Code",
    );
  });

  it("normalizes unsupported stored values to the default editor", () => {
    expect(normalizeEditorAppName("VS Code")).toBe(DEFAULT_EDITOR_APP_NAME);
    expect(normalizeEditorAppName("")).toBe(DEFAULT_EDITOR_APP_NAME);
    expect(normalizeEditorAppName(null)).toBe(DEFAULT_EDITOR_APP_NAME);
  });

  it("falls back to the default editor when localStorage is unavailable", () => {
    expect(getStoredEditorAppName("sample-app")).toBe(DEFAULT_EDITOR_APP_NAME);
  });

  it("reads supported editor names from namespaced localStorage", () => {
    stubLocalStorage(JSON.stringify("TextEdit"));

    expect(getStoredEditorAppName("sample-app")).toBe("TextEdit");
  });

  it("saves normalized editor names to namespaced localStorage", () => {
    const { setItem } = stubLocalStorage(null);

    expect(saveEditorAppName("Cursor", "sample-app")).toBe("Cursor");
    expect(setItem).toHaveBeenCalledWith(
      `sample-app.${EDITOR_APP_SETTING_KEY}`,
      JSON.stringify("Cursor"),
    );
  });

  it("resets editor names from namespaced localStorage", () => {
    const { removeItem } = stubLocalStorage(JSON.stringify("Cursor"));

    expect(resetEditorAppName("sample-app")).toBe(DEFAULT_EDITOR_APP_NAME);
    expect(removeItem).toHaveBeenCalledWith(
      `sample-app.${EDITOR_APP_SETTING_KEY}`,
    );
  });

  it("passes the stored editor into file open callbacks", async () => {
    stubLocalStorage(JSON.stringify("Cursor"));
    const openFile = vi.fn(async (editorAppName: string) => editorAppName);

    await expect(openWithPreferredEditor(openFile, "sample-app")).resolves.toBe(
      "Cursor",
    );
    expect(openFile).toHaveBeenCalledWith("Cursor");
  });
});
