import React from 'react';

import { cn } from '../../utils/tw-utils';
import { ToolbarBtn } from '../ui/toolbar-btn';

interface SearchFilterProps {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  toggleActive?: boolean;
  onToggleClick?: () => void;
  toggleIcon?: string;
  showTooltip: (e: React.MouseEvent, text: string) => void;
  hideTooltip: () => void;
  tooltipText?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  label,
  value,
  setValue,
  placeholder,
  toggleActive,
  onToggleClick,
  toggleIcon,
  showTooltip,
  hideTooltip,
  tooltipText,
}) => {
  return (
    <div className='flex flex-col gap-1 px-1'>
      <div className='flex items-center gap-1'>
        <span className='flex-1 text-[11px] font-bold tracking-tight uppercase opacity-60'>{label}</span>
        {onToggleClick && toggleIcon && (
          <ToolbarBtn
            active={toggleActive}
            icon={toggleIcon}
            onClick={onToggleClick}
            onMouseEnter={(e) => showTooltip(e, tooltipText || '')}
            onMouseLeave={hideTooltip}
          />
        )}
      </div>
      <input
        type='text'
        className={cn(
          'w-full border border-(--vscode-input-border) bg-(--vscode-input-background) px-2 py-1 text-[12px] text-(--vscode-input-foreground) opacity-85 transition-all duration-150 outline-none focus:border-(--vscode-focusBorder) focus:opacity-100',
        )}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        placeholder={placeholder}
      />
    </div>
  );
};
