import { EXTENSION_MESSAGES, WEBVIEW_MESSAGES } from '../constants';

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

/** Webview → Extension message type payloads */
type WebviewPayloads = {
  [WEBVIEW_MESSAGES.SEARCH]: SearchQuery;
  [WEBVIEW_MESSAGES.OPEN_FILE]: string;
  [WEBVIEW_MESSAGES.SAVE_HISTORY]: string[];
};

export interface Settings {
  maxResults: number;
  historyLimit: number;
  debounceDelay: number;
}

/** Extension → Webview message type payloads */
type ExtensionPayloads = {
  [EXTENSION_MESSAGES.RESULTS]: SearchResult[];
  [EXTENSION_MESSAGES.ICON_MAP]: IconMap | null;
  [EXTENSION_MESSAGES.HISTORY]: string[];
  [EXTENSION_MESSAGES.ERROR]: string;
  [EXTENSION_MESSAGES.HAS_WORKSPACE]: boolean;
  [EXTENSION_MESSAGES.SETTINGS]: Settings;
};

/** Generic helper for generating message unions from constant objects and payload mappings */
export type MessageUnion<
  Constants extends Record<string, string>,
  Payloads extends Partial<Record<string, unknown>>,
> = {
  [K in keyof Constants]: Constants[K] extends keyof Payloads
    ? { type: Constants[K]; payload: Payloads[Constants[K]] }
    : { type: Constants[K] };
}[keyof Constants];

/** Dynamic unions (automatic inference for void/rest types) */
export type WebviewMessage = MessageUnion<typeof WEBVIEW_MESSAGES, WebviewPayloads>;
export type ExtensionMessage = MessageUnion<typeof EXTENSION_MESSAGES, ExtensionPayloads>;

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
