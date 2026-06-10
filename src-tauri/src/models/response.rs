use serde::{Deserialize, Serialize};
///Node in the file-system tree returned by read_dir_tree
#[derive(Debug, Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<FileNode>,
}

