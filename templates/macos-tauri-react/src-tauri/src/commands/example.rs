use crate::models::ExamplePingResponse;

#[tauri::command]
pub async fn example_ping() -> ExamplePingResponse {
    ExamplePingResponse {
        message: "Backend command is available.".to_string(),
        received_at_epoch_ms: current_epoch_ms(),
    }
}

fn current_epoch_ms() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}
