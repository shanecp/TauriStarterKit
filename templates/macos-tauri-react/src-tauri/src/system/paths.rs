use std::path::{Path, PathBuf};

pub const COMMON_MACOS_PATHS: &[&str] = &[
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
];

pub fn find_executable(name: &str) -> Option<PathBuf> {
    if name.contains('/') {
        let path = Path::new(name);
        if path.is_file() {
            return Some(path.to_path_buf());
        }

        return None;
    }

    COMMON_MACOS_PATHS
        .iter()
        .map(|base| Path::new(base).join(name))
        .find(|candidate| candidate.is_file())
}
