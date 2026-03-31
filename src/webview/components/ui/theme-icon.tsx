import { cn } from '../../utils/tw-utils';

export interface ThemeIconProps {
  className?: string;
  uri: string | null;
  codiconFallback: string;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({ className, uri, codiconFallback }) => {
  if (uri) {
    return <img src={uri} className={cn('h-4 w-4 select-none', className)} alt='' />;
  }
  return <i className={cn('codicon scale-90 opacity-80', codiconFallback, className)} />;
};
