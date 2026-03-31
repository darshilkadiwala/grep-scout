# Advanced File Name Search (VS Code Extension)

## PRD

### 1. Overview and Objective

**Product Name:** Advanced File Name Search
**Objective:** To provide VS Code users with a dedicated, highly granular file-name search tool within the Activity Bar. It bridges the gap between the speed of VS Code’s Quick Open (`Ctrl+P`) and the precise directory filtering of the full-text Search Sidebar (`Ctrl+Shift+F`), specifically targeting file names rather than file contents.

### 2. Problem Statement

Developers working in large codebases or monorepos face two distinct frustrations when searching for files:

1. **Quick Open (`Ctrl+P`) is too broad:** It relies on fuzzy matching across the entire workspace and lacks the ability to strictly say, "Only show me files named `index.ts` inside the `packages/ui` folder."
2. **Full-Text Search (`Ctrl+Shift+F`) is too heavy:** It has excellent "files to include/exclude" inputs, but it searches the _contents_ of every file. If a developer only wants to find a file by its name, searching contents is unnecessarily slow and produces noisy results.

### 3. Target Audience

- Software Engineers working in large-scale repositories, monorepos, or deeply nested folder structures.
- Power users who rely on keyboard shortcuts and muscle memory for navigation.
- Developers who prefer precise glob-pattern filtering over fuzzy-matching.

### 4. Core Features (MVP)

- **Targeted File Name Search:** Search exclusively by file name (e.g., `package.json`, `*.config.js`, `User*`) without querying file contents.
- **"Files to Include" Input:** A dedicated text field to restrict searches to specific directories or glob patterns (e.g., `src/components`).
- **"Files to Exclude" Input:** A dedicated text field to ignore specific directories.
- **Smart Default Exclusions:** The "Files to Exclude" field automatically defaults to heavy, non-source directories to optimize performance: `**/{node_modules,.git,dist,out,build}/**`.
- **Session History Navigation:**
  - The primary search input maintains a history of previous queries.
  - Pressing the **Up Arrow** cycles backward through previous searches.
  - Pressing the **Down Arrow** cycles forward.
  - The current unsubmitted draft text is preserved if the user navigates away and back to the present.
  - History persists across VS Code reloads.
- **Native-Looking Sidebar UI:** A dedicated view in the VS Code Activity Bar that visually clones the native search panel, featuring collapsible inputs for include/exclude rules.
- **One-Click Open:** A hierarchical or flat list display of matching files beneath the search inputs, allowing single-click opening of the files in the editor.

### 5. User Flow

1. **Launch:** The user clicks the custom "File Search" icon in the VS Code Activity Bar (or triggers it via a keyboard shortcut).
2. **Input / Recall:** The user types a file name into the primary search box. Alternatively, they press the `Up Arrow` to recall a previous search term.
3. **Refine (Optional):** The user toggles the `...` menu to reveal the "files to include" and "files to exclude" input boxes to narrow the scope.
4. **Execute:** The user presses `Enter`.
5. **Review:** The extension queries the workspace instantly and populates the results list, displaying file names and their relative paths.
6. **Action:** The user clicks a result. The file opens in the main editor area while preserving focus on the search sidebar, or shifts focus depending on native settings.

### 6. Technical Architecture & Requirements

**Tech Stack:**

- **Extension Engine:** Node.js, TypeScript, VS Code Extension API.
- **Frontend UI:** React 18 with Vite and Tailwind CSS, rendered via `WebviewViewProvider`.
- **Search Engine:** Hybrid system using `vscode.workspace.findFiles` for deep discovery and an in-memory **File Cache** for lightning-fast sub-second filtering.

**Key VS Code APIs:**

- `vscode.workspace.findFiles`: Used for initial indexing and cache refreshes.
- `vscode.window.registerWebviewViewProvider`: Bridge between VS Code and the React Search UI.
- `vscode.workspace.openTextDocument`: Rapidly opens files selected from the result tree.

### 7. Non-Functional Requirements

- **Performance & Safeties:** The search must cap at a reasonable maximum (e.g., 500 or 1000 results) to prevent UI freezing on overly broad searches (like searching `*` in the root directory).
- **Native Aesthetics:** The Webview UI must strictly use VS Code's native CSS variables (e.g., `var(--vscode-input-background)`, `var(--vscode-editor-foreground)`) to ensure it perfectly matches the user's active theme.
- **Responsiveness:** Arrow-key history navigation must feel instant and native, managed directly in the Webview's JavaScript to avoid latency.

### 8. Future Enhancements (Post-MVP)

- **Regex Support:** A toggle button to allow full Regular Expressions for file name matching.
- **Multi-Select Operations:** Checkboxes next to results allowing users to open, delete, or move multiple files at once.
- **Drag and Drop:** The ability to drag a search result directly from the sidebar into a specific editor group.

### 9. Folder Structure

```plaintext
filescout/
├── .agents/                 # AI coding assistant skills and workflows
├── .vscode/                 # Debug and workspace configurations
├── media/                   # Extension icons and static assets
├── src/                     # Core Extension Logic
│   ├── extension.ts         # Activation and command registration
│   ├── controllers/         # File Cache and Search logic
│   ├── providers/           # WebView View Providers
│   └── webview/             # React Search Application (Vite project)
│       ├── components/      # UI components (Search, Results, Tree)
│       ├── hooks/           # Business logic hooks (useSearch, useTreeState)
│       ├── utils/           # Tree and CSS utilities
│       └── App.tsx          # Main Webview entry point
├── esbuild.js               # Extension build configuration
├── package.json             # Manifest and VS Code contributions
├── tailwind.config.js       # Styling configuration
└── tsconfig.json            # TypeScript configuration
```

#### 1. The `src/webview` Directory (The Frontend)

The UI is a sophisticated React application that perfectly clones the VS Code native experience.

- **`hooks/useSearch.ts`**: Manages the query state, filters, and communication with the extension backend.
- **`components/results/tree-view`**: Implements a native-like tree with indentation guides and folder toggling.
- **Tailwind CSS**: Used with VS Code CSS variables (e.g., `bg-(--vscode-input-background)`) for theme-seamless styling.

#### 2. The `src/controllers` Directory (The Backend)

- **`FileCacheController.ts`**: Implements the "Cold Storage" search. It indexes the entire workspace once and then performs near-instant string filtering on subsequent searches.
- **`SearchSidebarProvider.ts`**: Acts as the communication bridge, passing messages between the React webview and the Node.js backend.

### 10. Key APIs to Use

- `vscode.window.registerWebviewViewProvider`: Bridge between VS Code and the React Search UI.
- `vscode.workspace.findFiles`: Used for initial indexing and cache refreshes.
- `vscode.workspace.openTextDocument`: Rapidly opens files selected from the result tree.
- `ExtensionContext.workspaceState`: Persists search history across sessions.
