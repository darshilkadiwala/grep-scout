export interface SearchQuery {
  query: string;
  include?: string;
  exclude?: string;
  matchCase?: boolean;
  matchWord?: boolean;
  useRegex?: boolean;
  searchOpenEditors?: boolean;
  useExcludeSettings?: boolean;
  /** 'file' = match against file names (default); 'dir' = match dir segments, return all contents */
  searchMode?: 'file' | 'dir';
}

export interface SearchResult {
  fileName: string;
  relativePath: string;
  fullPath: string;
}

/**
 * Maps resolved icon URIs for the current result set.
 * Keyed by lowercase extension or filename for O(1) lookup in the webview.
 */
export interface IconMap {
  /** lowercase extension (e.g. "ts", "test.ts") → webview URI string */
  byExtension: Record<string, string>;
  /** lowercase filename (e.g. "package.json") → webview URI string */
  byFileName: Record<string, string>;
  /** lowercase folder name (e.g. "src", "tests") → webview URI string */
  byFolderName: Record<string, string>;
  /** Fallback file icon URI */
  defaultFile: string;
  /** Folder icon (closed) URI */
  folder: string;
  /** Folder icon (open / expanded) URI */
  folderOpen: string;
}

export type WebviewMessage =
  | { type: 'search'; payload: SearchQuery }
  | { type: 'openFile'; payload: string }
  | { type: 'getHistory' }
  | { type: 'openFolder' }
  | { type: 'saveHistory'; payload: string[] }
  | { type: 'refreshCache' };

export type ExtensionMessage =
  | { type: 'results'; payload: SearchResult[] }
  | { type: 'iconMap'; payload: IconMap | null }
  | { type: 'history'; payload: string[] }
  | { type: 'error'; payload: string }
  | { type: 'hasWorkspace'; payload: boolean }
  | { type: 'toggleDirMode' }
  | { type: 'cacheRefreshed' }
  | { type: 'refreshingStart' }
  | { type: 'refreshingEnd' };

export interface AppState {
  query?: string;
  include?: string;
  exclude?: string;
  matchCase?: boolean;
  matchWord?: boolean;
  useRegex?: boolean;
  searchOpenEditors?: boolean;
  useExcludeSettings?: boolean;
  searchDirMode?: boolean;
  results?: SearchResult[];
  iconMap?: IconMap | null;
  showDetails?: boolean;
  isFlatList?: boolean;
}
