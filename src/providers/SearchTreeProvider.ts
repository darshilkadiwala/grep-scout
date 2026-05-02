import * as vscode from 'vscode';

import { COMMANDS, UI_TEXTS, URI_SCHEMES } from '../constants';

// ---------------------------------------------------------------------------
// TreeItem
// ---------------------------------------------------------------------------

export class SearchResultItem extends vscode.TreeItem {
  constructor(
    public readonly uri: vscode.Uri,
    public readonly isFolder: boolean,
    collapsibleState: vscode.TreeItemCollapsibleState,
    label?: string,
  ) {
    if (label) {
      super(label, collapsibleState);
    } else {
      super(uri, collapsibleState);
    }

    // The single magic line that gives us native icons + Git decorations for free.
    this.resourceUri = uri;

    if (!isFolder) {
      // Clicking a file opens it without stealing focus from the sidebar.
      this.command = {
        command: COMMANDS.VSCODE_OPEN,
        title: UI_TEXTS.OPEN_FILE,
        arguments: [uri],
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Internal trie node
// ---------------------------------------------------------------------------

/**
 * A node in the path-segment trie.
 *
 * - `uri`      – the full vscode.Uri for this segment (folder or file).
 * - `isFile`   – true when this node corresponds to one of the search results.
 * - `children` – map from the *next* path segment name → child node.
 *                Empty for leaf files.
 */
interface TrieNode {
  uri: vscode.Uri;
  isFile: boolean;
  children: Map<string, TrieNode>;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class SearchTreeProvider implements vscode.TreeDataProvider<SearchResultItem> {
  // ── Event emitter ──────────────────────────────────────────────────────────
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<SearchResultItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  // ── State ──────────────────────────────────────────────────────────────────
  private _results: vscode.Uri[] = [];
  private _isFlatList = false;

  /** Lazily built; invalidated whenever _results changes. */
  private _trie: TrieNode | null = null;

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Called by SearchSidebarProvider after each successful search. */
  public updateResults(results: vscode.Uri[]): void {
    this._results = results;
    this._trie = null; // invalidate cached trie
    this.refresh();
  }

  public toggleViewMode(): void {
    this._isFlatList = !this._isFlatList;
    this.refresh();
  }

  public get isFlatList(): boolean {
    return this._isFlatList;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public clear(): void {
    this._results = [];
    this._trie = null;
    this.refresh();
  }

  // ── TreeDataProvider ───────────────────────────────────────────────────────

  getTreeItem(element: SearchResultItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SearchResultItem): Thenable<SearchResultItem[]> {
    if (this._results.length === 0) {
      return Promise.resolve([]);
    }

    if (this._isFlatList) {
      return Promise.resolve(this._getFlatChildren(element));
    }

    return Promise.resolve(this._getNestedChildren(element));
  }

  // ── Flat list ──────────────────────────────────────────────────────────────

  private _getFlatChildren(element?: SearchResultItem): SearchResultItem[] {
    if (element) {
      // Flat list has no nesting – folders are never shown.
      return [];
    }
    return this._results.map((uri) => new SearchResultItem(uri, false, vscode.TreeItemCollapsibleState.None));
  }

  // ── Nested tree ────────────────────────────────────────────────────────────

  private _getNestedChildren(element?: SearchResultItem): SearchResultItem[] {
    const trie = this._getOrBuildTrie();

    if (!element) {
      // Root level: return the direct children of the trie root.
      return this._trieChildrenToItems(trie.children);
    }

    // Navigate to the trie node that corresponds to `element.uri`.
    const node = this._findTrieNode(trie, element.uri);
    if (!node) {
      return [];
    }

    return this._trieChildrenToItems(node.children);
  }

  // ── Trie construction ──────────────────────────────────────────────────────

  /**
   * Returns the cached trie, building it first if necessary.
   *
   * The trie root is a virtual node whose `children` map holds one entry per
   * unique top-level path segment across all results.
   */
  private _getOrBuildTrie(): TrieNode {
    if (this._trie) {
      return this._trie;
    }

    // Sentinel root – its own uri is never exposed to VS Code.
    const root: TrieNode = {
      uri: vscode.Uri.parse(URI_SCHEMES.SEARCH_ROOT),
      isFile: false,
      children: new Map(),
    };

    for (const fileUri of this._results) {
      this._insertIntoTrie(root, fileUri);
    }

    // Collapse single-child folder chains (like VS Code's native explorer does).
    this._collapseSingleChildFolders(root);

    this._trie = root;
    return root;
  }

  /**
   * Inserts a single file URI into the trie.
   *
   * The algorithm walks the *relative* path segments of the file so the tree
   * is rooted at the workspace, not the filesystem root.
   *
   * Example: `src/providers/foo.ts`
   *   root → "src" (folder) → "providers" (folder) → "foo.ts" (file)
   */
  private _insertIntoTrie(root: TrieNode, fileUri: vscode.Uri): void {
    // Get the workspace-relative path (e.g. "src/providers/foo.ts").
    const relativePath = vscode.workspace.asRelativePath(fileUri, false);

    // Normalise separators to forward-slash and split into segments.
    const segments = relativePath.replace(/\\/g, '/').split('/').filter(Boolean);

    if (segments.length === 0) {
      return;
    }

    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLastSegment = i === segments.length - 1;

      if (!current.children.has(segment)) {
        // Build the uri for this intermediate folder or the final file.
        // For folders we re-construct the path from the workspace root.
        const segmentUri = isLastSegment ? fileUri : this._buildFolderUri(fileUri, segments.slice(0, i + 1));

        current.children.set(segment, {
          uri: segmentUri,
          isFile: isLastSegment,
          children: new Map(),
        });
      }

      current = current.children.get(segment)!;
    }
  }

  /**
   * Build a vscode.Uri for a folder given the path segments relative to the
   * workspace root.
   */
  private _buildFolderUri(fileUri: vscode.Uri, folderSegments: string[]): vscode.Uri {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
    if (workspaceFolder) {
      return vscode.Uri.joinPath(workspaceFolder.uri, ...folderSegments);
    }
    // Fallback if no workspace (should be rare in VS Code)
    return fileUri.with({ path: fileUri.path.split('/').slice(0, -1).join('/') });
  }

  // ── Trie path compression ──────────────────────────────────────────────────

  /**
   * Recursively collapses "chain" folder nodes that have exactly one child
   * which is itself a folder.  This mirrors VS Code Explorer's "compact
   * folders" behaviour (e.g. `src/utils/` shown as a single node).
   *
   * The collapsed label becomes the joined path (e.g. `src/utils`) while the
   * uri still points to the deepest folder so Git decorations work.
   *
   * We skip collapsing the trie *root* itself.
   */
  private _collapseSingleChildFolders(node: TrieNode): void {
    const keys = Array.from(node.children.keys());

    for (const key of keys) {
      const child = node.children.get(key);
      if (!child) continue;

      // Recurse first (post-order so children are already collapsed).
      this._collapseSingleChildFolders(child);

      // Collapse child into `node` if:
      //  • child is not a file
      //  • child has exactly one grandchild
      //  • that grandchild is also a folder (not a file)
      if (!child.isFile && child.children.size === 1) {
        const [[grandKey, grandChild]] = child.children;
        if (!grandChild.isFile) {
          // Merge: remove child, and insert grandchild with merged key
          node.children.delete(key);
          const mergedKey = `${key}/${grandKey}`;
          node.children.set(mergedKey, grandChild);
          // Recursively try to collapse this newly merged key into the same node if possible
          // But actually since we do post-order, and we just merged grandChild,
          // we are done for this specific subtree of node.
        }
      }
    }
  }

  // ── Trie traversal helpers ─────────────────────────────────────────────────

  /**
   * Find the trie node whose uri matches `targetUri`.
   */
  private _findTrieNode(root: TrieNode, targetUri: vscode.Uri): TrieNode | null {
    const targetUriString = targetUri.toString();

    // Iterative DFS using a stack.
    const stack: TrieNode[] = [root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node !== root && node.uri.toString() === targetUriString) {
        return node;
      }
      for (const child of node.children.values()) {
        stack.push(child);
      }
    }
    return null;
  }

  /**
   * Convert trie children into VS Code TreeItems, sorted folders-first then
   * alphabetically within each group (mirrors Explorer default sort).
   */
  private _trieChildrenToItems(children: Map<string, TrieNode>): SearchResultItem[] {
    const entries = Array.from(children.entries());

    // Sort: folders first, then files; each group alphabetically (case-insensitive).
    entries.sort(([keyA, nodeA], [keyB, nodeB]) => {
      if (nodeA.isFile !== nodeB.isFile) {
        return nodeA.isFile ? 1 : -1; // folders before files
      }
      return keyA.localeCompare(keyB, undefined, { sensitivity: 'base' });
    });

    return entries.map(([key, node]) => {
      const collapsibleState = node.isFile
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed;

      return new SearchResultItem(node.uri, !node.isFile, collapsibleState, key);
    });
  }
}
