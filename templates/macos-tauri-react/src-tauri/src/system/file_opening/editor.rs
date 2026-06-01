pub const DEFAULT_EDITOR_APP_NAME: &str = "Visual Studio Code";
pub const ALLOWED_EDITOR_APP_NAMES: &[&str] = &[
    DEFAULT_EDITOR_APP_NAME,
    "Cursor",
    "Zed",
    "Sublime Text",
    "Nova",
    "BBEdit",
    "Xcode",
    "TextEdit",
];

pub fn normalize_editor_app_name(value: &str) -> Result<String, String> {
    let trimmed = value.trim();
    let editor_app_name = if trimmed.is_empty() {
        DEFAULT_EDITOR_APP_NAME
    } else {
        trimmed
    };

    if editor_app_name.contains('/') || editor_app_name.contains('\\') {
        return Err("Editor app name must not include path separators".to_string());
    }

    if !ALLOWED_EDITOR_APP_NAMES.contains(&editor_app_name) {
        return Err("Choose a supported editor from Settings > Application".to_string());
    }

    Ok(editor_app_name.to_string())
}

#[cfg(test)]
mod tests {
    use super::{normalize_editor_app_name, DEFAULT_EDITOR_APP_NAME};

    #[test]
    fn normalizes_editor_app_name() {
        assert_eq!(
            normalize_editor_app_name("  Nova  ").expect("app name should normalize"),
            "Nova",
        );
        assert_eq!(
            normalize_editor_app_name("").expect("blank app name should use default"),
            DEFAULT_EDITOR_APP_NAME,
        );
    }

    #[test]
    fn rejects_editor_paths() {
        assert!(normalize_editor_app_name("/Applications/Nova.app").is_err());
        assert!(normalize_editor_app_name(r"Applications\Nova.app").is_err());
    }

    #[test]
    fn rejects_unsupported_editor_names() {
        assert!(normalize_editor_app_name("Made Up Editor").is_err());
    }
}
