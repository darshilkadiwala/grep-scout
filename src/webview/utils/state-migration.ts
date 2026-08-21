import { WEBVIEW_STATE_VERSION } from '@constants';
import { AppState, IconMap, Settings, type SearchResult } from '@shared';

import { asBoolean, asNumber, isObject, isStringRecord } from './helpers';

export function normalizeResults(results: unknown): SearchResult[] {
  if (!Array.isArray(results)) return [];

  return results
    .filter((result): result is SearchResult => {
      if (!isObject(result)) return false;
      return (
        typeof result.fileName === 'string' &&
        typeof result.relativePath === 'string' &&
        typeof result.fullPath === 'string'
      );
    })
    .map((result) => {
      const displayPath =
        typeof result.displayPath === 'string' && result.displayPath.trim().length > 0
          ? result.displayPath
          : result.fullPath;

      return {
        ...result,
        displayPath,
      };
    });
}

const migrations: Record<number, (state: AppState) => AppState> = {
  2: (state) => ({
    ...state,
    results: normalizeResults(state.results),
  }),
};

export function migrateState(rawState: unknown): AppState {
  if (!isObject(rawState)) {
    return { __stateVersion: WEBVIEW_STATE_VERSION };
  }

  let state: AppState = { ...(rawState as AppState) };
  let stateVersion = Number(state.__stateVersion ?? 1);

  if (!Number.isFinite(stateVersion) || stateVersion < 1) {
    stateVersion = 1;
  }

  while (stateVersion < WEBVIEW_STATE_VERSION) {
    const nextVersion = stateVersion + 1;
    const applyMigration = migrations[nextVersion];
    if (applyMigration) {
      state = applyMigration(state);
    }
    stateVersion = nextVersion;
  }

  return {
    ...state,
    __stateVersion: WEBVIEW_STATE_VERSION,
  };
}

export function parseHistory(payload: unknown): string[] | null {
  if (!Array.isArray(payload)) return null;
  if (!payload.every((entry) => typeof entry === 'string')) return null;
  return payload;
}

export function parseHasWorkspace(payload: unknown): boolean | null {
  return asBoolean(payload);
}

export function parseIconMap(payload: unknown): IconMap | null {
  if (payload === null) return null;
  if (!isObject(payload)) return null;

  const byExtension = payload.byExtension;
  const byFileName = payload.byFileName;
  const byFolderName = payload.byFolderName;
  const defaultFile = payload.defaultFile;
  const folder = payload.folder;
  const folderOpen = payload.folderOpen;

  if (
    !isStringRecord(byExtension) ||
    !isStringRecord(byFileName) ||
    !isStringRecord(byFolderName) ||
    typeof defaultFile !== 'string' ||
    typeof folder !== 'string' ||
    typeof folderOpen !== 'string'
  ) {
    return null;
  }

  return {
    byExtension,
    byFileName,
    byFolderName,
    defaultFile,
    folder,
    folderOpen,
  };
}

export function parseSettings(payload: unknown): Settings | null {
  if (!isObject(payload)) return null;

  const maxResults = asNumber(payload.maxResults);
  const historyLimit = asNumber(payload.historyLimit);
  const debounceDelay = asNumber(payload.debounceDelay);

  if (maxResults === null || historyLimit === null || debounceDelay === null) {
    return null;
  }

  return {
    maxResults,
    historyLimit,
    debounceDelay,
  };
}
