import { tauriInvoke } from "../../shared/lib/tauri";
import type { DiagnosticsResponse } from "./settings.types";

export function getDiagnostics(): Promise<DiagnosticsResponse> {
  return tauriInvoke<DiagnosticsResponse>("get_diagnostics");
}

