mod commands;
mod models;
mod system;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::diagnostics::get_diagnostics,
            commands::example::example_ping,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run __APP_NAME__");
}
