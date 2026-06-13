use std::fs;
use std::path::Path;
use crate::models::response::FileNode;
use crate::utils::path::is_hidden;

/// Recursively builds a sorted file-system tree rooted at `path`.
/// Directories come before files; both groups are sorted alphabetically.
/// Hidden entries (names starting with '.') are skipped.
pub fn build_tree(path: &Path) -> Vec<FileNode> {
    let mut nodes = vec![];

    let entries = match fs::read_dir(path) {
        Ok(e) => e,
        Err(_) => return nodes,
    };

    let mut collected: Vec<_> = entries.filter_map(|e| e.ok()).collect();

    collected.sort_by(|a, b| {
        let a_is_dir = a.path().is_dir();
        let b_is_dir = b.path().is_dir();
        b_is_dir
            .cmp(&a_is_dir)
            .then(a.file_name().cmp(&b.file_name()))
    });

    for entry in collected {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if is_hidden(&name) {
            continue;
        }

        let path_str = entry_path.to_string_lossy().to_string();

        if entry_path.is_dir() {
            nodes.push(FileNode {
                name,
                path: path_str,
                is_dir: true,
                children: build_tree(&entry_path),
            });
        } else {
            nodes.push(FileNode {
                name,
                path: path_str,
                is_dir: false,
                children: vec![],
            });
        }
    }

    nodes
}