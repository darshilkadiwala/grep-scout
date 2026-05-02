/**
 * VS Code Extension View IDs
 */
export const VIEWS = {
  SIDEBAR: {
    ID: 'grepscout.sidebar',
    TITLE: 'Search Files',
  },
  CONTAINER: {
    ID: 'grepscout-container',
    TITLE: 'GrepScout',
  },
} as const;

/**
 * Command IDs
 */
export const COMMANDS = {
  // Extension commands
  OPEN: 'grepscout.open',
  REFRESH_CACHE: 'grepscout.refreshCache',
  REFRESH_CACHE_INTERNAL: 'grepscout.refreshCacheInternal',
  SCM_COLLAPSE_ALL: 'grepscout.scmCollapseAll',
  SIDEBAR_FOCUS: `${VIEWS.SIDEBAR.ID}.focus`,

  // Built-in VS Code commands
  VSCODE_OPEN: 'vscode.open',
  VSCODE_OPEN_ROOT_FOLDER: 'vscode.openFolder',
  VSCODE_VIEW_EXTENSION_CONTAINER: `workbench.view.extension.${VIEWS.CONTAINER.ID}`,
  VSCODE_LIST_COLLAPSE_ALL: 'list.collapseAll',
  VSCODE_SET_CONTEXT: 'setContext',
} as const;

/**
 * Message types sent from the Webview TO the Extension
 */
export const WEBVIEW_MESSAGES = {
  SEARCH: 'grepscout:webview:search',
  OPEN_FILE: 'grepscout:webview:openFile',
  GET_HISTORY: 'grepscout:webview:getHistory',
  OPEN_FOLDER: 'grepscout:webview:openFolder',
  REFRESH_CACHE: 'grepscout:webview:refreshCache',
  SAVE_HISTORY: 'grepscout:webview:saveHistory',
} as const;

/**
 * Message types sent from the Extension TO the Webview
 */
export const EXTENSION_MESSAGES = {
  RESULTS: 'grepscout:extension:results',
  ICON_MAP: 'grepscout:extension:iconMap',
  HISTORY: 'grepscout:extension:history',
  ERROR: 'grepscout:extension:error',
  HAS_WORKSPACE: 'grepscout:extension:hasWorkspace',
  TOGGLE_DIR_MODE: 'grepscout:extension:toggleDirMode',
  CACHE_REFRESHED: 'grepscout:extension:cacheRefreshed',
  REFRESHING_START: 'grepscout:extension:refreshingStart',
  REFRESHING_END: 'grepscout:extension:refreshingEnd',
  SETTINGS: 'grepscout:extension:settings',
} as const;

/**
 * Storage / Memento Keys
 */
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'grepscout.searchHistory',
} as const;

/**
 * Glob Patterns
 */
export const GLOB_PATTERNS = {
  ALL_FILES: '**/*',
  NODE_MODULES_EXCLUDE: '**/node_modules/**',
} as const;

/**
 * Internal URI Schema
 */
export const URI_SCHEMES = {
  SEARCH_ROOT: 'grepscout-root:/',
};

/**
 * UI Text Strings
 */
export const UI_TEXTS = {
  SEARCH_RESULTS: 'Search Results',
  OPEN_FILE: 'Open File',
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
  SECTION: 'grepscout',
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
  READY: 'grepscout:isReady',
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
