import * as vscode from 'vscode';

import { SearchQuery, SearchResult } from '../types';
import { FileCacheController } from './FileCacheController';

// ─── Utils ────────────────────────────────────────────────────────────────────

// Checks if a relative path matches a glob pattern like **/*.ts
function isGlobMatch(relPath: string, glob: string): boolean {
  if (!glob || glob === '*' || glob === '**/*') return true;
  // Naive glob-to-regex converter.
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');
  const re = new RegExp(`^${escaped}$`, 'i');
  return re.test(relPath);
}

function getBasename(path: string): string {
  return path.split(/[\\/]/).pop() || '';
}

// ─── Shared matcher ───────────────────────────────────────────────────────────

function matchesSegment(
  segment: string,
  query: string,
  opts: { matchCase?: boolean; matchWord?: boolean; useRegex?: boolean },
): boolean {
  if (!query) return true;
  const { matchCase, matchWord, useRegex } = opts;

  if (useRegex) {
    try {
      const flags = matchCase ? '' : 'i';
      const re = new RegExp(query, flags);
      return matchWord ? re.test(`\\b${segment}\\b`) : re.test(segment);
    } catch {
      return false;
    }
  }

  const haystack = matchCase ? segment : segment.toLowerCase();
  const needle = matchCase ? query : query.toLowerCase();

  if (matchWord) {
    const idx = haystack.indexOf(needle);
    if (idx === -1) {
      return false;
    }
    const before = idx === 0 || !/\w/.test(haystack[idx - 1]);
    const after = idx + needle.length === haystack.length || !/\w/.test(haystack[idx + needle.length]);
    return before && after;
  }

  return haystack.includes(needle);
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class SearchController {
  public static async search(query: SearchQuery, maxResults: number = 500): Promise<SearchResult[]> {
    const { query: rawQuery, include, matchCase, matchWord, useRegex, searchOpenEditors, searchMode = 'file' } = query;

    if (!rawQuery && !include) {
      return [];
    }

    // Ensure cache is initialized
    await FileCacheController.init();
    const allCacheFiles = FileCacheController.getAllFiles();

    const openUris = searchOpenEditors
      ? new Set(vscode.workspace.textDocuments.map((doc) => doc.uri.toString()))
      : null;

    const filteredPool = allCacheFiles.filter((file) => {
      if (openUris && !openUris.has(file.toString())) return false;
      return true;
    });

    const matchOpts = { matchCase, matchWord, useRegex };

    // ── Dir search ─────────────────────────────────────────────────────────────
    if (searchMode === 'dir' && rawQuery.trim()) {
      const matchingPrefixes = new Set<string>();
      for (const file of filteredPool) {
        const relPath = vscode.workspace.asRelativePath(file, false).replace(/\\/g, '/');
        const segments = relPath.split('/');
        for (let i = 0; i < segments.length - 1; i++) {
          if (matchesSegment(segments[i], rawQuery, matchOpts)) {
            matchingPrefixes.add(segments.slice(0, i + 1).join('/') + '/');
          }
        }
      }
      if (matchingPrefixes.size === 0) return [];
      const prefixArr = Array.from(matchingPrefixes);
      const matchedFiles = filteredPool.filter((file) => {
        const relPath = vscode.workspace.asRelativePath(file, false).replace(/\\/g, '/');
        return prefixArr.some((prefix) => relPath.startsWith(prefix));
      });

      // Sort matched files by relative path for explorer-like grouping and consistency
      matchedFiles.sort((a, b) => {
        const relA = vscode.workspace.asRelativePath(a, false).replace(/\\/g, '/');
        const relB = vscode.workspace.asRelativePath(b, false).replace(/\\/g, '/');
        return relA.localeCompare(relB, undefined, { numeric: true, sensitivity: 'base' });
      });

      return matchedFiles.slice(0, maxResults).map((f) => ({
        fileName: getBasename(f.path),
        relativePath: vscode.workspace.asRelativePath(f),
        fullPath: f.toString(),
      }));
    }

    // ── File search (default) ──────────────────────────────────────────────────
    const finalFiles = include
      ? filteredPool.filter((f) => isGlobMatch(vscode.workspace.asRelativePath(f, false).replace(/\\/g, '/'), include))
      : filteredPool;

    const queryMatches = finalFiles.filter((file) => matchesSegment(getBasename(file.path), rawQuery, matchOpts));

    // Sort by relative path for explorer-like grouping and consistency
    queryMatches.sort((a, b) => {
      const relA = vscode.workspace.asRelativePath(a, false).replace(/\\/g, '/');
      const relB = vscode.workspace.asRelativePath(b, false).replace(/\\/g, '/');
      return relA.localeCompare(relB, undefined, { numeric: true, sensitivity: 'base' });
    });

    return queryMatches.slice(0, maxResults).map((file) => ({
      fileName: getBasename(file.path),
      relativePath: vscode.workspace.asRelativePath(file),
      fullPath: file.toString(),
    }));
  }

  public static async openFile(fullPath: string) {
    const uri = vscode.Uri.parse(fullPath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, { preserveFocus: true });
  }
}
