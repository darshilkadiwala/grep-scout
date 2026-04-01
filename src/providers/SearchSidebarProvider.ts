import * as vscode from 'vscode';

import { COMMANDS, EXTENSION_MESSAGES, VSCODE_CONFIG, WEBVIEW_MESSAGES, WEBVIEW_PATHS } from '../constants';
import { SearchController } from '../controllers/SearchController';
import { ExtensionMessage, WebviewMessage } from '../types';
import { FileIconProvider } from '../utils/fileIconProvider';
import { HistoryManager } from '../utils/historyManager';

export class SearchSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly historyManager: HistoryManager,
  ) {
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(VSCODE_CONFIG.SECTION)) {
        this._sendSettings();
      }
    });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    // Allow webview to load resources from:
    //  1. This extension's own dist folder.
    //  2. User-installed extensions directory (icon theme SVGs live here).
    //  3. VS Code built-in extensions directory (default icon themes).
    const localResourceRoots: vscode.Uri[] = [this._extensionUri];
    const userExtsRoot = FileIconProvider.userExtensionsRoot;
    if (userExtsRoot) localResourceRoots.push(userExtsRoot);
    localResourceRoots.push(FileIconProvider.builtinExtensionsRoot);

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots,
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
      switch (data.type) {
        case WEBVIEW_MESSAGES.SEARCH: {
          if (data.payload.query) {
            this.historyManager.addToHistory(data.payload.query);
          }
          const results = await SearchController.search(data.payload);
          this._view?.webview.postMessage({
            type: EXTENSION_MESSAGES.RESULTS,
            payload: results,
          } as ExtensionMessage);

          // Resolve file/folder icons for the current results.
          // Extract all unique folder names in this result set.
          const folderNames = new Set<string>();
          results.forEach((r) => {
            const rel = vscode.workspace.asRelativePath(r.fullPath, false);
            const dirs = rel.split(/[\\/]/).slice(0, -1);
            dirs.forEach((d) => folderNames.add(d));
          });

          const iconMap = await FileIconProvider.buildIconMap(
            webviewView.webview,
            results.map((r) => r.fileName),
            Array.from(folderNames),
          );
          this._view?.webview.postMessage({
            type: EXTENSION_MESSAGES.ICON_MAP,
            payload: iconMap,
          } as ExtensionMessage);
          break;
        }
        case WEBVIEW_MESSAGES.OPEN_FILE: {
          SearchController.openFile(data.payload);
          break;
        }
        case WEBVIEW_MESSAGES.GET_HISTORY: {
          const history = this.historyManager.getHistory();
          this._view?.webview.postMessage({
            type: EXTENSION_MESSAGES.HISTORY,
            payload: history,
          } as ExtensionMessage);
          this._sendHasWorkspace();
          break;
        }
        case WEBVIEW_MESSAGES.REFRESH_CACHE: {
          await this.refresh();
          break;
        }
        case WEBVIEW_MESSAGES.OPEN_FOLDER: {
          vscode.commands.executeCommand(COMMANDS.VSCODE_OPEN_ROOT_FOLDER);
          break;
        }
      }
    });

    vscode.workspace.onDidChangeWorkspaceFolders(() => this._sendHasWorkspace());

    // Initial data sync
    this._sendSettings();
  }

  /**
   * Manually trigger a cache refresh with webview progress indication
   */
  public async refresh() {
    this._view?.webview.postMessage({ type: EXTENSION_MESSAGES.REFRESHING_START } as ExtensionMessage);
    await vscode.commands.executeCommand(COMMANDS.REFRESH_CACHE_INTERNAL);
    this._view?.webview.postMessage({ type: EXTENSION_MESSAGES.REFRESHING_END } as ExtensionMessage);
    this._view?.webview.postMessage({ type: EXTENSION_MESSAGES.CACHE_REFRESHED } as ExtensionMessage);
  }

  /** Flip the folder search toggle inside the webview (triggered via Title Bar command) */
  public toggleDirMode() {
    this._view?.webview.postMessage({ type: EXTENSION_MESSAGES.TOGGLE_DIR_MODE } as ExtensionMessage);
  }

  private _sendSettings() {
    const config = vscode.workspace.getConfiguration(VSCODE_CONFIG.SECTION);
    const settings = {
      maxResults: config.get(VSCODE_CONFIG.KEYS.MAX_RESULTS),
      historyLimit: config.get(VSCODE_CONFIG.KEYS.HISTORY_LIMIT),
      debounceDelay: config.get(VSCODE_CONFIG.KEYS.DEBOUNCE_DELAY),
    };
    this._view?.webview.postMessage({
      type: EXTENSION_MESSAGES.SETTINGS,
      payload: settings,
    } as ExtensionMessage);
  }

  private _sendHasWorkspace() {
    const has = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
    this._view?.webview.postMessage({ type: EXTENSION_MESSAGES.HAS_WORKSPACE, payload: has } as ExtensionMessage);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, WEBVIEW_PATHS.INDEX_JS));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, WEBVIEW_PATHS.INDEX_CSS));
    // img-src is required so the webview can display icon theme SVG/PNG files.
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ${webview.cspSource}; img-src ${webview.cspSource} https: data:; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Advanced File Search</title>
            </head>
            <body>
                <div id="root"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}
