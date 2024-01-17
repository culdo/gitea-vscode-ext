import * as vscode from 'vscode';

import { Issue } from './issue';
import { IssueProvider } from './issueProvider';
import { Logger } from './logger';
import { showIssueHTML, } from './template.issues';

export function showIssueInWebPanel(issue: Issue, context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'issue',
        issue.title,
        vscode.ViewColumn.Active,
        {
            enableScripts: true
        }
    );
    panel.iconPath = {
        light: vscode.Uri.joinPath(context.extensionUri, "media", "issue.svg"),
        dark: vscode.Uri.joinPath(context.extensionUri, "media", "issue.svg")
    }

    panel.webview.html = showIssueHTML(issue, panel.webview, context.extensionUri);

    return panel;
}

export function activate(context: vscode.ExtensionContext) {
    Logger.init()
    Logger.log('Starting Gitea ...');

    // Array of issues; This is used to determine whether a issue is already open
    // in a tab or not.
    let openIssues: Array<Issue> = [];
    const allIssuesProvider = new IssueProvider("all");

    vscode.window.registerTreeDataProvider('giteaExt.opened-issues', allIssuesProvider);

    vscode.commands.registerCommand('giteaExt.viewIssue', (issue: Issue) => {
        const issueOpenable = openIssues.find((c) => c.id === issue.id) === undefined;

        if (issueOpenable) {
            const panel = showIssueInWebPanel(issue, context);
            openIssues.push(issue);
            panel.onDidDispose((event) => {
                openIssues.splice(openIssues.indexOf(issue), 1);
            });
        }
    });

    vscode.commands.registerCommand('giteaExt.listAllIssues', () => {
        allIssuesProvider.refresh("all");
    });
    vscode.commands.registerCommand('giteaExt.listOpenIssues', () => {
        allIssuesProvider.refresh("open");
    });
    vscode.commands.registerCommand('giteaExt.listClosedIssues', () => {
        allIssuesProvider.refresh("closed");
    });

    vscode.commands.registerCommand('giteaExt.refreshIssues', () => {
        allIssuesProvider.refresh();
    });

    Logger.log('Gitea is ready')
}

export function deactivate() { }
