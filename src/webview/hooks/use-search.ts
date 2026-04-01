import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EXTENSION_MESSAGES, SEARCH_CONFIG, WEBVIEW_MESSAGES } from '@constants';
import { ExtensionMessage, IconMap, SearchResult, Settings, WebviewMessage } from '@shared';

import { vscode } from '@/utils/vscode';

/**
 * Orchestrates search input state, debounced updates, and cross-webview communication.
 */
export function useSearch() {
  const initialState = useMemo(() => vscode.getState() || {}, []);

  // UI state
  const [query, setQuery] = useState(initialState.query || '');
  const [include, setInclude] = useState(initialState.include || '');
  const [exclude, setExclude] = useState(initialState.exclude || '');
  const [matchCase, setMatchCase] = useState(initialState.matchCase || false);
  const [matchWord, setMatchWord] = useState(initialState.matchWord || false);
  const [useRegex, setUseRegex] = useState(initialState.useRegex || false);
  const [searchOpenEditors, setSearchOpenEditors] = useState(initialState.searchOpenEditors || false);
  const [useExcludeSettings, setUseExcludeSettings] = useState<boolean>(initialState.useExcludeSettings || true);
  const [searchDirMode, setSearchDirMode] = useState(initialState.searchDirMode || false);

  // Result state
  const [results, setResults] = useState<SearchResult[]>(initialState.results || []);
  const [iconMap, setIconMap] = useState<IconMap | null>(initialState.iconMap || null);
  const [history, setHistory] = useState<string[]>([]);
  const [hasWorkspace, setHasWorkspace] = useState(true);
  const [showDetails, setShowDetails] = useState(initialState.showDetails || false);
  const [isFlatList, setIsFlatList] = useState(initialState.isFlatList || false);

  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    maxResults: SEARCH_CONFIG.MAX_RESULTS,
    historyLimit: SEARCH_CONFIG.HISTORY_LIMIT,
    debounceDelay: SEARCH_CONFIG.DEBOUNCE_DELAY,
  });

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist to vscode state on change
  useEffect(() => {
    vscode.setState({
      query,
      include,
      exclude,
      matchCase,
      matchWord,
      useRegex,
      searchOpenEditors,
      useExcludeSettings,
      searchDirMode,
      results,
      iconMap,
      showDetails,
      isFlatList,
    });
  }, [
    query,
    include,
    exclude,
    matchCase,
    matchWord,
    useRegex,
    searchOpenEditors,
    useExcludeSettings,
    searchDirMode,
    results,
    iconMap,
    showDetails,
    isFlatList,
  ]);

  const performSearch = useCallback(
    (qText = query) => {
      setLoading(true);
      vscode.postMessage({
        type: WEBVIEW_MESSAGES.SEARCH,
        payload: {
          query: qText,
          include,
          exclude,
          matchCase,
          matchWord,
          useRegex,
          searchOpenEditors,
          useExcludeSettings,
          searchMode: searchDirMode ? 'dir' : 'file',
        },
      } as WebviewMessage);
    },
    [query, include, exclude, matchCase, matchWord, useRegex, searchOpenEditors, useExcludeSettings, searchDirMode],
  );

  // Handle incoming messages from the extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case EXTENSION_MESSAGES.RESULTS:
          setResults(msg.payload);
          setLoading(false);
          break;
        case EXTENSION_MESSAGES.ICON_MAP:
          setIconMap(msg.payload);
          break;
        case EXTENSION_MESSAGES.HISTORY:
          setHistory(msg.payload);
          break;
        case EXTENSION_MESSAGES.HAS_WORKSPACE:
          setHasWorkspace(msg.payload);
          break;
        case EXTENSION_MESSAGES.TOGGLE_DIR_MODE:
          setSearchDirMode((v) => !v);
          break;
        case EXTENSION_MESSAGES.CACHE_REFRESHED:
          performSearch();
          break;
        case EXTENSION_MESSAGES.REFRESHING_START:
          setIsRefreshing(true);
          break;
        case EXTENSION_MESSAGES.REFRESHING_END:
          setIsRefreshing(false);
          break;
        case EXTENSION_MESSAGES.SETTINGS:
          setSettings(msg.payload);
          break;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [performSearch]);

  // Debounced search when any filter changes
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => performSearch(), settings.debounceDelay);
  }, [
    query,
    include,
    exclude,
    matchCase,
    matchWord,
    useRegex,
    searchOpenEditors,
    useExcludeSettings,
    searchDirMode,
    performSearch,
    settings.debounceDelay,
  ]);

  const openFile = useCallback((path: string) => {
    vscode.postMessage({ type: WEBVIEW_MESSAGES.OPEN_FILE, payload: path });
  }, []);

  const openFolder = useCallback(() => {
    vscode.postMessage({ type: WEBVIEW_MESSAGES.OPEN_FOLDER });
  }, []);

  return {
    query,
    setQuery,
    include,
    setInclude,
    exclude,
    setExclude,
    matchCase,
    setMatchCase,
    matchWord,
    setMatchWord,
    useRegex,
    setUseRegex,
    searchOpenEditors,
    setSearchOpenEditors,
    useExcludeSettings,
    setUseExcludeSettings,
    searchDirMode,
    setSearchDirMode,
    results,
    setResults,
    loading,
    isRefreshing,
    iconMap,
    history,
    hasWorkspace,
    showDetails,
    setShowDetails,
    isFlatList,
    setIsFlatList,
    openFile,
    openFolder,
  };
}
