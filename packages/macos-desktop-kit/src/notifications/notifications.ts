import { toast, type Id, type ToastOptions } from "react-toastify";

import type { CommandResult } from "../tauri";

export type NotificationTone = "success" | "error" | "warning" | "info" | "neutral";

export type NotificationOptions = {
  id?: Id;
};

export type CommandNotificationOptions = {
  successMessage?: string;
  errorMessage?: string;
};

export type NotificationApi = {
  notify: (
    tone: NotificationTone,
    message: string,
    options?: NotificationOptions,
  ) => Id;
  success: (message: string, options?: NotificationOptions) => Id;
  error: (message: string, options?: NotificationOptions) => Id;
  warning: (message: string, options?: NotificationOptions) => Id;
  info: (message: string, options?: NotificationOptions) => Id;
  neutral: (message: string, options?: NotificationOptions) => Id;
  commandResult: (
    result: CommandResult,
    options?: CommandNotificationOptions,
  ) => Id;
};

type ToastEmitter = (message: string, options?: ToastOptions) => Id;

const toastEmitters: Record<NotificationTone, ToastEmitter> = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
  neutral: toast,
};

function toToastOptions(options?: NotificationOptions): ToastOptions | undefined {
  if (!options?.id) {
    return undefined;
  }

  return { toastId: options.id };
}

function defaultSuccessMessage(result: CommandResult): string {
  return `${result.command_label} completed.`;
}

function defaultErrorMessage(result: CommandResult): string {
  return result.error_message ?? `${result.command_label} failed.`;
}

export const notifications: NotificationApi = {
  notify(tone, message, options) {
    return toastEmitters[tone](message, toToastOptions(options));
  },
  success(message, options) {
    return notifications.notify("success", message, options);
  },
  error(message, options) {
    return notifications.notify("error", message, options);
  },
  warning(message, options) {
    return notifications.notify("warning", message, options);
  },
  info(message, options) {
    return notifications.notify("info", message, options);
  },
  neutral(message, options) {
    return notifications.notify("neutral", message, options);
  },
  commandResult(result, options) {
    if (result.success) {
      return notifications.success(
        options?.successMessage ?? defaultSuccessMessage(result),
      );
    }

    return notifications.error(options?.errorMessage ?? defaultErrorMessage(result));
  },
};
