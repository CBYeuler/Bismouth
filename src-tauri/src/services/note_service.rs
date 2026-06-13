use std::fs;
use std::path::Path;
use crate::utils::error::AppResult;
use crate::utils::path::ensure_parent;
use crate::utils::config::DEFAULT_NOTE_CONTENT;

pub fn read(path: &str) -> AppResult<String> {
    Ok(fs::read_to_string(path)?)
}

pub fn write(path: &str, content: &str) -> AppResult<()> {
    ensure_parent(Path::new(path))?;
    Ok(fs::write(path, content)?)
}

pub fn create(path: &str) -> AppResult<()> {
    ensure_parent(Path::new(path))?;
    Ok(fs::write(path, DEFAULT_NOTE_CONTENT)?)
}

pub fn delete(path: &str) -> AppResult<()> {
    let p = Path::new(path);
    if p.is_dir() {
        fs::remove_dir_all(p)?;
    } else {
        fs::remove_file(p)?;
    }
    Ok(())
}

pub fn rename(old_path: &str, new_path: &str) -> AppResult<()> {
    Ok(fs::rename(old_path, new_path)?)
}