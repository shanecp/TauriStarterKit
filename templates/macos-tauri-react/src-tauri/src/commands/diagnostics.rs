use std::time::Duration;

use crate::{
    models::{DiagnosticsResponse, DiskSpaceInfo},
    system::{command_runner::run_command, paths::find_executable},
};

#[tauri::command]
pub async fn get_diagnostics(app: tauri::AppHandle) -> DiagnosticsResponse {
    let config = app.config();
    let app_name = config
        .product_name
        .clone()
        .unwrap_or_else(|| "__APP_NAME__".to_string());

    DiagnosticsResponse {
        app_name,
        version: env!("CARGO_PKG_VERSION").to_string(),
        environment: if cfg!(debug_assertions) {
            "dev".to_string()
        } else {
            "production".to_string()
        },
        bundle_identifier: config.identifier.to_string(),
        tauri_version: "2".to_string(),
        macos_version: macos_version().await,
        cpu_architecture: std::env::consts::ARCH.to_string(),
        disk_space: disk_space().await,
    }
}

async fn macos_version() -> String {
    let Some(sw_vers) = find_executable("sw_vers") else {
        return "unknown".to_string();
    };

    let result = run_command(
        "sw_vers -productVersion",
        &sw_vers,
        &["-productVersion"],
        Duration::from_secs(3),
    )
    .await;

    if result.success && !result.stdout.trim().is_empty() {
        result.stdout.trim().to_string()
    } else {
        "unknown".to_string()
    }
}

async fn disk_space() -> DiskSpaceInfo {
    let Some(df) = find_executable("df") else {
        return unavailable_disk_space("df not found in common macOS executable paths");
    };

    let result = run_command("df -k /", &df, &["-k", "/"], Duration::from_secs(3)).await;

    if !result.success {
        return unavailable_disk_space(
            result
                .error_message
                .as_deref()
                .unwrap_or("Unable to query remaining disk space"),
        );
    }

    parse_df_disk_space(&result.stdout)
        .unwrap_or_else(|| unavailable_disk_space("Unable to parse df output"))
}

fn unavailable_disk_space(message: &str) -> DiskSpaceInfo {
    DiskSpaceInfo {
        available: false,
        filesystem: String::new(),
        mount_point: "/".to_string(),
        total_bytes: None,
        used_bytes: None,
        available_bytes: None,
        capacity_percent: None,
        error_message: Some(message.to_string()),
    }
}

fn parse_df_disk_space(stdout: &str) -> Option<DiskSpaceInfo> {
    let line = stdout
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .nth(1)?;
    let parts = line.split_whitespace().collect::<Vec<&str>>();

    if parts.len() < 6 {
        return None;
    }

    let total_bytes = kib_to_bytes(parts[1])?;
    let available_bytes = kib_to_bytes(parts[3])?;
    let used_bytes = total_bytes.checked_sub(available_bytes)?;

    Some(DiskSpaceInfo {
        available: true,
        filesystem: parts[0].to_string(),
        mount_point: parts.last()?.to_string(),
        total_bytes: Some(total_bytes),
        used_bytes: Some(used_bytes),
        available_bytes: Some(available_bytes),
        capacity_percent: used_percent(total_bytes, available_bytes),
        error_message: None,
    })
}

fn kib_to_bytes(value: &str) -> Option<u64> {
    value
        .parse::<u64>()
        .ok()
        .and_then(|blocks| blocks.checked_mul(1024))
}

fn used_percent(total_bytes: u64, available_bytes: u64) -> Option<u8> {
    if total_bytes == 0 || available_bytes > total_bytes {
        return None;
    }

    let used_bytes = total_bytes - available_bytes;
    Some(((used_bytes as f64 / total_bytes as f64) * 100.0).round() as u8)
}

#[cfg(test)]
mod tests {
    use super::parse_df_disk_space;

    #[test]
    fn parses_macos_df_output() {
        let output = "Filesystem     1024-blocks     Used Available Capacity iused      ifree %iused Mounted on\n/dev/disk3s1s1   489620264 9505200 203085416     5% 404272 2030854160    0% /";

        let disk = parse_df_disk_space(output).expect("disk space should parse");

        assert!(disk.available);
        assert_eq!(disk.filesystem, "/dev/disk3s1s1");
        assert_eq!(disk.mount_point, "/");
        assert_eq!(disk.total_bytes, Some(489620264 * 1024));
        assert_eq!(disk.used_bytes, Some((489620264 - 203085416) * 1024));
        assert_eq!(disk.available_bytes, Some(203085416 * 1024));
        assert_eq!(disk.capacity_percent, Some(59));
    }
}
