use tauri::{Manager, PhysicalSize, Size};

const STARTUP_SCREEN_RATIO: f64 = 0.8;
const MIN_WINDOW_WIDTH: u32 = 960;
const MIN_WINDOW_HEIGHT: u32 = 680;

#[derive(Debug, PartialEq, Eq)]
pub struct StartupWindowSize {
    pub width: u32,
    pub height: u32,
}

pub fn calculate_startup_window_size(screen_width: u32, screen_height: u32) -> StartupWindowSize {
    let width = ((screen_width as f64) * STARTUP_SCREEN_RATIO).round() as u32;
    let height = ((screen_height as f64) * STARTUP_SCREEN_RATIO).round() as u32;

    StartupWindowSize {
        width: width.max(MIN_WINDOW_WIDTH),
        height: height.max(MIN_WINDOW_HEIGHT),
    }
}

pub fn size_main_window(app: &tauri::App) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };
    let Some(monitor) = window.primary_monitor()? else {
        return Ok(());
    };

    let monitor_size = monitor.size();
    let next_size = calculate_startup_window_size(monitor_size.width, monitor_size.height);

    window.set_size(Size::Physical(PhysicalSize {
        width: next_size.width,
        height: next_size.height,
    }))?;
    window.center()?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::calculate_startup_window_size;

    #[test]
    fn sizes_window_to_eighty_percent_of_screen() {
        let size = calculate_startup_window_size(1920, 1200);

        assert_eq!(size.width, 1536);
        assert_eq!(size.height, 960);
    }

    #[test]
    fn clamps_window_to_minimum_size() {
        let size = calculate_startup_window_size(1000, 700);

        assert_eq!(size.width, 960);
        assert_eq!(size.height, 680);
    }
}
