export type DiskSpaceInfo = {
  available: boolean;
  filesystem: string;
  mount_point: string;
  total_bytes: number | null;
  used_bytes: number | null;
  available_bytes: number | null;
  capacity_percent: number | null;
  error_message: string | null;
};

export type DiagnosticsResponse = {
  app_name: string;
  version: string;
  environment: string;
  bundle_identifier: string;
  tauri_version: string;
  macos_version: string;
  cpu_architecture: string;
  disk_space: DiskSpaceInfo;
};
