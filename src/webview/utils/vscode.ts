import { AppState } from '@shared';

declare const acquireVsCodeApi: () => {
  postMessage(message: unknown): void;
  getState(): AppState | undefined;
  setState(state: AppState): void;
};

/**
 * Access to the VS Code API from the webview.
 * Note: acquireVsCodeApi() can only be called ONCE per webview session.
 */
export const vscode = acquireVsCodeApi();
