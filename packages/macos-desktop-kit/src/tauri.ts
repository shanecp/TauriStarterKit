import { invoke } from "@tauri-apps/api/core";

import {
  finishPageTopLoadingIndicator,
  startPageTopLoadingIndicator,
} from "./pageTopLoadingIndicatorStore";

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
  pageTopLoadingIndicatorLabel?: string | false;
  pageTopLoadingIndicatorLabels?: Partial<Record<CommandName, string>>;
};

export async function tauriInvoke<T, CommandName extends string = string>(
  command: CommandName,
  args?: Record<string, unknown>,
  options: TauriInvokeOptions<CommandName> = {},
): Promise<T> {
  const pageTopLoadingIndicatorLabel =
    options.pageTopLoadingIndicatorLabel === false
      ? null
      : options.pageTopLoadingIndicatorLabel ??
        options.pageTopLoadingIndicatorLabels?.[command] ??
        null;
  const pageTopLoadingIndicatorId = pageTopLoadingIndicatorLabel
    ? startPageTopLoadingIndicator(command, pageTopLoadingIndicatorLabel)
    : null;

  try {
    return await invoke<T>(command, args);
  } finally {
    if (pageTopLoadingIndicatorId) {
      finishPageTopLoadingIndicator(pageTopLoadingIndicatorId);
    }
  }
}

export function createTauriInvoke<CommandName extends string>(
  pageTopLoadingIndicatorLabels: Partial<Record<CommandName, string>> = {},
) {
  return function invokeCommand<T>(
    command: CommandName,
    args?: Record<string, unknown>,
    options: TauriInvokeOptions<CommandName> = {},
  ): Promise<T> {
    return tauriInvoke<T, CommandName>(command, args, {
      pageTopLoadingIndicatorLabels,
      ...options,
    });
  };
}
