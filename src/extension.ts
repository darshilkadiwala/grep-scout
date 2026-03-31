import * as vscode from 'vscode';

import { FileCacheController } from './controllers/FileCacheController';
import { SearchSidebarProvider } from './providers/SearchSidebarProvider';
import { HistoryManager } from './utils/historyManager';

export function activate(context: vscode.ExtensionContext) {
  // Initialize file cache immediately on activation
  FileCacheController.init().catch((err) => console.error('[FileCache] Init failed:', err));

  const historyManager = new HistoryManager(context);

  const sidebarProvider = new SearchSidebarProvider(context.extensionUri, historyManager);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SearchSidebarProvider.viewType, sidebarProvider),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('filescout.open', () => {
      vscode.commands.executeCommand('workbench.view.extension.filescout-container');
      vscode.commands.executeCommand('filescout.sidebar.focus');
    }),
  );

  // Command to manually refresh the cache (can be invoked from sidebar UI or Title Bar)
  context.subscriptions.push(
    vscode.commands.registerCommand('filescout.refreshCache', async () => {
      await sidebarProvider.refresh();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('filescout.scmCollapseAll', () => {
      vscode.commands.executeCommand('list.collapseAll');
    }),
  );

  // Internal command that does the actual work
  context.subscriptions.push(
    vscode.commands.registerCommand('filescout.refreshCacheInternal', async () => {
      await FileCacheController.refresh();
    }),
  );
}

export function deactivate() {
  FileCacheController.dispose();
}
