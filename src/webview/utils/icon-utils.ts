import { IconMap } from '@shared';

/**
 * Returns a webview URI for a file icon.
 */
export function getFileIconUri(iconMap: IconMap | null, fileName: string): string | null {
  if (!iconMap) return null;
  const lowerName = fileName.toLowerCase();

  // 1. match exact filename (e.g. package.json)
  if (iconMap.byFileName[lowerName]) return iconMap.byFileName[lowerName];

  // 2. match extension (e.g. spec.ts, then ts)
  const segments = lowerName.split('.');
  if (segments.length > 1) {
    const doubleExt = segments.slice(-2).join('.');
    if (iconMap.byExtension[doubleExt]) return iconMap.byExtension[doubleExt];

    const singleExt = segments[segments.length - 1];
    if (iconMap.byExtension[singleExt]) return iconMap.byExtension[singleExt];
  }

  return iconMap.defaultFile;
}

/**
 * Returns a webview URI for a folder icon.
 */
export function getFolderIconUri(iconMap: IconMap | null, isOpen: boolean, folderName?: string): string | null {
  if (!iconMap) return null;

  // match folder specific icons (e.g. src, tests)
  if (folderName && iconMap.byFolderName) {
    const lower = folderName.toLowerCase();
    if (iconMap.byFolderName[lower]) return iconMap.byFolderName[lower];
  }

  return isOpen ? iconMap.folderOpen : iconMap.folder;
}
