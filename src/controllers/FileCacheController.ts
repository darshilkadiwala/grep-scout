import * as vscode from 'vscode';

export class FileCacheController {
  private static files: vscode.Uri[] = [];
  private static watcher: vscode.FileSystemWatcher | null = null;
  private static isInitialized = false;

  public static async init() {
    if (this.isInitialized) return;
    await this.refresh();
    this.setupWatcher();
    this.isInitialized = true;
  }

  public static async refresh() {
    console.log('[FileCache] Refreshing cache...');
    // We get ALL files initially.
    // Note: vscode.workspace.findFiles with '**/*' handles .gitignore if configured,
    // but here we just want a broad pool that we can filter later.
    this.files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
    console.log(`[FileCache] Cached ${this.files.length} files.`);
  }

  private static setupWatcher() {
    if (this.watcher) this.watcher.dispose();

    this.watcher = vscode.workspace.createFileSystemWatcher('**/*');

    this.watcher.onDidCreate((uri) => {
      // Add if not already there (shouldn't be, but safe)
      if (!this.files.find((f) => f.toString() === uri.toString())) {
        this.files.push(uri);
      }
    });

    this.watcher.onDidDelete((uri) => {
      this.files = this.files.filter((f) => f.toString() !== uri.toString());
    });

    // onDidChange usually refers to content, not name/existence, so we mostly care about Create/Delete.
    // For renames, VS Code usually fires a Delete then a Create.
  }

  public static getAllFiles(): vscode.Uri[] {
    return this.files;
  }

  public static dispose() {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = null;
    }
    this.files = [];
    this.isInitialized = false;
  }
}
