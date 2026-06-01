use std::{
    path::{Path, PathBuf},
    time::Duration,
};

use crate::{models::CommandResult, system::command_runner::run_command};

use super::editor::normalize_editor_app_name;

const MACOS_OPEN_PATH: &str = "/usr/bin/open";
const OPEN_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(Debug, PartialEq, Eq)]
struct OpenPathCommand {
    command_label: String,
    executable: PathBuf,
    args: Vec<String>,
}

pub async fn open_path_in_preferred_editor(
    command_label: &str,
    path: &Path,
    editor_app_name: &str,
) -> Result<CommandResult, String> {
    let command =
        build_open_path_in_preferred_editor_command(command_label, path, editor_app_name)?;
    let args = command.args.iter().map(String::as_str).collect::<Vec<_>>();

    Ok(run_command(
        &command.command_label,
        &command.executable,
        &args,
        OPEN_TIMEOUT,
    )
    .await)
}

fn build_open_path_in_preferred_editor_command(
    command_label: &str,
    path: &Path,
    editor_app_name: &str,
) -> Result<OpenPathCommand, String> {
    let editor_app_name = normalize_editor_app_name(editor_app_name)?;
    let path = path
        .to_str()
        .ok_or_else(|| "Path contains invalid UTF-8".to_string())?;

    Ok(OpenPathCommand {
        command_label: format!("{command_label} with {editor_app_name}"),
        executable: PathBuf::from(MACOS_OPEN_PATH),
        args: vec!["-a".to_string(), editor_app_name, path.to_string()],
    })
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{build_open_path_in_preferred_editor_command, MACOS_OPEN_PATH};

    #[test]
    fn builds_open_command_with_preferred_editor_args() {
        let command = build_open_path_in_preferred_editor_command(
            "Open test file",
            Path::new("/tmp/app-file-opening-test.txt"),
            "TextEdit",
        )
        .expect("command should build");

        assert_eq!(command.command_label, "Open test file with TextEdit");
        assert_eq!(command.executable, Path::new(MACOS_OPEN_PATH));
        assert_eq!(
            command.args,
            ["-a", "TextEdit", "/tmp/app-file-opening-test.txt"],
        );
    }

    #[test]
    fn builds_open_command_with_default_editor_for_blank_input() {
        let command = build_open_path_in_preferred_editor_command(
            "Open test file",
            Path::new("/tmp/app-file-opening-test.txt"),
            "  ",
        )
        .expect("blank editor should use default");

        assert_eq!(
            command.args,
            ["-a", "Visual Studio Code", "/tmp/app-file-opening-test.txt",],
        );
    }

    #[test]
    fn rejects_unsupported_editor_names() {
        let result = build_open_path_in_preferred_editor_command(
            "Open test file",
            Path::new("/tmp/app-file-opening-test.txt"),
            "Made Up Editor",
        );

        assert!(result.is_err());
    }

    #[test]
    fn rejects_editor_names_with_path_separators() {
        let result = build_open_path_in_preferred_editor_command(
            "Open test file",
            Path::new("/tmp/app-file-opening-test.txt"),
            "/Applications/TextEdit.app",
        );

        assert!(result.is_err());
    }
}
