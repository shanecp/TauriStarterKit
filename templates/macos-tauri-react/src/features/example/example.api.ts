import { tauriInvoke } from "../../shared/lib/tauri";
import type { ExamplePingResponse } from "./example.types";

export function examplePing(): Promise<ExamplePingResponse> {
  return tauriInvoke<ExamplePingResponse>("example_ping");
}
