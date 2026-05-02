import * as vscode from "vscode";

export function activate(context) {
  // context.extensionMode === 2 means Development mode
  if (context.extensionMode === 2) {
    context.globalState.update("hasShownRebrandNotice", undefined);
  }

  const hasShown = context.globalState.get("hasShownRebrandNotice", false);
  if (!hasShown) {
    vscode.window.showInformationMessage(
      "FileScout has been rebranded to GrepScout!",
      { 
        modal: true, 
        detail: "We have rebranded our extension and released it as GrepScout. The new extension has been automatically installed for you. You can safely uninstall the old FileScout extension. Click on 'View in Marketplace' below to view it. Visit our repository: https://github.com/darshilkadiwala/grep-scout" 
      },
      "View in Marketplace",
      "Remind me later",
    ).then((selection) => {      
      if (selection === "View in Marketplace") {
        vscode.commands.executeCommand("extension.open", "darshil-dev.grepscout");
        context.globalState.update("hasShownRebrandNotice", true);
      }
    });
  }
}

export function deactivate() {}
