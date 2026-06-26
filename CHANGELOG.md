# Changelog

All notable changes to this project will be documented in this file.
## [0.2.0] - 2026-06-26

### Added

#### PTY Terminal Integration

* Added an integrated terminal panel powered by xterm.js and Rust portable-pty.
* Added terminal toggle support through Ctrl+` shortcut and status bar controls.
* Terminal sessions automatically open inside the currently active workspace directory.
* Added lazy terminal initialization to prevent unnecessary resource usage when unused.
* Added real-time terminal output streaming through Tauri events.
* Added cross-platform PTY support:
  * ConPTY support for Windows.
  * POSIX PTY support for Linux.

### Improved

* Improved developer workflow by combining workspace management, notes, and terminal functionality.
* Improved backend architecture with dedicated terminal services and models.
* Added centralized terminal state management through Tauri application state.
* Added frontend terminal lifecycle management through a dedicated React hook.

### Fixed

* Fixed workspace explorer issues.
* Fixed note creation, deletion, and renaming edge cases.
* Improved overall stability after React migration.

### Technical

* Added terminal module separation:
  * `commands/` handles Tauri command interfaces.
  * `services/` handles terminal business logic.
  * `models/` handles terminal data structures.
* Continued Rust backend modularization for future developer tooling.

### Known Limitations

* Markdown export is still in development.
* PDF export is still in development.
* Advanced terminal features such as multiple sessions are planned for future releases.


## [0.1.2] - 2026-06-13

### Added
* Integrated Tiptap rich markdown editor into the application.
* Introduced formatting toolbar for easier text editing (bold, italic, headings, lists, code blocks).

  
### Fixed
* Fixed file creation, deletion, and folder handling in the file explorer.
* Improved stability of workspace file tree operations.
* Resolved issues caused during Git rebase conflicts.
### Changed
* Cleaned commit history after resolving rebase conflicts.
* Improved overall editor workflow and usability after Tiptap integration.
### Notes
* This release includes a force-pushed history reset to maintain a clean and consistent commit structure after resolving merge/rebase conflicts.
* Core functionality remains unchanged, but editor and explorer reliability has been improved significantly.

## [0.1.1] - 2026-06-10

### Added

* Automatically reopens the last active workspace on startup.

### Changed

* Migrated frontend architecture to React.
* Refactored and modularized Rust backend code.
* Improved application state management.
* Improved UI responsiveness and rendering performance.
* Reworked internal project structure for future scalability.

### Fixed

* Resolved multiple layout inconsistencies.
* Fixed React migration-related issues.
* Fixed Rust configuration and integration issues.
* Various stability and performance improvements.
* Solved merge conflicts on Rust backend code and React migration

## [0.1.0] - 2026-06-07

### Added

* Initial public release of Bismouth.
* Cross-platform support for Windows and Linux.
* Project and workspace management.
* Note Taking
* Basic note organization and navigation.
* Modern desktop interface built with Tauri.
* Local-first workflow with filesystem-based storage.
---
### Planned

The following features are planned for future releases:


* PDF export with formatting preservation
* Mermaid diagram integration

* Git integration

* Graph view
* Code block support
* Jupyter Notebook (.ipynb) support
* Integrated PTY terminal

