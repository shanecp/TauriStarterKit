#![allow(non_snake_case)] // Template crate-name placeholders are uppercase before generation.

mod commands;
mod models;
mod system;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            system::window_sizing::size_main_window(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::diagnostics::get_diagnostics,
            commands::example::example_ping,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run __APP_NAME__");
}
