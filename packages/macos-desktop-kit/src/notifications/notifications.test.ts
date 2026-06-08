import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifications } from "./notifications";
import { notificationContainerProps } from "./toastContainerConfig";
import type { CommandResult } from "../tauri";

const toastMock = vi.hoisted(() => {
  const baseToast = vi.fn();

  return Object.assign(baseToast, {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  });
});

vi.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: toastMock,
}));

describe("notifications", () => {
  beforeEach(() => {
    toastMock.mockClear();
    toastMock.error.mockClear();
    toastMock.info.mockClear();
    toastMock.success.mockClear();
    toastMock.warning.mockClear();
  });

  it("maps notification tones to React-Toastify emitters", () => {
    notifications.success("Saved");
    notifications.error("Failed");
    notifications.warning("Check settings");
    notifications.info("Working");
    notifications.neutral("Copied");

    expect(toastMock.success).toHaveBeenCalledWith("Saved", undefined);
    expect(toastMock.error).toHaveBeenCalledWith("Failed", undefined);
    expect(toastMock.warning).toHaveBeenCalledWith("Check settings", undefined);
    expect(toastMock.info).toHaveBeenCalledWith("Working", undefined);
    expect(toastMock).toHaveBeenCalledWith("Copied", undefined);
  });

  it("uses stable toast ids when provided", () => {
    notifications.info("Already open", { id: "settings-open" });

    expect(toastMock.info).toHaveBeenCalledWith("Already open", {
      toastId: "settings-open",
    });
  });

  it("maps command results to success and error notifications", () => {
    notifications.commandResult(commandResult({ success: true }));
    notifications.commandResult(
      commandResult({ success: false, error_message: "Command failed" }),
    );

    expect(toastMock.success).toHaveBeenCalledWith(
      "Test command completed.",
      undefined,
    );
    expect(toastMock.error).toHaveBeenCalledWith("Command failed", undefined);
  });

  it("sets the notification container defaults", () => {
    expect(notificationContainerProps).toMatchObject({
      autoClose: 4000,
      closeOnClick: false,
      limit: 3,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      position: "top-right",
    });
  });

  it("keeps React-Toastify imports inside shared notification files", () => {
    const sourceRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
    );
    const files = listSourceFiles(sourceRoot)
      .filter((file) => readFileSync(file, "utf8").includes("react-toastify"))
      .map((file) => path.relative(sourceRoot, file));

    expect(files.every((file) => file.startsWith("notifications/"))).toBe(true);
  });
});

function commandResult(overrides: Partial<CommandResult>): CommandResult {
  return {
    command_label: "Test command",
    duration_ms: 12,
    error_message: null,
    exit_code: 0,
    stderr: "",
    stdout: "",
    success: true,
    ...overrides,
  };
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const file = path.join(dir, entry);
    const stats = statSync(file);

    if (stats.isDirectory()) {
      return listSourceFiles(file);
    }

    return /\.(ts|tsx)$/.test(file) ? [file] : [];
  });
}
