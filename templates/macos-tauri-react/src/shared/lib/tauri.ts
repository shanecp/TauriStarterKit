import { invoke } from "@tauri-apps/api/core";

import {
  finishGlobalActivity,
  startGlobalActivity,
} from "../activity/activityStore";

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

const ACTIVITY_LABELS: Partial<Record<AppCommand, string>> = {
  example_ping: "Checking backend",
  get_diagnostics: "Loading diagnostics",
};

export async function tauriInvoke<T>(
  command: AppCommand,
  args?: Record<string, unknown>,
): Promise<T> {
  const activityId = startGlobalActivity(command, ACTIVITY_LABELS[command] ?? "Working");

  try {
    return await invoke<T>(command, args);
  } finally {
    finishGlobalActivity(activityId);
  }
}
