use crate::services::note_service;
use crate::utils::error::AppError;

#[tauri::command]
pub fn read_note(path: String) -> Result <String, AppError>{
    note_service::read(&path)
}

#[tauri::command]
pub fn write_note(path: String, content: String) -> Result<(), AppError>{
    note_service::write(&path, &content)
}

#[tauri::command]
pub fn create_note(path: String) -> Result<(), AppError>{
    note_service::create(&path)
}

#[tauri::command]
pub fn delete_note(path: String) -> Result<(), AppError> {
    note_service::delete(&path)
}

#[tauri::command]
pub fn rename_note(old_path: String, new_path: String) -> Result<(), AppError> {
    note_service::rename(&old_path, &new_path)
}

