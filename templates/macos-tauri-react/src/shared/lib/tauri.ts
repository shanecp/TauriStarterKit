import { invoke } from "@tauri-apps/api/core";

export type AppCommand = "get_diagnostics" | "example_ping";

export type CommandResult = {
  command_label: string;
  stdout: string;
  stderr: string;
  exit_code: number | null;
  success: boolean;
  error_message: string | null;
  duration_ms: number;
};

export type EditorAppCommandArgs = {
  editorAppName: string;
};

export function tauriInvoke<T>(
  command: AppCommand,
  args?: Record<string, unknown>,
): Promise<T> {
  return invoke<T>(command, args);
}
