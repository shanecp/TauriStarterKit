use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandResult {
    pub command_label: String,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub success: bool,
    pub error_message: Option<String>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskSpaceInfo {
    pub available: bool,
    pub filesystem: String,
    pub mount_point: String,
    pub total_bytes: Option<u64>,
    pub used_bytes: Option<u64>,
    pub available_bytes: Option<u64>,
    pub capacity_percent: Option<u8>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticsResponse {
    pub app_name: String,
    pub version: String,
    pub environment: String,
    pub bundle_identifier: String,
    pub tauri_version: String,
    pub macos_version: String,
    pub cpu_architecture: String,
    pub disk_space: DiskSpaceInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExamplePingResponse {
    pub message: String,
    pub received_at_epoch_ms: u128,
}
