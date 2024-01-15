import * as vscode from 'vscode';

import { showIssueHTML, showIssueMD } from './template.issues';
import { Issue } from './issue';
import { IssueProvider } from './issueProvider';
import { Config } from './config';
import MarkdownIt = require('markdown-it');
import { Logger } from './logger';

export function showIssueInWebPanel(issue: Issue) {
    const panel = vscode.window.createWebviewPanel(
        'issue',
        issue.label,
        vscode.ViewColumn.Active,
        {
            enableScripts: true
        }
    );

    const config = new Config();

    if (config.render == 'html') {
        panel.webview.html = showIssueHTML(issue);
    } else {
        let markdownIt = new MarkdownIt()
        panel.webview.html = markdownIt.render(showIssueMD(issue));
    }

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
        const issueOpenable = openIssues.find((c) => c.issueId === issue.issueId) === undefined;

        if (issueOpenable) {
            const panel = showIssueInWebPanel(issue);
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
