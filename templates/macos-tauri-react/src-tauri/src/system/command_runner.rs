use std::{
    path::Path,
    process::{Command, Stdio},
    thread,
    time::{Duration, Instant},
};

use crate::models::CommandResult;

pub async fn run_blocking<T, F>(task_label: String, task: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    match tauri::async_runtime::spawn_blocking(task).await {
        Ok(result) => result,
        Err(error) => Err(format!("{task_label} task failed: {error}")),
    }
}

pub async fn run_command(
    command_label: &str,
    executable: &Path,
    args: &[&str],
    timeout: Duration,
) -> CommandResult {
    let command_label = command_label.to_string();
    let error_label = command_label.clone();
    let executable = executable.to_path_buf();
    let args = args
        .iter()
        .map(|argument| argument.to_string())
        .collect::<Vec<String>>();

    match run_blocking(command_label.clone(), move || {
        Ok(run_command_blocking(
            &command_label,
            &executable,
            &args,
            timeout,
        ))
    })
    .await
    {
        Ok(result) => result,
        Err(error) => CommandResult {
            command_label: error_label,
            stdout: String::new(),
            stderr: String::new(),
            exit_code: None,
            success: false,
            error_message: Some(error),
            duration_ms: 0,
        },
    }
}

fn run_command_blocking(
    command_label: &str,
    executable: &Path,
    args: &[String],
    timeout: Duration,
) -> CommandResult {
    let started_at = Instant::now();
    let mut child = match Command::new(executable)
        .args(args.iter().map(String::as_str))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(child) => child,
        Err(error) => {
            return CommandResult {
                command_label: command_label.to_string(),
                stdout: String::new(),
                stderr: String::new(),
                exit_code: None,
                success: false,
                error_message: Some(format!("Failed to start command: {error}")),
                duration_ms: started_at.elapsed().as_millis() as u64,
            };
        }
    };

    loop {
        match child.try_wait() {
            Ok(Some(_status)) => {
                return match child.wait_with_output() {
                    Ok(output) => build_result(command_label, output, started_at, None),
                    Err(error) => CommandResult {
                        command_label: command_label.to_string(),
                        stdout: String::new(),
                        stderr: String::new(),
                        exit_code: None,
                        success: false,
                        error_message: Some(format!("Failed to collect command output: {error}")),
                        duration_ms: started_at.elapsed().as_millis() as u64,
                    },
                };
            }
            Ok(None) if started_at.elapsed() >= timeout => {
                let _ = child.kill();
                return match child.wait_with_output() {
                    Ok(output) => build_result(
                        command_label,
                        output,
                        started_at,
                        Some(format!(
                            "Command timed out after {} ms",
                            timeout.as_millis()
                        )),
                    ),
                    Err(error) => CommandResult {
                        command_label: command_label.to_string(),
                        stdout: String::new(),
                        stderr: String::new(),
                        exit_code: None,
                        success: false,
                        error_message: Some(format!(
                            "Command timed out and output was unavailable: {error}"
                        )),
                        duration_ms: started_at.elapsed().as_millis() as u64,
                    },
                };
            }
            Ok(None) => thread::sleep(Duration::from_millis(25)),
            Err(error) => {
                return CommandResult {
                    command_label: command_label.to_string(),
                    stdout: String::new(),
                    stderr: String::new(),
                    exit_code: None,
                    success: false,
                    error_message: Some(format!("Failed while waiting for command: {error}")),
                    duration_ms: started_at.elapsed().as_millis() as u64,
                };
            }
        }
    }
}

fn build_result(
    command_label: &str,
    output: std::process::Output,
    started_at: Instant,
    forced_error: Option<String>,
) -> CommandResult {
    let exit_code = output.status.code();
    let success = output.status.success() && forced_error.is_none();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let error_message = forced_error.or_else(|| {
        if success {
            None
        } else if stderr.is_empty() {
            Some("Command exited unsuccessfully".to_string())
        } else {
            Some(stderr.clone())
        }
    });

    CommandResult {
        command_label: command_label.to_string(),
        stdout,
        stderr,
        exit_code,
        success,
        error_message,
        duration_ms: started_at.elapsed().as_millis() as u64,
    }
}
