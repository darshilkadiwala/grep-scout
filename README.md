# FileScout: Advanced File Search

<p align="center">
  <img src="https://raw.githubusercontent.com/darshilkadiwala/filescout/main/media/logo.png" alt="FileScout Logo" width="128" />
</p>

<p align="center">
  <strong>Lightning-fast file name search with granular directory filtering.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=darshil-dev.filescout"><img src="https://img.shields.io/visual-studio-marketplace/v/darshil-dev.filescout?style=flat-square&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=darshil-dev.filescout"><img src="https://img.shields.io/visual-studio-marketplace/i/darshil-dev.filescout?style=flat-square" alt="Installs" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=darshil-dev.filescout"><img src="https://img.shields.io/visual-studio-marketplace/r/darshil-dev.filescout?style=flat-square" alt="Rating" /></a>
  <a href="LICENSE.txt"><img src="https://img.shields.io/github/license/darshilkadiwala/filescout?style=flat-square" alt="License" /></a>
</p>

---

## 🚀 Why FileScout?

Ever felt **Quick Open** (`Ctrl+P`) is too fuzzy and gives you too many irrelevant results? Or that **Full-Text Search** (`Ctrl+Shift+F`) is too heavy when you just want to find a file by its name?

**FileScout** is designed to bridge this gap. It provides a dedicated, highly granular file-name search tool built directly into your Activity Bar. It's for power users who need exact control over where they are looking without the overhead of content searching.

## ✨ Key Features

- 🔍 **Targeted File Name Search:** Search exclusively by file name (e.g., `package.json`, `*.config.js`, `User*`) without querying file contents.
- 📁 **Granular Filtering:** Use dedicated "Files to Include" and "Files to Exclude" inputs with full glob pattern support (e.g., `src/components/**`).
- 💨 **Lightning Fast:** Uses an in-memory file cache for sub-second filtering, even in massive monorepos.
- 🧠 **Search History:** Quickly cycle through your recent queries using the **Up** and **Down** arrow keys in the search box.
- 🧩 **Native UI integration:** A seamless sidebar experience built with React that adopts your editor's theme colors and styling precisely.
- ⚡ **One-Click Open:** Results are displayed in a clean, hierarchical tree view. Single-click to open, keeping your focus where it belongs.

## 🛠️ How to Use

1. **Activate:** Open the FileScout view from the Activity Bar (look for the search icon) or use the shortcut `Ctrl + Alt + F` (Mac: `Cmd + Alt + F`).
2. **Search:** Enter your file name or pattern in the top search box.
3. **Refine:** Toggle the `...` menu to specify directories to include or exclude.
4. **Browse:** Explore the result tree and click any file to open it in the editor.

## ⚙️ Extension Settings

This extension currently uses default search exclusion rules. Additional configurable settings are planned for future releases.

## 📌 Keyboard Shortcuts

| Shortcut     | Action                     |
| ------------ | -------------------------- |
| `Ctrl+Alt+F` | Open the FileScout Sidebar |
| `Up Arrow`   | Previous search query      |
| `Down Arrow` | Next search query          |

## ⌨️ Available Commands

This extension provides the following commands via the Command Palette (`Ctrl+Shift+P`):

- `FileScout: Open FileScout` – Shows the search sidebar.
- `FileScout: Refresh Cache` – Manually triggers a re-index of the workspace.
- `FileScout: Collapse All` – Collapses all folders in the search results tree.

## 📋 Requirements

- **VS Code version 1.85.0 or higher.**

## 🐛 Known Issues

- Large monorepos may take a moment for the initial indexing on first activation.

---

**[GitHub Repository](https://github.com/darshilkadiwala/filescout) | [Report a Bug](https://github.com/darshilkadiwala/filescout/issues)**
