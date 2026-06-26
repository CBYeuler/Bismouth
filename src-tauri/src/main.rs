// Prevents additional console window on Windows in release. DO NOT REMOVE.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;
mod utils;

use commands::filesystem::{create_folder, read_dir_tree};
use commands::notes::{create_note, delete_note, read_note, rename_note, write_note};
use commands::workspace::{create_workspace, delete_workspace, get_app_dir, list_workspaces};
use services::terminal_service::TerminalStore;

fn main() {
    tauri::Builder::default()
        .manage(TerminalStore::new())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // filesystem
            read_dir_tree,
            create_folder,
            // notes
            read_note,
            write_note,
            create_note,
            delete_note,
            rename_note,
            // workspaces
            get_app_dir,
            create_workspace,
            list_workspaces,
            delete_workspace,
            commands::terminal::create_terminal,
            commands::terminal::send_input,
            commands::terminal::resize_terminal,
            commands::terminal::close_terminal,
        ])
        .run(tauri::generate_context!())
        .expect("error running Tauri app");
}