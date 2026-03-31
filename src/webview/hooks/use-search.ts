import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ExtensionMessage, IconMap, SearchQuery, SearchResult } from '@shared';

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
        type: 'search',
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
        } as SearchQuery,
      });
    },
    [query, include, exclude, matchCase, matchWord, useRegex, searchOpenEditors, useExcludeSettings, searchDirMode],
  );

  // Handle incoming messages from the extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case 'results':
          setResults(msg.payload);
          setLoading(false);
          break;
        case 'iconMap':
          setIconMap(msg.payload);
          break;
        case 'history':
          setHistory(msg.payload);
          break;
        case 'hasWorkspace':
          setHasWorkspace(msg.payload);
          break;
        case 'toggleDirMode':
          setSearchDirMode((v) => !v);
          break;
        case 'cacheRefreshed':
          performSearch();
          break;
        case 'refreshingStart':
          setIsRefreshing(true);
          break;
        case 'refreshingEnd':
          setIsRefreshing(false);
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
    searchTimeoutRef.current = setTimeout(() => performSearch(), 150);
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
  ]);

  const openFile = useCallback((path: string) => {
    vscode.postMessage({ type: 'openFile', payload: path });
  }, []);

  const openFolder = useCallback(() => {
    vscode.postMessage({ type: 'openFolder' });
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
