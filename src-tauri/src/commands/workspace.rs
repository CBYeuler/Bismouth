use crate::models::workspace::Workspace;
use crate::services::workspace_service;
use crate::utils::error::AppError;

#[tauri::command]
pub fn get_app_dir() -> Result<String, AppError>{
    workspace_service::get_app_dir()
}

#[tauri::command]
pub fn create_workspace(name:String) -> Result<String,AppError>{
    workspace_service::create(&name)
}

#[tauri::command]
pub fn list_workspaces() -> Result<Vec<Workspace>, AppError> {
    workspace_service::list()
}

#[tauri::command]
pub fn delete_workspace(path: String) -> Result<(), AppError>{
    workspace_service::delete(&path)
}

