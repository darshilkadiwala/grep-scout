import * as vscode from 'vscode';

import { COMMANDS } from '../constants';

interface GitExtension {
  getAPI(version: number): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
  Status: Record<string | number, string | number>;
}

interface Repository {
  state: RepositoryState;
}

interface RepositoryState {
  workingTreeChanges: Change[];
  indexChanges: Change[];
}

interface Change {
  uri: vscode.Uri;
  status: number;
}

export class GitStatusProvider {
  private static _gitApi?: GitAPI;

  private static async getGitApi(): Promise<GitAPI | undefined> {
    if (this._gitApi) {
      return this._gitApi;
    }

    const extension = vscode.extensions.getExtension<GitExtension>(COMMANDS.VSCODE_GIT_EXTENSION);
    if (!extension) {
      return undefined;
    }

    const gitExtension = extension.isActive ? extension.exports : await extension.activate();
    this._gitApi = gitExtension.getAPI(1);
    return this._gitApi;
  }

  /**
   * Returns a map of file path (normalized path string) to git status string
   */
  public static async getStatusMap(): Promise<Map<string, string>> {
    const git = await this.getGitApi();
    if (!git) {
      return new Map();
    }

    const statusMap = new Map<string, string>();

    for (const repo of git.repositories) {
      const state = repo.state;

      // Combine unstaged and staged changes
      const allChanges = [...state.workingTreeChanges, ...state.indexChanges];

      for (const change of allChanges) {
        // Use fsPath for local files, or path for virtual files as the key
        const key = change.uri.fsPath || change.uri.path;
        if (!key) continue;

        const newStatus = this.mapStatus(change.status, git);
        const existing = statusMap.get(key);

        if (existing && existing !== newStatus) {
          // If we have both working tree and index changes, combine them but keep it simple for the badge
          // If either is UNTRACKED, it's UNTRACKED (though usually not possible to have both)
          if (existing === 'UNTRACKED' || newStatus === 'UNTRACKED') {
            statusMap.set(key, 'UNTRACKED');
          } else {
            statusMap.set(key, `${existing}+${newStatus}`);
          }
        } else {
          statusMap.set(key, newStatus);
        }
      }
    }

    return statusMap;
  }

  private static mapStatus(status: number, git?: GitAPI): string {
    // Try to use the Status enum from the Git API if available
    if (git && git.Status) {
      const statusKey = git.Status[status];
      if (typeof statusKey === 'string') {
        return statusKey;
      }
    }

    // Fallback to 0-indexed Status enum values
    switch (status) {
      case 0:
        return 'INDEX_MODIFIED';
      case 1:
        return 'INDEX_ADDED';
      case 2:
        return 'INDEX_DELETED';
      case 3:
        return 'INDEX_RENAMED';
      case 4:
        return 'INDEX_COPIED';
      case 5:
        return 'MODIFIED';
      case 6:
        return 'DELETED';
      case 7:
        return 'UNTRACKED';
      case 8:
        return 'IGNORED';
      case 9:
        return 'INTENT_TO_ADD';
      case 10:
        return 'INTENT_TO_RENAME';
      case 11:
        return 'TYPE_CHANGED';
      case 12:
        return 'ADDED_BY_US';
      case 13:
        return 'ADDED_BY_THEM';
      case 14:
        return 'DELETED_BY_US';
      case 15:
        return 'DELETED_BY_THEM';
      case 16:
        return 'BOTH_ADDED';
      case 17:
        return 'BOTH_DELETED';
      case 18:
        return 'BOTH_MODIFIED';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Returns a concise status code (e.g., 'M', 'A', 'D', 'U')
   */
  public static getConciseStatus(status: string): string {
    if (!status) return '';

    // Handle combined statuses if they exist (e.g. "INDEX_ADDED+MODIFIED")
    const parts = status.split('+');

    // Priority 1: Untracked
    if (parts.some((p) => p === 'UNTRACKED' || p === 'U')) return 'U';

    // Priority 2: Added / Renamed (New files)
    if (parts.some((p) => p.includes('ADDED') || p === 'A' || p.includes('RENAMED') || p === 'R')) {
      // If it's indexed, it might be 'A', if it's working tree it might be 'A' or 'U' depending on Git
      if (parts.some((p) => p.includes('INDEX_ADDED') || p === 'INDEX_ADDED')) return 'A';
      if (parts.some((p) => p.includes('RENAMED'))) return 'R';
      return 'A';
    }

    // Priority 3: Modified
    if (parts.some((p) => p.includes('MODIFIED') || p === 'M')) return 'M';

    // Priority 4: Deleted
    if (parts.some((p) => p.includes('DELETED') || p === 'D')) return 'D';

    // Priority 5: Ignored
    if (parts.some((p) => p === 'IGNORED' || p === 'I')) return 'I';

    // Fallback switch for the whole string if parts check didn't catch it
    if (status.includes('UNTRACKED')) return 'U';
    if (status.includes('MODIFIED')) return 'M';
    if (status.includes('ADDED')) return 'A';
    if (status.includes('DELETED')) return 'D';

    return '';
  }
}
