import * as vscode from 'vscode';

const HISTORY_KEY = 'fileSearch.searchHistory';

export class HistoryManager {
  constructor(private context: vscode.ExtensionContext) {}

  getHistory(): string[] {
    return this.context.workspaceState.get<string[]>(HISTORY_KEY) || [];
  }

  addToHistory(query: string) {
    let history = this.getHistory();
    // Remove existing to push to the end
    history = history.filter((h) => h !== query);
    history.unshift(query);
    // Limit history
    history = history.slice(0, 50);
    this.context.workspaceState.update(HISTORY_KEY, history);
  }

  clearHistory() {
    this.context.workspaceState.update(HISTORY_KEY, undefined);
  }
}
