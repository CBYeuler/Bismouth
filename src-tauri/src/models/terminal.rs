use std::sync::{Arc, Mutex};

pub struct TerminalSession {
    pub id: String,
    pub workspace_path: String,
    pub writer: Arc<Mutex<Box<dyn std::io::Write + Send>>>,
    pub _child: Box<dyn portable_pty::Child + Send>,
    pub _master: Box<dyn portable_pty::MasterPTY + Send>,
}


unsafe impl Send for TerminalSession {}


