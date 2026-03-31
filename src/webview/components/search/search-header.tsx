import React from 'react';

import { cn } from '../../utils/tw-utils';
import { ToolbarBtn } from '../ui/toolbar-btn';

interface SearchHeaderProps {
  query: string;
  setQuery: (q: string) => void;
  matchCase: boolean;
  setMatchCase: (v: boolean) => void;
  matchWord: boolean;
  setMatchWord: (v: boolean) => void;
  useRegex: boolean;
  setUseRegex: (v: boolean) => void;
  showTooltip: (e: React.MouseEvent, text: string) => void;
  hideTooltip: () => void;
  history: string[];
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  setQuery,
  matchCase,
  setMatchCase,
  matchWord,
  setMatchWord,
  useRegex,
  setUseRegex,
  showTooltip,
  hideTooltip,
}) => {
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex min-w-0 items-center gap-1'>
        <div className='relative flex min-w-0 flex-1 items-center'>
          <input
            type='text'
            className={cn(
              'w-full rounded border border-(--vscode-input-border) bg-(--vscode-input-background) py-1.25 pr-32 pl-2 text-[13px] text-(--vscode-input-foreground) outline-none focus:border-(--vscode-focusBorder)',
            )}
            placeholder='Search file names...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            autoComplete='off'
          />

          <div className='absolute right-1 flex h-full items-center'>
            {query && (
              <ToolbarBtn
                active={false}
                icon='codicon-close'
                onClick={() => setQuery('')}
                onMouseEnter={(e) => showTooltip(e, 'Clear')}
                onMouseLeave={hideTooltip}
              />
            )}
            <ToolbarBtn
              active={matchCase}
              icon='codicon-case-sensitive'
              onClick={() => setMatchCase(!matchCase)}
              onMouseEnter={(e) => showTooltip(e, 'Match Case')}
              onMouseLeave={hideTooltip}
            />
            <ToolbarBtn
              active={matchWord}
              icon='codicon-whole-word'
              onClick={() => setMatchWord(!matchWord)}
              onMouseEnter={(e) => showTooltip(e, 'Match Whole Word')}
              onMouseLeave={hideTooltip}
            />
            <ToolbarBtn
              active={useRegex}
              icon='codicon-regex'
              onClick={() => setUseRegex(!useRegex)}
              onMouseEnter={(e) => showTooltip(e, 'Use Regular Expression')}
              onMouseLeave={hideTooltip}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
