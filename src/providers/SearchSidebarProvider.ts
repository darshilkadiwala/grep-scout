import * as vscode from 'vscode';

import { SearchController } from '../controllers/SearchController';
import { ExtensionMessage, WebviewMessage } from '../types';
import { FileIconProvider } from '../utils/fileIconProvider';
import { HistoryManager } from '../utils/historyManager';

export class SearchSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'filescout.sidebar';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly historyManager: HistoryManager,
  ) {}

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
        case 'search': {
          if (data.payload.query) {
            this.historyManager.addToHistory(data.payload.query);
          }
          const results = await SearchController.search(data.payload);
          this._view?.webview.postMessage({ type: 'results', payload: results } as ExtensionMessage);

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
          this._view?.webview.postMessage({ type: 'iconMap', payload: iconMap } as ExtensionMessage);
          break;
        }
        case 'openFile': {
          SearchController.openFile(data.payload);
          break;
        }
        case 'getHistory': {
          const history = this.historyManager.getHistory();
          this._view?.webview.postMessage({ type: 'history', payload: history } as ExtensionMessage);
          this._sendHasWorkspace();
          break;
        }
        case 'refreshCache': {
          await this.refresh();
          break;
        }
        case 'openFolder': {
          vscode.commands.executeCommand('workbench.action.addRootFolder');
          break;
        }
      }
    });

    vscode.workspace.onDidChangeWorkspaceFolders(() => this._sendHasWorkspace());
  }

  /**
   * Manually trigger a cache refresh with webview progress indication
   */
  public async refresh() {
    this._view?.webview.postMessage({ type: 'refreshingStart' } as ExtensionMessage);
    await vscode.commands.executeCommand('filescout.refreshCacheInternal');
    this._view?.webview.postMessage({ type: 'refreshingEnd' } as ExtensionMessage);
    this._view?.webview.postMessage({ type: 'cacheRefreshed' } as ExtensionMessage);
  }

  /** Flip the folder search toggle inside the webview (triggered via Title Bar command) */
  public toggleDirMode() {
    this._view?.webview.postMessage({ type: 'toggleDirMode' } as ExtensionMessage);
  }

  private _sendHasWorkspace() {
    const has = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
    this._view?.webview.postMessage({ type: 'hasWorkspace', payload: has } as ExtensionMessage);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'index.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'index.css'));
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
