use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Workspace {
    pub name: String,
    pub path: String,
    ///unix timestamp of last modification
    pub modified: u64,
}
