use crate::models::response::FileNode;
use crate::services::filesystem_service;
use crate::utils::error::AppError;
use crate::utils::path::assert_is_dir;
use std::path::Path;

#[tauri::command]
pub fn read_dir_tree(path: String) -> Result<Vec<FileNode>, AppError> {
    let p = Path::new(&path);
    assert_is_dir(p)?;
    Ok(filesystem_service::build_tree(p))
}

#[tauri::command]
pub fn create_folder(path: String) -> Result<(), AppError> {
    Ok(std::fs::create_dir_all(&path)?)
}


