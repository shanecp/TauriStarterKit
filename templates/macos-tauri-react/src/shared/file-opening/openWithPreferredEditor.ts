import { getStoredEditorAppName } from "./editorPreference";

export function openWithPreferredEditor<T>(
  openFile: (editorAppName: string) => Promise<T>,
): Promise<T> {
  return openFile(getStoredEditorAppName());
}
