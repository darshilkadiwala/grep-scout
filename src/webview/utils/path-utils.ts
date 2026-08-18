/**
 * Formats a path into a clean, platform-native display string.
 * On Windows, normalizes drive letter to uppercase (e.g. D:\...) and replaces forward slashes with backslashes.
 */
export function formatPath(rawPath: string): string {
  if (!rawPath) return '';
  try {
    let clean = decodeURIComponent(rawPath.replace(/^file:\/\//, ''));

    // Check for Windows drive letter (e.g. /d:/... or d:/... or d:\...)
    if (/^\/?[a-zA-Z]:[\\/]/.test(clean)) {
      clean = clean.replace(/^\/?([a-zA-Z]):/, (_, drive) => `${drive.toUpperCase()}:`);
      clean = clean.replace(/\//g, '\\');
    }
    return clean;
  } catch {
    return rawPath;
  }
}

export function getDisplayPath(displayPath: string | undefined, fullPath: string): string {
  const path = displayPath || fullPath;
  return formatPath(path);
}

/**
 * Returns user-friendly Git status label (e.g. 'M' -> 'Modified')
 */
export function getGitStatusLabel(status?: string): string {
  if (!status) return '';
  switch (status) {
    case 'M':
      return 'Modified';
    case 'U':
      return 'Untracked';
    case 'A':
      return 'Added';
    case 'D':
      return 'Deleted';
    case 'R':
      return 'Renamed';
    case 'I':
      return 'Ignored';
    case 'C':
      return 'Conflict';
    default:
      return status;
  }
}
