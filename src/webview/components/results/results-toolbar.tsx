import React from 'react';

import { ToolbarBtn } from '../ui/toolbar-btn';

interface ResultsToolbarProps {
  count: number;
  isFlatList: boolean;
  setIsFlatList: (v: boolean) => void;
  expandAll: () => void;
  collapseAll: () => void;
  showTooltip: (e: React.MouseEvent, text: string) => void;
  hideTooltip: () => void;
  loading: boolean;
}

export const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  count,
  isFlatList,
  setIsFlatList,
  expandAll,
  collapseAll,
  showTooltip,
  hideTooltip,
  loading,
}) => {
  return (
    <div className='flex items-center justify-between border-b border-(--vscode-sideBar-border) bg-(--vscode-sideBar-background) px-3 py-1.5'>
      <div className='flex items-center gap-2'>
        <span className='text-[11px] font-bold tracking-tight uppercase opacity-60'>Results</span>
        {loading ? (
          <i className='codicon codicon-loading codicon-modifier-spin text-[11px]! opacity-60' />
        ) : (
          <span className='rounded-full bg-(--vscode-badge-background) px-1.5 py-0 text-[10px] whitespace-nowrap text-(--vscode-badge-foreground)'>
            {count}
          </span>
        )}
      </div>

      <div className='flex items-center gap-0.5'>
        {!isFlatList && (
          <>
            <ToolbarBtn
              icon='codicon-expand-all'
              onClick={expandAll}
              onMouseEnter={(e) => showTooltip(e, 'Expand All')}
              onMouseLeave={hideTooltip}
            />
            <ToolbarBtn
              icon='codicon-collapse-all'
              onClick={collapseAll}
              onMouseEnter={(e) => showTooltip(e, 'Collapse All')}
              onMouseLeave={hideTooltip}
            />
          </>
        )}
        <ToolbarBtn
          active={isFlatList}
          icon={isFlatList ? 'codicon-list-flat' : 'codicon-list-tree'}
          onClick={() => setIsFlatList(!isFlatList)}
          onMouseEnter={(e) => showTooltip(e, isFlatList ? 'View as Tree' : 'View as Flat List')}
          onMouseLeave={hideTooltip}
        />
      </div>
    </div>
  );
};
