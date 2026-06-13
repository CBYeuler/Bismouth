use std::io;
use std::env::VarError;

#[derive(Debug)]
pub enum AppError {
    Io(io::Error),
    Env(VarError),
    Path(String),
    NotADirectory(String),
    Other(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Io(e)             => write!(f, "IO error: {}", e),
            AppError::Env(e)            => write!(f, "Environment variable error: {}", e),
            AppError::Path(s)           => write!(f, "Path error: {}", s),
            AppError::NotADirectory(s)  => write!(f, "Not a directory: {}", s),
            AppError::Other(s)          => write!(f, "{}", s),
        }
    }
}

impl std::error::Error for AppError {}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

impl From<io::Error> for AppError {
    fn from(e: io::Error) -> Self { AppError::Io(e) }
}

impl From<VarError> for AppError {
    fn from(e: VarError) -> Self { AppError::Env(e) }
}

impl From<String> for AppError {
    fn from(s: String) -> Self { AppError::Other(s) }
}

impl From<&str> for AppError {
    fn from(s: &str) -> Self { AppError::Other(s.to_string()) }
}

pub type AppResult<T> = Result<T, AppError>;