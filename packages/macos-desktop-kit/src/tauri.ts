import { invoke } from "@tauri-apps/api/core";

export type CommandResult = {
  command_label: string;
  stdout: string;
  stderr: string;
  exit_code: number | null;
  success: boolean;
  error_message: string | null;
  duration_ms: number;
};

export function tauriInvoke<T, CommandName extends string = string>(
  command: CommandName,
  args?: Record<string, unknown>,
): Promise<T> {
  return invoke<T>(command, args);
}

export function createTauriInvoke<CommandName extends string>() {
  return function invokeCommand<T>(
    command: CommandName,
    args?: Record<string, unknown>,
  ): Promise<T> {
    return tauriInvoke<T, CommandName>(command, args);
  };
}
