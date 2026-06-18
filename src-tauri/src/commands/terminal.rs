use tauri::AppHandle;
use crate::services::terminal_service;

#[tauri::command]
pub fn create_terminal(app: AppHandle, workspace_path: String) -> Result<String, String>{
    terminal_service::create_terminal(app, workspace_path)
}
#[tauri::command]
pub fn send_input(app: AppHandle, id: String, input: String) -> Result<(), String> {
    terminal_service::write_input(app, id, input)
}

#[tauri::command]
pub fn resize_terminal(app: AppHandle, id: String, rows: u16, cols:u16) -> Result<(), String> {
    terminal_service::resize_terminal(app, id, rows, cols)
}

#[tauri::command]
pub fn  close_terminal(app: AppHandle, id: String)  -> Result<(), String>{
    terminal_service::close_terminal(app, id)
}


