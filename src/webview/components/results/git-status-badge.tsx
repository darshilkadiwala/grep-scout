import React from 'react';

import { cn } from '../../utils/tw-utils';

interface GitStatusBadgeProps {
  status?: string;
  className?: string;
}

export const GitStatusBadge: React.FC<GitStatusBadgeProps> = ({ status, className }) => {
  if (!status) {
    return null;
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'M':
        return 'text-(--vscode-gitDecoration-modifiedResourceForeground)';
      case 'A':
        return 'text-(--vscode-gitDecoration-addedResourceForeground)';
      case 'U':
        return 'text-(--vscode-gitDecoration-untrackedResourceForeground)';
      case 'D':
        return 'text-(--vscode-gitDecoration-deletedResourceForeground)';
      case 'R':
        return 'text-(--vscode-gitDecoration-renamedResourceForeground)';
      case 'I':
        return 'text-(--vscode-gitDecoration-ignoredResourceForeground)';
      default:
        return 'opacity-50';
    }
  };

  return (
    <span
      className={cn(
        'me-4 ml-auto flex shrink-0 items-center justify-end ps-0.5 text-[13px] leading-none font-medium select-none',
        getStatusColor(status),
        className,
      )}>
      {status}
    </span>
  );
};
