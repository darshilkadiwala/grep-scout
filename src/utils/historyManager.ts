import * as vscode from 'vscode';

import { SEARCH_CONFIG, STORAGE_KEYS, VSCODE_CONFIG } from '../constants';

export class HistoryManager {
  constructor(private context: vscode.ExtensionContext) {}

  getHistory(): string[] {
    return this.context.workspaceState.get<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
  }

  getHistoryLimit(): number {
    return (
      vscode.workspace.getConfiguration(VSCODE_CONFIG.SECTION).get(VSCODE_CONFIG.KEYS.HISTORY_LIMIT) ||
      SEARCH_CONFIG.HISTORY_LIMIT
    );
  }

  addToHistory(query: string) {
    let history = this.getHistory();
    // Remove existing to push to the end
    history = history.filter((h) => h !== query);
    history.unshift(query);
    // Limit history
    history = history.slice(0, this.getHistoryLimit());
    this.context.workspaceState.update(STORAGE_KEYS.SEARCH_HISTORY, history);
  }

  clearHistory() {
    this.context.workspaceState.update(STORAGE_KEYS.SEARCH_HISTORY, undefined);
  }
}
