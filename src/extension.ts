import * as vscode from 'vscode';

import { COMMANDS, CONTEXT_KEYS, LOG_MESSAGES, VIEWS } from './constants';
import { FileCacheController } from './controllers/FileCacheController';
import { SearchSidebarProvider } from './providers/SearchSidebarProvider';
import { HistoryManager } from './utils/historyManager';

/**
 * Global Logger for the extension
 */
export const outputChannel = vscode.window.createOutputChannel(VIEWS.CONTAINER.TITLE);

export function activate(context: vscode.ExtensionContext) {
  outputChannel.appendLine(LOG_MESSAGES.CACHE_REFRESHING);

  // Initialize file cache immediately on activation
  FileCacheController.init().catch((err) => {
    const msg = `${LOG_MESSAGES.CACHE_INIT_FAILED} ${err}`;
    outputChannel.appendLine(msg);
    console.error(msg);
  });

  const historyManager = new HistoryManager(context);

  const sidebarProvider = new SearchSidebarProvider(context.extensionUri, historyManager);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(VIEWS.SIDEBAR.ID, sidebarProvider));

  // Set context to allow menus/keys to know the extension is ready
  vscode.commands.executeCommand(COMMANDS.VSCODE_SET_CONTEXT, CONTEXT_KEYS.READY, true);

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.OPEN, () => {
      vscode.commands.executeCommand(COMMANDS.VSCODE_VIEW_EXTENSION_CONTAINER);
      vscode.commands.executeCommand(COMMANDS.SIDEBAR_FOCUS);
    }),
  );

  // Command to manually refresh the cache (can be invoked from sidebar UI or Title Bar)
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.REFRESH_CACHE, async () => {
      await sidebarProvider.refresh();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.SCM_COLLAPSE_ALL, () => {
      vscode.commands.executeCommand(COMMANDS.VSCODE_LIST_COLLAPSE_ALL);
    }),
  );

  // Internal command that does the actual work
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.REFRESH_CACHE_INTERNAL, async () => {
      await FileCacheController.refresh();
    }),
  );
}

export function deactivate() {
  FileCacheController.dispose();
}
