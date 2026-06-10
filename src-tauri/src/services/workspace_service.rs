use std::fs;
use std::time::UNIX_EPOCH;
use crate::models::workspace::Workspace;
use crate::utils::error::AppResult;
use crate::utils::path::{app_dir, workspace_dir, is_hidden};

pub fn get_app_dir() -> AppResult<String> {
    Ok(app_dir()?.to_string_lossy().to_string())
}

pub fn create(name: &str) -> AppResult<String> {
    let path = workspace_dir(name)?;
    Ok(path.to_string_lossy().to_string())
}

pub fn list() -> AppResult<Vec<Workspace>> {
    let dir = app_dir()?;
    let mut workspaces: Vec<Workspace> = fs::read_dir(&dir)?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            if is_hidden(&name) {
                return None;
            }
            let modified = e
                .metadata()
                .and_then(|m| m.modified())
                .map(|t| t.duration_since(UNIX_EPOCH).unwrap_or_default().as_secs())
                .unwrap_or(0);

            Some(Workspace {
                name,
                path: e.path().to_string_lossy().to_string(),
                modified,
            })
        })
        .collect();

    workspaces.sort_by(|a, b| b.modified.cmp(&a.modified));
    Ok(workspaces)
}

pub fn delete(path: &str) -> AppResult<()> {
    Ok(fs::remove_dir_all(path)?)
}