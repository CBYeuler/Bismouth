use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Note {
    pub path: String,
    pub content: String,
}

///Lightweight metadata returned when listing notes (no content)
#[derive(Debug, Serialize, Deserialize)]
pub struct NoteMeta {
    pub name: String,
    pub path: String,
}


