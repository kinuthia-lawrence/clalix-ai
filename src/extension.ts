import * as vscode from "vscode";
import { SidebarProvider } from "./sidebarProvider";

export function activate(context: vscode.ExtensionContext) {

  const sidebarProvider =
    new SidebarProvider(context.extensionUri);

  context.subscriptions.push(

    vscode.window.registerWebviewViewProvider(
      "clalix-ai.sidebar",
      sidebarProvider
    )
  );
}

export function deactivate() {}