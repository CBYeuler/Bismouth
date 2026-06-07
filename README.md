<img src="READMEIMGS/Bismouth.png" alt="BLogo" height="500" width="1300" align="center"> 
<h1 align="center">
   Bismouth
</h1>  

<p align="center">
  <b>A lightweight, local-first developer workspace for notes, terminal workflows, and structured thinking.</b>
</p>

<p align="center">
  <i>Notes. Files. Terminal. One workspace.</i>
</p>

<p align="center">

[![Build Status](https://img.shields.io/github/actions/workflow/status/CBYeuler/Bismouth/ci.yml?style=for-the-badge)](https://github.com/CBYeuler/Bismouth/actions)
[![Releases](https://img.shields.io/github/v/release/CBYeuler/Bismouth?style=for-the-badge)](https://github.com/CBYeuler/Bismouth/releases)
[![Downloads](https://img.shields.io/github/downloads/CBYeuler/Bismouth/total?style=for-the-badge)](https://github.com/CBYeuler/Bismouth/releases)
[![License](https://img.shields.io/github/license/CBYeuler/Bismouth?style=for-the-badge)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/CBYeuler/Bismouth?style=for-the-badge)](https://github.com/CBYeuler/Bismouth/commits/main)
[![Windows](https://img.shields.io/badge/Windows-Supported-0078D6?style=for-the-badge&logo=windows)](#)
[![Linux](https://img.shields.io/badge/Linux-Supported-FCC624?style=for-the-badge&logo=linux&logoColor=black)](#)
[![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black)](https://tauri.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org)


</p>


## Overview

**Bismouth** is a minimal but powerful desktop application designed for structured note-taking, workspace organization, and developer productivity.

It combines:

* Markdown-based notes
* Workspace-based file organization
* A terminal-ready environment (PTY support planned/partial)
* Fast, local filesystem-first architecture

The goal is to provide a clean, distraction-free environment for developers and technical users who want full control over their data.

---
<p align="center">A filesystem-native workspace for developers who prefer convenience and <em>control<em> </p>

---

<img src="READMEIMGS/Screenshot from 2026-06-07 05-16-41.png">
<img src="READMEIMGS/Screenshot from 2026-06-07 06-21-39.png">
## Features
###  Implemented (v1 Frontend)

* Markdown note editor (vanilla JS prototype)
* Collapsible sidebar navigation
* Dark / Light mode support
* Basic workspace UI structure
* Clean, minimal UI layout

### In Progress

* Tauri integration (completed shell migration)
* Workspace CRUD operations
* Note persistence (filesystem-based)
* PTY terminal integration

### Planned

* File tree explorer
* Graph view (note linking visualization)
* Export system (PDF / Markdown / HTML)
* Advanced workspace management
* Search indexing

---
<h1 align="center">Architecture</h1>

<p align="center">
  Bismouth follows a <em>local-first filesystem-based design</em>.
</p>

<p align="center">
<pre>
Workspace/
├── notes/
├── assets/
└── exports/
</pre>
</p>

<p align="center">
Each workspace is a self-contained directory on the user’s machine.
</p>

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript (transitioning to React)
* **Desktop Runtime:** Tauri
* **Backend (planned):** Rust (filesystem + process management)
* **Terminal:** PTY integration (xterm.js + backend bridge planned)

---

##  Design Philosophy

* Local-first (no cloud dependency)
* User owns all data
* Minimal overhead
* Fast startup & performance-focused
* Extensible architecture for developer workflows

---

## Motivation

Most note-taking apps are either:

* Too heavy and cloud-dependent
* Too simple and not developer-friendly
* Locked into proprietary ecosystems

Bismouth aims to sit in between:

> A developer workspace where notes, files, and terminal workflows coexist.

---

## Screenshots

<img src="READMEIMGS/Screenshot from 2026-06-06 10-47-48.png">
<img src ="READMEIMGS/Screenshot from 2026-06-06 06-19-27.png">

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri CLI](https://tauri.app/start/prerequisites/)

On Linux you'll also need:
```bash
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Installation

```bash
# Clone the repo
git clone https://github.com/CBYeuler/Bismouth.git
cd Bismouth/my-tauri-app

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

> **Note:** When prompted by the Tauri scaffold, select **Vanilla JS** — React migration is planned for v1.

### Build for production

```bash
npm run tauri build
```

---

## Project Structure

```
my-tauri-app/
├── src/                    # Frontend (Vanilla JS)
│   ├── index.html          # Editor view
│   ├── main.js             # Editor logic
│   ├── styles.css          # Editor styles
│   ├── home.html           # Welcome screen
│   ├── home.js             # Workspace management
│   └── home.css            # Welcome screen styles
│
└── src-tauri/              # Tauri / Rust backend
    ├── src/
    │   ├── main.rs         # Rust commands (filesystem CRUD)
    │   └── lib.rs          # Cargo lib entry point
    ├── Cargo.toml
    └── tauri.conf.json
```

---

##  Roadmap

* [x] Vanilla JS UI prototype
* [x] Tauri migration
* [x] Workspace CRUD
* [x] Note persistence
* [ ] PTY terminal
* [ ] File tree explorer
* [ ] Graph view
* [ ] Export system

---

##  Contributing

This project is currently in early development. Contributions, ideas, and feedback are welcome once the core architecture stabilizes.

---

##  License

This project is licensed under the MIT License.

See the full license text in the [LICENSE](LICENSE) file.

---

## Status

Early-stage active development — architecture evolving rapidly.
