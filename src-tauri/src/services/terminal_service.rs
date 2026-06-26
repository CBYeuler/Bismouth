// Terminal service — extend this module as terminal features are added.
//
// Suggested additions:
//   - spawn_shell(cwd: &str) -> AppResult<u32>   (returns PID)
//   - send_input(pid: u32, input: &str) -> AppResult<()>
//   - kill_shell(pid: u32) -> AppResult<()>
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use portable_pty::{CommandBuilder, PtySize, native_pty_system};
use tauri::{AppHandle, Manager};
use uuid::Uuid;
use crate::commands::workspace;
use tauri::Emitter;
use tauri::State;
use crate::models::terminal::TerminalSession;


 pub struct TerminalStore(pub Mutex<HashMap<String, TerminalSession>>);

 impl TerminalStore {
    pub fn new() -> Self {
        TerminalStore(Mutex::new(HashMap::new()))
    }
 }

 pub fn create_terminal(
    app: AppHandle,
    workspace_path: String,
) -> Result<String, String> {
    let id = Uuid::new_v4().to_string();
    let pty_system = native_pty_system();

    let size = PtySize {
        rows: 24,
        cols: 80,
        pixel_width:0,
        pixel_height:0,
    };

    let pair = pty_system.openpty(size).map_err(|e| e.to_string())?;

    //Detect Shell
    #[cfg(target_os = "windows")]
    let shell = std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string());
    #[cfg(not(target_os = "windows"))]
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());

    let mut cmd = CommandBuilder::new(&shell);
    cmd.cwd(&workspace_path);

    let child  = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;
    let master = pair.master;
    let writer = master.take_writer().map_err(|e| e.to_string())?;
    let mut reader = master.try_clone_reader().map_err(|e| e.to_string())?;

    // Stream output in background thread
    let id_clone  = id.clone();
    let app_clone = app.clone();

    std::thread::spawn(move || {
        let mut buf = [0u8; 1024];
        loop {
            match reader.read(&mut buf) {
                Ok(0)   => break,
                Ok(n)   => {
                    let output = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit(
                        &format!("terminal-output-{}", id_clone),
                        output,
                    );
                }
                Err(_)  => break,
            }
        }
    });

    let session = TerminalSession {
        id:             id.clone(),
        workspace_path,
        writer:         Arc::new(Mutex::new(writer)),
        _child:         child,
        _master:        master,
    };

    let store = app.state::<TerminalStore>();
    store.0.lock().unwrap().insert(id.clone(), session);

    Ok(id)
}

pub fn write_input(
    app: AppHandle,
    id: String,
    input: String,
) -> Result<(), String> {
    let store = app.state::<TerminalStore>();
    let store = store.0.lock().unwrap();
    let session = store.get(&id).ok_or("Terminal session not found")?;

    {
        let mut writer = session.writer.lock().unwrap();
        writer
            .write_all(input.as_bytes())
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
pub fn resize_terminal(
    app: AppHandle,
    id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    let store = app.state::<TerminalStore>();
    let store = store.0.lock().unwrap();
    let session = store.get(&id).ok_or("Terminal session not found")?;
    session._master
        .resize(PtySize { rows, cols, pixel_width: 0, pixel_height: 0 })
        .map_err(|e| e.to_string())
}

pub fn close_terminal(
    app: AppHandle,
    id: String,
) -> Result<(), String> {
    let store = app.state::<TerminalStore>();
    let mut store = store.0.lock().unwrap();
    store.remove(&id).ok_or("Terminal session not found")?;
    Ok(())
}
