import { cn } from '../../utils/tw-utils';

export interface ToolbarBtnProps {
  className?: string; // Add optional className prop
  active?: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  icon: string;
}

export const ToolbarBtn: React.FC<ToolbarBtnProps> = ({
  className,
  active,
  onClick,
  onMouseEnter,
  onMouseLeave,
  icon,
}) => {
  return (
    <div
      className={cn(
        'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors duration-100',
        active
          ? 'bg-(--vscode-button-background) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground)'
          : 'text-(--vscode-icon-foreground) opacity-90 hover:bg-(--vscode-toolbar-hoverBackground)',
        className,
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      <i className={cn('codicon text-[16px]!', icon)} />
    </div>
  );
};
