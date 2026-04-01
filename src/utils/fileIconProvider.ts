import * as vscode from 'vscode';

import { PACKAGE_JSON, VSCODE_CONFIG } from '../constants';

// ── Shared type (also imported by the webview via types/index.ts) ────────────

export interface IconMap {
  /** lowercase extension (e.g. "ts", "test.ts") → webview URI string */
  byExtension: Record<string, string>;
  /** lowercase filename (e.g. "package.json") → webview URI string */
  byFileName: Record<string, string>;
  /** lowercase folder name (e.g. "src", "tests") → webview URI string */
  byFolderName: Record<string, string>;
  /** Fallback file icon */
  defaultFile: string;
  /** Folder icon (closed) */
  folder: string;
  /** Folder icon (open / expanded) */
  folderOpen: string;
}

// ── Internal icon-theme JSON shape ──────────────────────────────────────────

interface ThemeDoc {
  iconDefinitions: Record<string, { iconPath?: string }>;
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  folderNames?: Record<string, string>;
  folder?: string;
  folderExpanded?: string;
  file?: string;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export class FileIconProvider {
  private static _cached: {
    themeId: string;
    doc: ThemeDoc;
    /** Absolute directory URI containing the theme JSON file */
    themeDirUri: vscode.Uri;
    /** Root of the extension that provides the theme (for localResourceRoots) */
    extensionRoot: vscode.Uri;
  } | null = null;

  // ── Public helpers ─────────────────────────────────────────────────────────

  /**
   * The parent directory shared by all user-installed extensions.
   * Pass this to `localResourceRoots` so the webview can load icons.
   */
  static get userExtensionsRoot(): vscode.Uri | undefined {
    const ext = vscode.extensions.all.find((e) => !e.packageJSON?.isBuiltin);
    if (!ext) return undefined;
    // Get the parent directory of the extension
    const parts = ext.extensionUri.path.split('/');
    if (parts.length <= 1) return undefined;
    return ext.extensionUri.with({ path: parts.slice(0, -1).join('/') });
  }

  /**
   * The built-in extensions directory that ships with VS Code.
   */
  static get builtinExtensionsRoot(): vscode.Uri {
    return vscode.Uri.joinPath(vscode.Uri.parse(vscode.env.appRoot), 'extensions');
  }

  /**
   * Resolve icons for a set of filenames and folder names, returning a compact map.
   */
  static async buildIconMap(
    webview: vscode.Webview,
    fileNames: string[],
    folderNames: string[] = [],
  ): Promise<IconMap | null> {
    const loaded = await this._loadTheme();
    if (!loaded) return null;

    const { doc, themeDirUri } = loaded;

    /** Convert a theme-relative icon path → webview URI string (or ''). */
    const resolve = (iconKey: string | undefined): string => {
      if (!iconKey) return '';
      const def = doc.iconDefinitions[iconKey];
      if (!def?.iconPath) return '';
      const iconUri = vscode.Uri.joinPath(themeDirUri, def.iconPath);
      return webview.asWebviewUri(iconUri).toString();
    };

    const map: IconMap = {
      byExtension: {},
      byFileName: {},
      byFolderName: {},
      defaultFile: resolve(doc.file),
      folder: resolve(doc.folder),
      folderOpen: resolve(doc.folderExpanded ?? doc.folder),
    };

    // Helper for case-insensitive lookup
    const findInRecord = (record: Record<string, string> | undefined, key: string) => {
      if (!record) return undefined;
      // Exact match
      if (record[key]) return record[key];
      // Dot fallback (some themes include the dot)
      if (record[`.${key}`]) return record[`.${key}`];

      const lower = key.toLowerCase();
      const realKey = Object.keys(record).find((k) => {
        const lk = k.toLowerCase();
        return lk === lower || lk === `.${lower}`;
      });
      return realKey ? record[realKey] : undefined;
    };

    // 1. Resolve folder-specific icons if they exist (e.g. "src", "tests")
    const lowerFolderNames = new Set(folderNames.map((f) => f.toLowerCase()));
    for (const fName of lowerFolderNames) {
      const folderKey = findInRecord(doc.folderNames, fName);
      if (folderKey) {
        map.byFolderName[fName] = resolve(folderKey);
      }
    }

    // 2. Resolve file icons
    const lowerFileNames = new Set(fileNames.map((n) => n.toLowerCase()));

    for (const name of lowerFileNames) {
      // Exact filename match
      const byNameKey = findInRecord(doc.fileNames, name);
      if (byNameKey) {
        map.byFileName[name] = resolve(byNameKey);
        continue; // Exact filename match prioritized
      }

      // Extension matches
      const parts = name.split('.');
      if (parts.length > 1) {
        // Try multi-part extensions (e.g. .test.ts) then single (e.g. .ts)
        for (let i = 1; i < parts.length; i++) {
          const ext = parts.slice(i).join('.');
          const extKey = findInRecord(doc.fileExtensions, ext);
          if (extKey && !map.byExtension[ext]) {
            map.byExtension[ext] = resolve(extKey);
          }
        }
      }
    }

    return map;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private static async _loadTheme() {
    const themeId = vscode.workspace.getConfiguration(VSCODE_CONFIG.WORKBENCH).get<string>(VSCODE_CONFIG.ICON_THEME);

    if (!themeId) return null;

    // Return cached if unchanged
    if (this._cached?.themeId === themeId) {
      return this._cached;
    }

    for (const ext of vscode.extensions.all) {
      const themes: Array<{ id: string; path: string }> =
        ext.packageJSON?.[PACKAGE_JSON.CONTRIBUTES]?.[PACKAGE_JSON.ICON_THEMES] ?? [];

      for (const theme of themes) {
        if (theme.id !== themeId) continue;

        const themeUri = vscode.Uri.joinPath(ext.extensionUri, theme.path);
        try {
          const raw = await vscode.workspace.fs.readFile(themeUri);
          const doc = JSON.parse(new TextDecoder().decode(raw)) as ThemeDoc;
          // Get theme dir URI (parent of themeUri)
          const parts = themeUri.path.split('/');
          const themeDirUri = themeUri.with({ path: parts.slice(0, -1).join('/') });

          this._cached = {
            themeId,
            doc,
            themeDirUri,
            extensionRoot: ext.extensionUri,
          };
          return this._cached;
        } catch {
          /* malformed theme JSON or file not found – skip */
        }
      }
    }

    return null; // theme not found
  }
}
