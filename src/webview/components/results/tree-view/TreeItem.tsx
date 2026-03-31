import { IconMap } from '@shared';

import { ThemeIcon } from '@/components/ui/theme-icon';
import { getFileIconUri, getFolderIconUri } from '@/utils/icon-utils';
import { TreeNode } from '@/utils/tree-utils';
import { cn } from '@/utils/tw-utils';

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  iconMap: IconMap | null;
  onToggle: (path: string, recursive: boolean) => void;
  onOpen: (path: string) => void;
}

export const TreeItem: React.FC<TreeItemProps> = ({ node, depth, expanded, iconMap, onToggle, onOpen }) => {
  // Indent = 12px per depth level to match VS Code default.
  const indentStep = 12;

  /** Render the vertical indentation guides */
  const renderGuides = () => {
    return Array.from({ length: depth }).map((_, i) => (
      <div
        key={i}
        className='absolute top-0 bottom-0 border-l border-(--vscode-tree-indentGuidesStroke) opacity-40'
        style={{ left: `${8 + i * indentStep}px` }}
      />
    ));
  };

  if (node.kind === 'file' && node.result) {
    const iconUri = getFileIconUri(iconMap, node.result.fileName);
    return (
      <div
        className={cn(
          'relative flex cursor-pointer items-center gap-1.5 py-0.5 select-none hover:bg-(--vscode-list-hoverBackground) active:bg-(--vscode-list-activeSelectionBackground) active:text-(--vscode-list-activeSelectionForeground)',
        )}
        style={{ paddingLeft: `${8 + depth * indentStep}px` }}
        onClick={() => onOpen(node.result!.fullPath)}
        title={node.result.fullPath}>
        {renderGuides()}
        {/* Spacer to align with chevron width */}
        <div className='w-4 shrink-0' />
        <ThemeIcon uri={iconUri} codiconFallback='codicon-file' />
        <div className='min-w-0 flex-1 truncate overflow-hidden text-[13px] whitespace-nowrap'>
          <span className='font-normal text-(--vscode-foreground)'>{node.result.fileName}</span>
          <span className='ml-2 text-[12px] opacity-60'>{node.result.relativePath}</span>
        </div>
      </div>
    );
  }

  if (node.kind === 'folder' && node.fullPath) {
    const isOpen = expanded.has(node.fullPath);
    const baseFolderName = node.name?.includes('/') ? node.name.split('/').pop() : node.name;
    const folderIconUri = getFolderIconUri(iconMap, isOpen, baseFolderName);

    return (
      <>
        <div
          className={cn(
            'relative flex cursor-pointer items-center gap-1.5 py-0.5 select-none hover:bg-(--vscode-list-hoverBackground)',
          )}
          style={{ paddingLeft: `${8 + depth * indentStep}px` }}
          onClick={(e) => onToggle(node.fullPath!, e.altKey)}
          title={`${node.fullPath}\n\nAlt+click to expand/collapse all nested`}>
          {renderGuides()}
          <div className='flex h-4 w-4 shrink-0 items-center justify-center opacity-70'>
            <i
              className={cn(
                'codicon text-[11px]!',
                isOpen ? 'codicon-chevron-down' : 'codicon-chevron-right',
                'transition-transform duration-100',
              )}
            />
          </div>
          <ThemeIcon uri={folderIconUri} codiconFallback={isOpen ? 'codicon-folder-opened' : 'codicon-folder'} />
          <span className='min-w-0 truncate text-[13px]'>{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map((child, i) => (
              <TreeItem
                key={`${node.fullPath}-${i}`}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                iconMap={iconMap}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  return null;
};
