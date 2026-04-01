/**
 * VS Code Extension View IDs
 */
export const VIEWS = {
  SIDEBAR: {
    ID: 'filescout.sidebar',
    TITLE: 'Search Files',
  },
  CONTAINER: {
    ID: 'filescout-container',
    TITLE: 'FileScout',
  },
} as const;

/**
 * Command IDs
 */
export const COMMANDS = {
  // Extension commands
  OPEN: 'filescout.open',
  REFRESH_CACHE: 'filescout.refreshCache',
  REFRESH_CACHE_INTERNAL: 'filescout.refreshCacheInternal',
  SCM_COLLAPSE_ALL: 'filescout.scmCollapseAll',
  SIDEBAR_FOCUS: `${VIEWS.SIDEBAR.ID}.focus`,

  // Built-in VS Code commands
  VSCODE_OPEN_ROOT_FOLDER: 'vscode.openFolder',
  VSCODE_VIEW_EXTENSION_CONTAINER: `workbench.view.extension.${VIEWS.CONTAINER.ID}`,
  VSCODE_LIST_COLLAPSE_ALL: 'list.collapseAll',
  VSCODE_SET_CONTEXT: 'setContext',
} as const;

/**
 * Message types sent from the Webview TO the Extension
 */
export const WEBVIEW_MESSAGES = {
  SEARCH: 'filescout:webview:search',
  OPEN_FILE: 'filescout:webview:openFile',
  GET_HISTORY: 'filescout:webview:getHistory',
  OPEN_FOLDER: 'filescout:webview:openFolder',
  REFRESH_CACHE: 'filescout:webview:refreshCache',
  SAVE_HISTORY: 'filescout:webview:saveHistory',
} as const;

/**
 * Message types sent from the Extension TO the Webview
 */
export const EXTENSION_MESSAGES = {
  RESULTS: 'filescout:extension:results',
  ICON_MAP: 'filescout:extension:iconMap',
  HISTORY: 'filescout:extension:history',
  ERROR: 'filescout:extension:error',
  HAS_WORKSPACE: 'filescout:extension:hasWorkspace',
  TOGGLE_DIR_MODE: 'filescout:extension:toggleDirMode',
  CACHE_REFRESHED: 'filescout:extension:cacheRefreshed',
  REFRESHING_START: 'filescout:extension:refreshingStart',
  REFRESHING_END: 'filescout:extension:refreshingEnd',
  SETTINGS: 'filescout:extension:settings',
} as const;

/**
 * Storage / Memento Keys
 */
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'filescout.searchHistory',
} as const;

/**
 * Glob Patterns
 */
export const GLOB_PATTERNS = {
  ALL_FILES: '**/*',
  NODE_MODULES_EXCLUDE: '**/node_modules/**',
} as const;

/**
 * Asset Paths (relative to extension root)
 */
const WEBVIEW_DIST = 'dist/webview' as const;

export const WEBVIEW_PATHS = {
  DIST_FOLDER: WEBVIEW_DIST,
  INDEX_JS: `${WEBVIEW_DIST}/index.js`,
  INDEX_CSS: `${WEBVIEW_DIST}/index.css`,
} as const;

/**
 * VS Code Configuration
 */
export const VSCODE_CONFIG = {
  SECTION: 'filescout',
  WORKBENCH: 'workbench',
  ICON_THEME: 'iconTheme',
  KEYS: {
    MAX_RESULTS: 'maxResults',
    HISTORY_LIMIT: 'historyLimit',
    DEBOUNCE_DELAY: 'debounceDelay',
  },
} as const;

/**
 * VS Code Context Keys
 */
export const CONTEXT_KEYS = {
  READY: 'filescout:isReady',
} as const;

/**
 * Package.json fields and other well-known names
 */
export const PACKAGE_JSON = {
  CONTRIBUTES: 'contributes',
  ICON_THEMES: 'iconThemes',
} as const;

/**
 * Search Configuration Defaults
 */
export const SEARCH_CONFIG = {
  MAX_RESULTS: 500,
  HISTORY_LIMIT: 50,
  DEBOUNCE_DELAY: 150,
} as const;

/**
 * Log Messages
 */
export const LOG_MESSAGES = {
  CACHE_INIT_FAILED: `[${VIEWS.CONTAINER.TITLE}] Cache init failed:`,
  CACHE_REFRESHING: `[${VIEWS.CONTAINER.TITLE}] Refreshing cache...`,
  CACHE_COMPLETED: (count: number) => `[${VIEWS.CONTAINER.TITLE}] Cached ${count} files.`,
} as const;
