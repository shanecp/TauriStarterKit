import { invoke } from "@tauri-apps/api/core";

import {
  finishGlobalActivity,
  startGlobalActivity,
} from "./activityStore";

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

export type TauriInvokeOptions<CommandName extends string = string> = {
  activityLabel?: string | false;
  activityLabels?: Partial<Record<CommandName, string>>;
};

export async function tauriInvoke<T, CommandName extends string = string>(
  command: CommandName,
  args?: Record<string, unknown>,
  options: TauriInvokeOptions<CommandName> = {},
): Promise<T> {
  const activityLabel =
    options.activityLabel === false
      ? null
      : options.activityLabel ?? options.activityLabels?.[command] ?? "Working";
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
