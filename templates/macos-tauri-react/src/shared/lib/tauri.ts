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

export type TauriInvokeOptions<CommandName extends string = string> = {
  activityLabel?: string | false;
  activityLabels?: Partial<Record<CommandName, string>>;
};

export async function tauriInvoke<T, CommandName extends string = AppCommand>(
  command: CommandName,
  args?: Record<string, unknown>,
  options: TauriInvokeOptions<CommandName> = {},
): Promise<T> {
  const activityLabel =
    options.activityLabel === false
      ? null
      : options.activityLabel ??
        options.activityLabels?.[command] ??
        ACTIVITY_LABELS[command as AppCommand] ??
        "Working";
  const activityId = activityLabel
    ? startGlobalActivity(command, activityLabel)
    : null;

  try {
    return await invoke<T>(command, args);
  } finally {
    if (activityId) {
      finishGlobalActivity(activityId);
    }
  }
}

export function createTauriInvoke<CommandName extends string>(
  activityLabels: Partial<Record<CommandName, string>> = {},
) {
  return function invokeCommand<T>(
    command: CommandName,
    args?: Record<string, unknown>,
    options: TauriInvokeOptions<CommandName> = {},
  ): Promise<T> {
    return tauriInvoke<T, CommandName>(command, args, {
      activityLabels,
      ...options,
    });
  };
}
