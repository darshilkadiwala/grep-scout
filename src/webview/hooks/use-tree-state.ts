import { useCallback, useEffect, useMemo, useState } from 'react';

import { SearchResult } from '@shared';

import { buildTree, collectAllFolderPaths, TreeNode } from '@/utils/tree-utils';

/**
 * Manages the hierarchical tree state of search results.
 */
export function useTreeState(results: SearchResult[]) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(results), [results]);

  const expandAll = useCallback(() => {
    const allPaths = collectAllFolderPaths(tree);
    setExpanded(new Set(allPaths));
  }, [tree]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  // Default: expand all when results change
  useEffect(() => {
    if (results.length > 0) {
      expandAll();
    }
  }, [results, expandAll]);

  const toggleFolder = useCallback(
    (folderPath: string, recursive: boolean) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        const isCurrentlyExpanded = next.has(folderPath);

        if (recursive) {
          // Find the node in the tree
          function findNode(nodes: TreeNode[], path: string): TreeNode | null {
            for (const n of nodes) {
              if (n.fullPath === path) return n;
              if (n.children) {
                const found = findNode(n.children, path);
                if (found) return found;
              }
            }
            return null;
          }

          const node = findNode(tree, folderPath);
          if (node) {
            const allNestedPaths = collectAllFolderPaths([node]);
            if (isCurrentlyExpanded) {
              allNestedPaths.forEach((p) => next.delete(p));
            } else {
              allNestedPaths.forEach((p) => next.add(p));
            }
          }
        } else {
          if (isCurrentlyExpanded) {
            next.delete(folderPath);
          } else {
            next.add(folderPath);
          }
        }
        return next;
      });
    },
    [tree],
  );

  return { tree, expanded, toggleFolder, expandAll, collapseAll };
}
