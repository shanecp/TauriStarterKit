import { tauriInvoke } from "../../shared/lib/tauri";
import type { ExamplePingResponse } from "./example.types";

const TAURI_INTERNALS_PROPERTY = ["", "TAURI_INTERNALS", ""].join("__");

export function examplePing(): Promise<ExamplePingResponse> {
  if (!isTauriRuntime()) {
    return Promise.resolve({
      message: "Browser preview response",
      received_at_epoch_ms: Date.now(),
    });
  }

  return tauriInvoke<ExamplePingResponse>("example_ping");
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && TAURI_INTERNALS_PROPERTY in window;
}
