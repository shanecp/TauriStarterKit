import { getStoredEditorAppName } from "./editorPreference";

export function openWithPreferredEditor<T>(
  openFile: (editorAppName: string) => Promise<T>,
  storageNamespace = "app",
): Promise<T> {
  return openFile(getStoredEditorAppName(storageNamespace));
}
