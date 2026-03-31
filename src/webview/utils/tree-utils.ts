import { SearchResult } from '@shared';

export interface TreeNode {
  kind: 'file' | 'folder';
  result?: SearchResult;
  name?: string;
  fullPath?: string;
  children?: TreeNode[];
}

interface TrieNode {
  children: Map<string, TrieNode>;
  file?: SearchResult;
  folderPath: string;
}

/**
 * Builds a hierarchical tree structure from a list of search results.
 * Implements "compact folders" logic within the webview.
 */
export function buildTree(results: SearchResult[]): TreeNode[] {
  const root: TrieNode = { children: new Map(), folderPath: '' };

  for (const r of results) {
    const segments = r.relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
    let cur = root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isLastSeg = i === segments.length - 1;

      if (!cur.children.has(seg)) {
        let folderPath = '';
        if (!isLastSeg) {
          const trailingSegs = segments.length - i - 1;
          const fsParts = r.fullPath.replace(/\\/g, '/').split('/');
          folderPath = trailingSegs > 0 ? fsParts.slice(0, -trailingSegs).join('/') : fsParts.join('/');
        }
        cur.children.set(seg, { children: new Map(), folderPath });
      }

      cur = cur.children.get(seg)!;
    }

    cur.file = r;
  }

  function trieToNodes(node: TrieNode): TreeNode[] {
    const nodes: TreeNode[] = [];

    for (const [key, child] of node.children) {
      if (child.file) {
        nodes.push({ kind: 'file', result: child.file });
      } else {
        let label = key;
        let cur = child;

        // Path compression (Compact Folders)
        while (cur.children.size === 1) {
          const [[nextKey, nextChild]] = cur.children;
          if (nextChild.file) break;
          label += `/${nextKey}`;
          cur = nextChild;
        }

        nodes.push({
          kind: 'folder',
          name: label,
          fullPath: cur.folderPath || child.folderPath,
          children: trieToNodes(cur),
        });
      }
    }

    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      const na = a.kind === 'folder' ? a.name : a.result?.fileName;
      const nb = b.kind === 'folder' ? b.name : b.result?.fileName;
      return (na || '').localeCompare(nb || '', undefined, { numeric: true, sensitivity: 'base' });
    });

    return nodes;
  }

  return trieToNodes(root);
}

/**
 * Returns a flat array of all folder paths found in the tree.
 */
export function collectAllFolderPaths(nodes: TreeNode[]): string[] {
  const paths: string[] = [];
  function traverse(ns: TreeNode[]) {
    for (const n of ns) {
      if (n.kind === 'folder' && n.fullPath) {
        paths.push(n.fullPath);
        if (n.children) traverse(n.children);
      }
    }
  }
  traverse(nodes);
  return paths;
}
