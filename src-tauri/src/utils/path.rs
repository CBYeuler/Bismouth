use std::path::{Path, PathBuf};
use std::env;
use std::fs;
use crate::utils::error::{AppError, AppResult};

/// Returns the root app directory: ~/Documents/Bismuth
pub fn app_dir() -> AppResult<PathBuf> {
    let home = env::var("HOME")?;
    let dir = PathBuf::from(home).join("Documents").join("Bismuth");
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

/// Returns the path for a named workspace inside the app dir
pub fn workspace_dir(name: &str) -> AppResult<PathBuf> {
    let dir = app_dir()?.join(name);
    fs::create_dir_all(&dir)?;
    Ok(dir)
}

/// Ensures a path's parent directories exist
pub fn ensure_parent(path: &Path) -> AppResult<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

/// Asserts that a path is an existing directory
pub fn assert_is_dir(path: &Path) -> AppResult<()> {
    if !path.is_dir() {
        return Err(AppError::NotADirectory(
            path.to_string_lossy().to_string(),
        ));
    }
    Ok(())
}

/// Returns true if the file/folder name should be hidden (starts with '.')
pub fn is_hidden(name: &str) -> bool {
    name.starts_with('.')
}