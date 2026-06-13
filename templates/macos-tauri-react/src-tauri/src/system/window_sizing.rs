use tauri::{Manager, PhysicalPosition, PhysicalSize, Position, Size};

const STARTUP_SCREEN_RATIO: f64 = 0.8;
const MIN_WINDOW_WIDTH: u32 = 960;
const MIN_WINDOW_HEIGHT: u32 = 680;

#[derive(Debug, PartialEq, Eq)]
pub struct StartupWindowSize {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, PartialEq, Eq)]
struct StartupWindowPosition {
    x: i32,
    y: i32,
}

pub fn calculate_startup_window_size(screen_width: u32, screen_height: u32) -> StartupWindowSize {
    let width = ((screen_width as f64) * STARTUP_SCREEN_RATIO).round() as u32;
    let height = ((screen_height as f64) * STARTUP_SCREEN_RATIO).round() as u32;

    StartupWindowSize {
        width: width.max(MIN_WINDOW_WIDTH),
        height: height.max(MIN_WINDOW_HEIGHT),
    }
}

fn calculate_centered_window_position(
    monitor_x: i32,
    monitor_y: i32,
    monitor_width: u32,
    monitor_height: u32,
    window_size: &StartupWindowSize,
) -> StartupWindowPosition {
    let x = monitor_x as i64 + ((monitor_width as i64 - window_size.width as i64) / 2);
    let y = monitor_y as i64 + ((monitor_height as i64 - window_size.height as i64) / 2);

    StartupWindowPosition {
        x: x as i32,
        y: y as i32,
    }
}

pub fn size_main_window(app: &tauri::App) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };
    let monitor = match window.current_monitor()? {
        Some(monitor) => Some(monitor),
        None => window.primary_monitor()?,
    };
    let Some(monitor) = monitor else {
        return Ok(());
    };

    let monitor_size = monitor.size();
    let monitor_position = monitor.position();
    let next_size = calculate_startup_window_size(monitor_size.width, monitor_size.height);
    let next_position = calculate_centered_window_position(
        monitor_position.x,
        monitor_position.y,
        monitor_size.width,
        monitor_size.height,
        &next_size,
    );

    window.set_size(Size::Physical(PhysicalSize {
        width: next_size.width,
        height: next_size.height,
    }))?;
    window.set_position(Position::Physical(PhysicalPosition {
        x: next_position.x,
        y: next_position.y,
    }))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{calculate_centered_window_position, calculate_startup_window_size};

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

    #[test]
    fn centers_window_inside_the_selected_monitor() {
        let size = calculate_startup_window_size(1920, 1200);
        let position = calculate_centered_window_position(2560, 0, 1920, 1200, &size);

        assert_eq!(position.x, 2752);
        assert_eq!(position.y, 120);
    }

    #[test]
    fn centers_window_inside_monitor_with_negative_origin() {
        let size = calculate_startup_window_size(1920, 1080);
        let position = calculate_centered_window_position(-1920, 0, 1920, 1080, &size);

        assert_eq!(position.x, -1728);
        assert_eq!(position.y, 108);
    }
}
