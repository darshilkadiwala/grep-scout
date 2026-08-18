import React from 'react';

import { IconMap, SearchResult } from '../../../types';
import { getFileIconUri } from '../../utils/icon-utils';
import { getDisplayPath, getGitStatusLabel } from '../../utils/path-utils';
import { ThemeIcon } from '../ui/theme-icon';
import { GitStatusBadge } from './git-status-badge';

interface FlatListViewProps {
  results: SearchResult[];
  iconMap: IconMap | null;
  onOpen: (path: string, preview?: boolean) => void;
}

export const FlatListView: React.FC<FlatListViewProps> = ({ results, iconMap, onOpen }) => {
  return (
    <div className='flex h-full flex-col overflow-x-hidden overflow-y-auto pt-1.5'>
      {results.map((r) => {
        const iconUri = getFileIconUri(iconMap, r.fileName);
        const displayPath = getDisplayPath(r.displayPath, r.fullPath);
        const gitStatusLabel = getGitStatusLabel(r.gitStatus);
        const tooltipText = gitStatusLabel ? `${displayPath} • ${gitStatusLabel}` : displayPath;

        return (
          <div
            key={r.fullPath}
            className='flex cursor-pointer items-center gap-1.5 px-3.5 py-0.75 select-none hover:bg-(--vscode-list-hoverBackground) active:bg-(--vscode-list-activeSelectionBackground) active:text-(--vscode-list-activeSelectionForeground)'
            onClick={() => onOpen(r.fullPath, true)}
            onDoubleClick={() => onOpen(r.fullPath, false)}
            title={tooltipText}>
            <ThemeIcon uri={iconUri} codiconFallback='codicon-file' />
            <div className='min-w-0 flex-1 truncate overflow-hidden text-[13px] whitespace-nowrap'>
              <span className='font-medium text-(--vscode-foreground)'>{r.fileName}</span>
              <span className='ml-2 text-[11px] opacity-60'>{r.relativePath}</span>
            </div>
            <GitStatusBadge status={r.gitStatus} />
          </div>
        );
      })}
    </div>
  );
};
