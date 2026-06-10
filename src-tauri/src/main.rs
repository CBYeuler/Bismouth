// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::{self, File};
use std::path::{self, Path};
use serde::Serialize;
use std::env;
//use tauri::ipc::InvokeResponse::Ok;

#[derive(Serialize)]
struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    children: Vec<FileNode>,
}


fn build_tree(path:&Path) ->Vec<FileNode> {
    let mut nodes = vec![];

    let entries = match fs::read_dir(path) {
        Ok(e) => e,
        Err(_) => return nodes,
    };

    let mut collected: Vec<_> = entries.filter_map(|e| e.ok()).collect();

    collected.sort_by(|a,b|{
        let a_is_dir = a.path().is_dir();
        let b_is_dir = b.path().is_dir();
        b_is_dir.cmp(&a_is_dir).then(a.file_name().cmp(&b.file_name()))

    });

    for entry in collected {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.') { continue; }

        if entry_path.is_dir() {
            nodes.push(FileNode {
                name,
                path: entry_path.to_string_lossy().to_string(),
                is_dir: true,
                children: build_tree(&entry_path),  // also missing recursive call
            });
        } else {
            nodes.push(FileNode {
                name,
                path: entry_path.to_string_lossy().to_string(),
                is_dir: false,
                children: vec![],
            });
        }
    }

    nodes
}

#[tauri::command]

fn read_dir_tree(path: String) -> Result<Vec<FileNode>, String> {
    let p = Path::new(&path);
    if !p.is_dir() {
        return Err(format!("{} is not a directory",  path));
    }
    Ok(build_tree(p))
}

#[tauri::command]
fn read_note(path: String) -> Result<String, String>{
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_note(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent(){
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn rename_note(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_note(path: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, "").map_err(|e| e.to_string())
}

#[tauri::command]
fn create_folder(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_app_dir() -> Result<String, String> {
    let home = env::var("HOME").map_err(|e| e.to_string())?;
    let app_dir = format!("{}/Documents/Bismuth", home);
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    Ok(app_dir)
}

#[tauri::command]
fn create_workspace(name: String) -> Result<String, String> {
    let home = env::var("HOME").map_err(|e| e.to_string())?;
    let workspace_path = format!("{}/Documents/Bismuth/{}", home, name);
    fs::create_dir_all(&workspace_path).map_err(|e| e.to_string())?;
    Ok(workspace_path)
}

#[tauri::command]
fn list_workspaces() -> Result<Vec<serde_json::Value>, String> {
    let home = env::var("HOME").map_err(|e| e.to_string())?;
    let app_dir = format!("{}/Documents/Bismuth", home);
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

    let entries = fs::read_dir(&app_dir).map_err(|e| e.to_string())?;
    let mut workspaces = vec![];

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_dir() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with('.') { continue; }

            let modified = entry.metadata()
                .and_then(|m| m.modified())
                .map(|t| {
                    t.duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs()
                })
                .unwrap_or(0);

            workspaces.push(serde_json::json!({
                "name": name,
                "path": path.to_string_lossy(),
                "modified": modified
            }));
        }
    }

    workspaces.sort_by(|a, b| {
        b["modified"].as_u64().unwrap_or(0)
            .cmp(&a["modified"].as_u64().unwrap_or(0))
    });

    Ok(workspaces)
}

#[tauri::command]
fn delete_workspace(path: String) -> Result<(), String> {
    fs::remove_dir_all(&path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_dir_tree,
            read_note,
            write_note,
            delete_note,
            rename_note,
            create_note,
            create_folder,
            get_app_dir, 
            create_workspace, 
            list_workspaces, 
            delete_workspace,
        ])
        .run(tauri::generate_context!())
        .expect("error running Tauri app");
}