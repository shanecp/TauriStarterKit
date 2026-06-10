import { tauriInvoke, type TauriInvokeOptions } from "../../shared/lib/tauri";
import type { ExamplePingResponse } from "./example.types";

const TAURI_INTERNALS_PROPERTY = ["", "TAURI_INTERNALS", ""].join("__");

export function examplePing(
  options: TauriInvokeOptions = {},
): Promise<ExamplePingResponse> {
  if (!isTauriRuntime()) {
    return Promise.resolve({
      message: "Browser preview response",
      received_at_epoch_ms: Date.now(),
    });
  }

  return tauriInvoke<ExamplePingResponse>("example_ping", undefined, options);
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && TAURI_INTERNALS_PROPERTY in window;
}
